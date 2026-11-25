import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  FileText,
  Cpu,
  Sliders,
  Layers,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Zap,
  Activity,
  Server,
  Database,
  Terminal,
  Clock,
  Sparkles,
  Info,
  Copy,
  Check,
  Radio,
  Users,
  Laptop,
  Smartphone,
  ArrowRight
} from 'lucide-react';
import { PAGE_REPLACEMENT_ALGORITHMS } from '../utils/pageReplacementData';
import { simulatePageReplacement, parseReferenceString } from '../utils/pageReplacementEngine';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import '../components/MultiplayerTopologyLab.css';
import {
  createRoomApi,
  joinRoomApi,
  pollRoomApi,
  pingRoomApi,
  subscribeToRoomBroadcast,
  transmitRoomApi,
  stepRoomApi
} from '../utils/multiplayerRoomManager';
import './PageReplacementLabPage.css';

const PRESET_STRINGS = [
  { name: 'Standard Textbook (Silberschatz)', value: '7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1' },
  { name: "Belady's Anomaly Test Trace", value: '1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5' },
  { name: 'Looping Cyclic Table Scan', value: '1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5' },
  { name: 'High Locality of Reference', value: '2, 3, 2, 1, 5, 2, 4, 5, 3, 2, 5, 2' },
  { name: 'Thrashing Memory Pressure', value: '0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5' }
];

export default function PageReplacementLabPage() {
  const navigate = useNavigate();
  const { algoId } = useParams();

  // Validate or default algorithm
  const currentAlgoKey = algoId && PAGE_REPLACEMENT_ALGORITHMS.some(a => a.id === algoId)
    ? algoId
    : 'fifo';

  const currentAlgo = useMemo(() => {
    return PAGE_REPLACEMENT_ALGORITHMS.find(a => a.id === currentAlgoKey) || PAGE_REPLACEMENT_ALGORITHMS[0];
  }, [currentAlgoKey]);

  // Subheader Tabs: 'theories' | 'functional' | 'practical'
  const [activeTab, setActiveTab] = useState('theories');

  // ==========================================
  // FUNCTIONAL MODEL SIMULATOR STATE
  // ==========================================
  const [refStringInput, setRefStringInput] = useState(PRESET_STRINGS[0].value);
  const [frameCount, setFrameCount] = useState(3);
  const [playbackSpeed, setPlaybackSpeed] = useState(700); // ms per step
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Compute full simulation results
  const simulation = useMemo(() => {
    return simulatePageReplacement(currentAlgoKey, refStringInput, frameCount);
  }, [currentAlgoKey, refStringInput, frameCount]);

  const currentStep = simulation.steps[currentStepIdx] || simulation.steps[0] || null;

  // Auto-play interval
  useEffect(() => {
    let timer = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIdx(prev => {
          if (prev < simulation.steps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, simulation.steps.length]);

  // Reset step when algo or params change
  useEffect(() => {
    setCurrentStepIdx(0);
    setIsPlaying(false);
  }, [currentAlgoKey, refStringInput, frameCount]);

  // ==========================================
  // PRACTICAL ORIENTATION MODE STATE
  // ==========================================
  const { user, isAuthenticated } = useAuth();
  
  // Collaborative 4-Digit Room State
  const [memRoom, setMemRoom] = useState(null);
  const [memRoomCode, setMemRoomCode] = useState('');
  const [isMemHost, setIsMemHost] = useState(false);
  const [memLobbyTab, setMemLobbyTab] = useState('create'); // 'create' | 'join'
  const [memReqNodes, setMemReqNodes] = useState(4);
  const [memJoinCodeInput, setMemJoinCodeInput] = useState('');
  const [memIsSubmitting, setMemIsSubmitting] = useState(false);
  const [memLobbyError, setMemLobbyError] = useState('');
  const [memCopiedCode, setMemCopiedCode] = useState(false);
  const [myAssignedMemNode, setMyAssignedMemNode] = useState('CPU Core 0');

  // Room Creation Handlers
  const handleCreateMemRoom = async (e) => {
    e?.preventDefault();
    setMemIsSubmitting(true);
    setMemLobbyError('');
    try {
      const result = await createRoomApi({
        topologyType: 'page-replacement',
        maxParticipants: memReqNodes,
        hostEmail: user?.email || 'mmu-host@netrium.site',
        hostName: user?.name || 'CPU Host Lead',
        nodes: [
          { id: 'node-cpu', label: 'CPU', name: 'CPU Core 0 (Process Requester)', status: 'online', role: 'requester' },
          { id: 'node-mmu', label: 'MMU', name: 'MMU / TLB Cache', status: 'online', role: 'cache' },
          { id: 'node-ram', label: 'RAM', name: 'Physical RAM Frames', status: 'online', role: 'memory' },
          { id: 'node-swap', label: 'SWP', name: 'NVMe Swap Partition', status: 'online', role: 'storage' }
        ],
        sourceNodeId: 'node-cpu',
        targetNodeId: 'node-ram',
        payloadText: refStringInput
      });
      setMemRoom(result.room);
      setMemRoomCode(result.code);
      setIsMemHost(true);
      setMyAssignedMemNode('CPU Core 0');
    } catch (err) {
      setMemLobbyError(err.message || 'Failed to create memory room.');
    } finally {
      setMemIsSubmitting(false);
    }
  };

  const handleJoinMemRoom = async (e) => {
    e?.preventDefault();
    const clean = memJoinCodeInput.trim().toUpperCase();
    if (clean.length !== 4) {
      setMemLobbyError('Please enter a valid 4-digit code.');
      return;
    }
    setMemIsSubmitting(true);
    setMemLobbyError('');
    try {
      const result = await joinRoomApi({
        code: clean,
        email: user?.email || `mmu-${Date.now()}@netrium.site`,
        name: user?.name || 'Memory Subsystem Node'
      });
      setMemRoom(result.room);
      setMemRoomCode(result.room.code);
      const isHostCheck = (result.room.hostEmail || '').toLowerCase() === (user?.email || '').toLowerCase();
      setIsMemHost(isHostCheck);
      setMyAssignedMemNode(isHostCheck ? 'CPU Core 0' : 'MMU / TLB');
    } catch (err) {
      setMemLobbyError(err.message || 'Room not found. Please verify code.');
    } finally {
      setMemIsSubmitting(false);
    }
  };

  const handleCopyMemRoomCode = () => {
    if (!memRoomCode) return;
    navigator.clipboard.writeText(memRoomCode);
    setMemCopiedCode(true);
    setTimeout(() => setMemCopiedCode(false), 2500);
  };

  const handleLeaveMemRoom = () => {
    if (window.confirm('Are you sure you want to leave this memory simulation room?')) {
      setMemRoom(null);
      setMemRoomCode('');
      setIsMemHost(false);
    }
  };

  // Sync Room Updates across devices
  useEffect(() => {
    if (!memRoomCode) return;
    const unsub = subscribeToRoomBroadcast(memRoomCode, (updatedRoom) => {
      setMemRoom(updatedRoom);
    });
    const pollTimer = setInterval(async () => {
      const r = await pollRoomApi(memRoomCode);
      if (r) setMemRoom(r);
    }, 1200);
    const pingTimer = setInterval(() => {
      pingRoomApi(memRoomCode, user?.email || 'user@netrium.site');
    }, 3800);
    return () => {
      unsub();
      clearInterval(pollTimer);
      clearInterval(pingTimer);
    };
  }, [memRoomCode, user?.email]);
  const [tlbSize, setTlbSize] = useState(4);
  const [virtualAddrInput, setVirtualAddrInput] = useState('0x0040A1F0');
  const [workingSetLoad, setWorkingSetLoad] = useState(65); // 0 - 150%
  const [isThrashing, setIsThrashing] = useState(false);
  const [mmuTranslationLog, setMmuTranslationLog] = useState([]);
  const [diskLatencyMode, setDiskLatencyMode] = useState('nvme'); // 'ram', 'nvme', 'hdd'
  const [pageFaultCount, setPageFaultCount] = useState(14);
  const [tlbHitRate, setTlbHitRate] = useState(91.4);
  const [activeProcessName, setActiveProcessName] = useState('netrium-worker-worker01');
  const terminalRef = useRef(null);

  // Trigger MMU Virtual Address Translation
  const handleTranslateAddress = (e) => {
    e?.preventDefault();
    const hexClean = virtualAddrInput.replace(/^0x/i, '');
    const addr = parseInt(hexClean, 16) || 0x40A1F0;
    const vpn = (addr >> 12) & 0xFFFFF; // 4KB pages (offset = 12 bits)
    const offset = addr & 0xFFF;
    const isTlbHit = Math.random() < (tlbHitRate / 100);
    const isPageFault = !isTlbHit && Math.random() < (workingSetLoad > 100 ? 0.75 : 0.15);

    const time = new Date().toLocaleTimeString();
    const diskPenalty = diskLatencyMode === 'hdd' ? '10.2ms (HDD Seek)' : diskLatencyMode === 'nvme' ? '12.4µs (NVMe PCIe)' : '100ns (RAM Hit)';

    let logEntry;
    if (isTlbHit) {
      logEntry = {
        id: Date.now(),
        time,
        type: 'hit',
        message: `TLB HIT: Virtual Address 0x${addr.toString(16).toUpperCase()} [VPN ${vpn}] translated to Physical Frame #${(vpn % frameCount)} in 1.2ns. Offset: 0x${offset.toString(16)}.`
      };
    } else if (isPageFault) {
      setPageFaultCount(prev => prev + 1);
      logEntry = {
        id: Date.now(),
        time,
        type: 'fault',
        message: `PAGE FAULT TRAP [IRQ 14]: Virtual Page #${vpn} marked INVALID in Page Table. Trapped to kernel kswapd. Evicting via ${currentAlgo.name}. Disk I/O delay: ${diskPenalty}.`
      };
    } else {
      logEntry = {
        id: Date.now(),
        time,
        type: 'walk',
        message: `TLB MISS -> Page Table Walk: VPN #${vpn} found in physical RAM Frame #${(vpn % frameCount)} [Valid Bit = 1]. TLB updated with entry.`
      };
    }

    setMmuTranslationLog(prev => [logEntry, ...prev.slice(0, 49)]);
  };

  // Toggle memory thrashing storm
  const toggleThrashingStorm = () => {
    if (!isThrashing) {
      setIsThrashing(true);
      setWorkingSetLoad(145);
      setTlbHitRate(42.1);
      setMmuTranslationLog(prev => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          type: 'danger',
          message: `CRITICAL: Memory Overcommit 145%. Working set exceeds physical RAM. Continuous page replacement cycles initiated; CPU I/O wait spiked to 88%!`
        },
        ...prev
      ]);
    } else {
      setIsThrashing(false);
      setWorkingSetLoad(65);
      setTlbHitRate(91.4);
      setMmuTranslationLog(prev => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          type: 'info',
          message: `Memory pressure stabilized. Working set returned to 65% capacity. Page fault frequency normalized.`
        },
        ...prev
      ]);
    }
  };

  return (
    <div className="topolab-viewport">
      {/* Persistent Global Navbar */}
      <Navbar onOpenFacility={(facilityId) => {
        if (facilityId === 'multi-mesh' || facilityId === 'topologies') navigate('/topologies');
        else if (facilityId === 'packet-trace' || facilityId === 'cdn') navigate('/cdn');
        else if (facilityId === 'dsa-algo' || facilityId === 'dsa') navigate('/dsa');
        else if (facilityId === 'virt-memory' || facilityId === 'paging' || facilityId === 'page-replacement') navigate('/page-replacement');
        else if (facilityId === 'os-kernel' || facilityId === 'routing') navigate('/routing');
        else navigate('/');
      }} />

      {/* ======================================================== */}
      {/* 1. TOP HEADER & ALGORITHM SELECTOR DOCK                 */}
      {/* ======================================================== */}
      <header className="topolab-header">
        <div className="topolab-header-left">
          <button
            type="button"
            className="topolab-back-btn"
            onClick={() => navigate('/page-replacement')}
            aria-label="Back to all algorithms"
          >
            <ArrowLeft size={16} />
            <span>All Algorithms</span>
          </button>
          <span className="topolab-sep">/</span>
          <div className="topolab-title-group">
            <span className="topolab-category-tag">OPERATING SYSTEMS VIRTUAL MEMORY</span>
            <h1 className="topolab-title">{currentAlgo.name}</h1>
          </div>
        </div>

        {/* Algorithm Switcher Dropdown */}
        <div className="topolab-header-right">
          <div className="topolab-selector-box">
            <label htmlFor="algo-select" className="selector-label">Select Algorithm:</label>
            <select
              id="algo-select"
              className="topolab-select"
              value={currentAlgoKey}
              onChange={(e) => navigate(`/page-replacement/${e.target.value}`)}
            >
              {PAGE_REPLACEMENT_ALGORITHMS.map((algo) => (
                <option key={algo.id} value={algo.id}>
                  {algo.name} [{algo.complexity}]
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. SUBHEADER TABS: Theories | Functional | Practical      */}
      {/* ======================================================== */}
      <nav className="topolab-subheader-tabs">
        <div className="topolab-tabs-container">
          <div className="topolab-tabs-dock">
            <button
              type="button"
              className={`topolab-tab-btn ${activeTab === 'theories' ? 'active' : ''}`}
              onClick={() => setActiveTab('theories')}
            >
              <FileText size={15} />
              <span className="tab-title-text">Theories & Specs</span>
              <span className="tab-pill-badge">Curriculum</span>
            </button>

            <button
              type="button"
              className={`topolab-tab-btn ${activeTab === 'functional' ? 'active' : ''}`}
              onClick={() => setActiveTab('functional')}
            >
              <Cpu size={15} />
              <span className="tab-title-text">Functional Model</span>
              <span className="tab-pill-badge live-pulse">Interactive</span>
            </button>

            <button
              type="button"
              className={`topolab-tab-btn ${activeTab === 'practical' ? 'active' : ''}`}
              onClick={() => setActiveTab('practical')}
            >
              <Sliders size={15} />
              <span className="tab-title-text">Practical Oriented</span>
              <span className="tab-pill-badge">Kernel MMU</span>
            </button>
          </div>

          <div className="topolab-subheader-meta">
            <span className="meta-dot live" />
            <span className="meta-label">PAGING MMU HARDWARE ONLINE · 4KB PAGES</span>
          </div>
        </div>
      </nav>

      {/* ======================================================== */}
      {/* 3. MAIN VIEWPORT AREA                                   */}
      {/* ======================================================== */}
      <main className="topolab-content-area">
        {/* ====================================================== */}
        {/* TAB 1: THEORIES & ARCHITECTURAL CURRICULUM             */}
        {/* ====================================================== */}
        {activeTab === 'theories' && (
          <div className="topolab-theory-layout">
            <div className="theory-main-column">
              <div className="theory-concept-card">
                <div className="theory-badge-row">
                  <span className="theory-cat-badge">{currentAlgo.category.toUpperCase()}</span>
                  <span className="theory-std-badge">TIME: {currentAlgo.complexity}</span>
                  {currentAlgo.beladysAnomaly && (
                    <span className="theory-tag red">BELADY'S ANOMALY VULNERABLE</span>
                  )}
                  {!currentAlgo.beladysAnomaly && (
                    <span className="theory-tag green">STACK ALGORITHM (IMMUNE)</span>
                  )}
                </div>

                <h2 className="theory-heading">Understanding {currentAlgo.name}</h2>
                <p className="theory-lead-p">{currentAlgo.leadSummary}</p>
                <p className="theory-body-text">{currentAlgo.concept}</p>
              </div>

              {/* 01: Hardware & Signal Mechanics */}
              <div className="theory-content-card">
                <div className="theory-card-header-row">
                  <div className="theory-card-number">01</div>
                  <h3 className="theory-card-title">{currentAlgo.signalPhysics.title}</h3>
                </div>
                <p className="theory-body-text">{currentAlgo.signalPhysics.description}</p>
                <div className="theory-key-facts-grid">
                  {currentAlgo.signalPhysics.facts.map((fact, i) => (
                    <div key={i} className="theory-fact-item">
                      <span className="fact-label">{fact.label}:</span>
                      <strong className="fact-value">{fact.val}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* 02: Mathematical Formalism & Proofs */}
              <div className="theory-content-card">
                <div className="theory-card-header-row">
                  <div className="theory-card-number">02</div>
                  <h3 className="theory-card-title">{currentAlgo.mathematics.title}</h3>
                </div>
                <div className="theory-formula-box">
                  <code>{currentAlgo.mathematics.formula}</code>
                </div>
                <p className="theory-body-text">{currentAlgo.mathematics.description}</p>
              </div>

              {/* 03: Pros & Cons Comparison */}
              <div className="theory-pros-cons-grid">
                <div className="theory-pros-card">
                  <h4 className="pros-title text-emerald-400">Architectural Strengths</h4>
                  <ul className="theory-bullet-list">
                    {currentAlgo.pros.map((pro, i) => (
                      <li key={i}>{pro}</li>
                    ))}
                  </ul>
                </div>

                <div className="theory-cons-card">
                  <h4 className="cons-title text-rose-400">Architectural Trade-offs</h4>
                  <ul className="theory-bullet-list">
                    {currentAlgo.cons.map((con, i) => (
                      <li key={i}>{con}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 04: Real-World OS Deployments */}
              <div className="theory-content-card">
                <div className="theory-card-header-row">
                  <div className="theory-card-number">03</div>
                  <h3 className="theory-card-title">Production Kernel Deployments</h3>
                </div>
                <p className="theory-body-text">{currentAlgo.osDeployment}</p>
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="theory-side-column">
              <div className="theory-specs-card">
                <h3 className="sidebar-heading">Algorithm Metadata</h3>
                <div className="spec-row">
                  <span className="spec-label">Time Complexity:</span>
                  <span className="spec-value text-emerald-400">{currentAlgo.complexity}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Hardware Needed:</span>
                  <span className="spec-value text-cyan-400">{currentAlgo.hardwareNeeded}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Belady Anomaly:</span>
                  <span className={`spec-value ${currentAlgo.beladysAnomaly ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {currentAlgo.beladysAnomaly ? 'Yes (Vulnerable)' : 'No (Stack Protected)'}
                  </span>
                </div>
              </div>

              <div className="theory-specs-card">
                <h3 className="sidebar-heading">All 12 Page Replacement Algorithms</h3>
                <div className="algo-quick-links">
                  {PAGE_REPLACEMENT_ALGORITHMS.map(a => (
                    <button
                      key={a.id}
                      type="button"
                      className={`algo-quick-link-btn ${a.id === currentAlgoKey ? 'active' : ''}`}
                      onClick={() => navigate(`/page-replacement/${a.id}`)}
                    >
                      <span>{a.shortName}</span>
                      <span className="text-xs text-slate-500">{a.complexity}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================== */}
        {/* TAB 2: FUNCTIONAL MODEL (INTERACTIVE SIMULATOR)       */}
        {/* ====================================================== */}
        {activeTab === 'functional' && (
          <div className="topolab-interactive-layout">
            {/* LEFT CONTROLS DOCK */}
            <div className="interactive-controls-dock">
              <div className="panel-card">
                <div className="panel-header">
                  <Sliders size={15} />
                  <h3 className="panel-title">Trace & Frame Parameters</h3>
                </div>

                {/* Preset Reference Trace Dropdown */}
                <div className="control-group">
                  <label className="control-label">Preset Reference Traces:</label>
                  <select
                    className="control-select"
                    onChange={(e) => setRefStringInput(e.target.value)}
                  >
                    {PRESET_STRINGS.map((p, i) => (
                      <option key={i} value={p.value}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Custom Reference String Input */}
                <div className="control-group">
                  <label className="control-label">Page Reference Trace String:</label>
                  <input
                    type="text"
                    className="control-input font-mono"
                    value={refStringInput}
                    onChange={(e) => setRefStringInput(e.target.value)}
                    placeholder="e.g. 7, 0, 1, 2, 0, 3, 0, 4"
                  />
                  <span className="text-xs text-slate-400">Total References: {simulation.totalReferences} pages</span>
                </div>

                {/* Frame Count Slider */}
                <div className="control-group">
                  <div className="flex justify-between items-center mb-1">
                    <label className="control-label">Physical Frame Capacity:</label>
                    <span className="control-badge text-emerald-400">{frameCount} Frames</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="8"
                    value={frameCount}
                    onChange={(e) => setFrameCount(parseInt(e.target.value, 10))}
                    className="control-slider"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>2 Frames</span>
                    <span>8 Frames</span>
                  </div>
                </div>

                {/* Playback Controls */}
                <div className="control-group">
                  <label className="control-label">Step Execution Controls:</label>
                  <div className="playback-buttons-row">
                    <button
                      type="button"
                      className="playback-btn"
                      onClick={() => setCurrentStepIdx(0)}
                      disabled={currentStepIdx === 0}
                      title="Reset to step 0"
                    >
                      <RotateCcw size={14} />
                    </button>
                    <button
                      type="button"
                      className="playback-btn"
                      onClick={() => setCurrentStepIdx(prev => Math.max(0, prev - 1))}
                      disabled={currentStepIdx === 0}
                      title="Step Backward"
                    >
                      <SkipBack size={14} />
                    </button>
                    <button
                      type="button"
                      className={`playback-btn primary ${isPlaying ? 'playing' : ''}`}
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause size={15} /> : <Play size={15} />}
                      <span>{isPlaying ? 'Pause' : 'Play'}</span>
                    </button>
                    <button
                      type="button"
                      className="playback-btn"
                      onClick={() => setCurrentStepIdx(prev => Math.min(simulation.steps.length - 1, prev + 1))}
                      disabled={currentStepIdx >= simulation.steps.length - 1}
                      title="Step Forward"
                    >
                      <SkipForward size={14} />
                    </button>
                  </div>
                </div>

                {/* Playback Speed Slider */}
                <div className="control-group">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Playback Speed:</span>
                    <span>{playbackSpeed}ms / step</span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="1500"
                    step="50"
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(parseInt(e.target.value, 10))}
                    className="control-slider"
                  />
                </div>
              </div>

              {/* Cumulative Metrics Box */}
              <div className="panel-card">
                <div className="panel-header">
                  <Activity size={15} />
                  <h3 className="panel-title">Telemetry Telemetry</h3>
                </div>
                <div className="metrics-summary-grid">
                  <div className="metric-cell">
                    <span className="metric-label">Page Hits</span>
                    <strong className="metric-number text-emerald-400">{currentStep?.totalHits ?? 0}</strong>
                  </div>
                  <div className="metric-cell">
                    <span className="metric-label">Page Faults</span>
                    <strong className="metric-number text-rose-400">{currentStep?.totalFaults ?? 0}</strong>
                  </div>
                  <div className="metric-cell">
                    <span className="metric-label">Hit Ratio</span>
                    <strong className="metric-number text-cyan-400">{currentStep?.hitRatio ?? 0}%</strong>
                  </div>
                  <div className="metric-cell">
                    <span className="metric-label">Fault Ratio</span>
                    <strong className="metric-number text-amber-400">{currentStep?.faultRatio ?? 0}%</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIMULATION STAGE */}
            <div className="interactive-stage-area">
              {/* Conveyor Belt of References */}
              <div className="conveyor-container">
                <div className="conveyor-header">
                  <span className="conveyor-title">Memory Reference String Stream:</span>
                  <span className="conveyor-step-counter">
                    Step {currentStepIdx + 1} of {simulation.steps.length}
                  </span>
                </div>
                <div className="conveyor-stream">
                  {simulation.pages.map((p, idx) => {
                    const isPast = idx < currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    return (
                      <div
                        key={idx}
                        className={`stream-page-pill ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''}`}
                        onClick={() => setCurrentStepIdx(idx)}
                      >
                        <span className="stream-idx">{idx + 1}</span>
                        <strong className="stream-val">{p}</strong>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Current Status Announcement HUD */}
              <div className={`status-hud-banner ${currentStep?.isHit ? 'hud-hit' : 'hud-fault'}`}>
                <div className="flex items-center gap-2">
                  {currentStep?.isHit ? (
                    <CheckCircle2 size={18} className="text-emerald-400" />
                  ) : (
                    <AlertTriangle size={18} className="text-rose-400" />
                  )}
                  <span className="hud-status-badge">
                    PAGE {currentStep?.page}: {currentStep?.isHit ? 'CACHE HIT' : 'PAGE FAULT'}
                  </span>
                </div>
                <div className="hud-log-text">{currentStep?.log}</div>
              </div>

              {/* Physical Memory Frames Grid Visualizer */}
              <div className="frames-visualizer-card">
                <div className="frames-header">
                  <div className="flex items-center gap-2">
                    <Server size={16} className="text-emerald-400" />
                    <h3 className="frames-title">Physical Memory Frame Allocator</h3>
                  </div>
                  <span className="frames-meta">
                    {currentAlgo.name} • {frameCount} Frames Allocated
                  </span>
                </div>

                <div className="frames-grid" style={{ gridTemplateColumns: `repeat(${frameCount}, 1fr)` }}>
                  {currentStep?.frames.map((slot, sIdx) => {
                    const isEmpty = slot.page === null;
                    return (
                      <div
                        key={sIdx}
                        className={`frame-slot-card ${slot.isHit ? 'slot-hit' : ''} ${slot.isVictim ? 'slot-victim' : ''} ${slot.isClockHand ? 'slot-clockhand' : ''}`}
                      >
                        <div className="slot-header">
                          <span className="slot-id">FRAME #{sIdx}</span>
                          {slot.isClockHand && (
                            <span className="clock-pointer-badge">CLOCK HAND</span>
                          )}
                          {slot.isVictim && (
                            <span className="victim-badge">EVICTED</span>
                          )}
                          {slot.isHit && (
                            <span className="hit-badge">HIT</span>
                          )}
                        </div>

                        <div className="slot-body">
                          {isEmpty ? (
                            <div className="empty-slot-label">[EMPTY]</div>
                          ) : (
                            <div className="slot-page-number">PAGE {slot.page}</div>
                          )}
                        </div>

                        {/* Algorithm-Specific Metadata Badges */}
                        {!isEmpty && (
                          <div className="slot-footer-meta">
                            {currentAlgoKey === 'aging' && (
                              <div className="meta-tag">
                                <span>Age:</span>
                                <code className="font-mono text-cyan-300">{slot.ageBin}</code>
                              </div>
                            )}
                            {(currentAlgoKey === 'enhanced-second-chance' || currentAlgoKey === 'nru') && (
                              <div className="meta-tag">
                                <span>(R,M):</span>
                                <strong className="text-amber-400">({slot.refBit}, {slot.dirtyBit})</strong>
                              </div>
                            )}
                            {(currentAlgoKey === 'second-chance' || currentAlgoKey === 'clock') && (
                              <div className="meta-tag">
                                <span>Ref Bit:</span>
                                <strong className={slot.refBit ? 'text-emerald-400' : 'text-slate-400'}>
                                  R = {slot.refBit}
                                </strong>
                              </div>
                            )}
                            {(currentAlgoKey === 'lfu' || currentAlgoKey === 'mfu') && (
                              <div className="meta-tag">
                                <span>Freq:</span>
                                <strong className="text-cyan-400">{slot.freq}x</strong>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Complete Step-by-Step History Matrix Table */}
              <div className="history-table-card">
                <div className="history-header">
                  <h3 className="history-title">Execution State Matrix</h3>
                  <span className="text-xs text-slate-400">Click any row to jump state</span>
                </div>
                <div className="table-responsive">
                  <table className="matrix-table">
                    <thead>
                      <tr>
                        <th>Step</th>
                        <th>Page</th>
                        <th>Status</th>
                        {Array.from({ length: frameCount }).map((_, f) => (
                          <th key={f}>Frame {f}</th>
                        ))}
                        <th>Victim</th>
                        <th>Cumulative Faults</th>
                      </tr>
                    </thead>
                    <tbody>
                      {simulation.steps.map((st, i) => {
                        const isCurrentRow = i === currentStepIdx;
                        return (
                          <tr
                            key={i}
                            className={`matrix-row ${isCurrentRow ? 'active-row' : ''}`}
                            onClick={() => setCurrentStepIdx(i)}
                          >
                            <td className="font-mono">{i + 1}</td>
                            <td className="font-bold text-slate-200">{st.page}</td>
                            <td>
                              <span className={`status-pill ${st.isHit ? 'hit' : 'fault'}`}>
                                {st.isHit ? 'HIT' : 'FAULT'}
                              </span>
                            </td>
                            {st.frames.map((fr, fIdx) => (
                              <td
                                key={fIdx}
                                className={`frame-val-cell ${fr.isHit ? 'cell-hit' : ''} ${fr.isVictim ? 'cell-victim' : ''}`}
                              >
                                {fr.page !== null ? fr.page : '-'}
                              </td>
                            ))}
                            <td className="text-rose-400 font-mono">
                              {st.victimPage !== null ? `Page ${st.victimPage}` : '-'}
                            </td>
                            <td className="font-mono text-slate-300">
                              {st.totalFaults} ({st.faultRatio}%)
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================== */}
        {/* TAB 3: STANDARDIZED PRACTICAL ORIENTATION (KERNEL MMU) */}
        {/* CONTROLS ON LEFT (DESKTOP) / ON TOP (MOBILE)          */}
        {/* CHARTS, MMU & LOGBOOKS ON RIGHT (DESKTOP) / BOTTOM    */}
        {/* ====================================================== */}
        {activeTab === 'practical' && !memRoom && (
          <div className="net-multiplayer-lobby">
            <div className="lobby-hero-card">
              <div className="lobby-pill-row">
                <span className="lobby-mode-pill">
                  <Radio size={12} className="live-spin" />
                  <span>4-Digit Multiplayer Room Lobby</span>
                </span>
                <span className="lobby-topo-badge">MEMORY SUBSYSTEM CLUSTER</span>
              </div>
              <h2 className="lobby-title">Multi-Device Distributed Memory & Paging Lab</h2>
              <p className="lobby-subtitle">
                Connect multiple physical or virtual devices into a distributed memory management hierarchy using a 4-digit code. Each device operates an essential hardware role: CPU Requester, MMU / TLB Cache, Physical RAM Pool, or NVMe Swap Controller.
              </p>

              <div className="lobby-tabs-switcher">
                <button
                  type="button"
                  className={`lobby-tab-btn ${memLobbyTab === 'create' ? 'active' : ''}`}
                  onClick={() => { setMemLobbyTab('create'); setMemLobbyError(''); }}
                >
                  <Sparkles size={14} />
                  <span>Create Simulation Room</span>
                </button>
                <button
                  type="button"
                  className={`lobby-tab-btn ${memLobbyTab === 'join' ? 'active' : ''}`}
                  onClick={() => { setMemLobbyTab('join'); setMemLobbyError(''); }}
                >
                  <Radio size={14} />
                  <span>Join with 4-Digit Code</span>
                </button>
              </div>

              {memLobbyError && (
                <div className="lobby-alert-error">
                  <AlertTriangle size={15} />
                  <span>{memLobbyError}</span>
                </div>
              )}

              {memLobbyTab === 'create' && (
                <form onSubmit={handleCreateMemRoom} className="lobby-form-pane">
                  <div className="lobby-field-group">
                    <label className="lobby-label">
                      <Sliders size={14} />
                      <span>How many devices in this memory cluster?</span>
                    </label>
                    <div className="node-count-selector">
                      {[2, 3, 4, 5, 6].map(num => (
                        <button
                          key={num}
                          type="button"
                          className={`node-count-btn ${memReqNodes === num ? 'active' : ''}`}
                          onClick={() => setMemReqNodes(num)}
                        >
                          <span className="count-num">{num}</span>
                          <span className="count-label">Devices</span>
                        </button>
                      ))}
                    </div>
                    <p className="field-hint">
                      Exactly {memReqNodes} devices will participate. You will be designated as the <strong>CPU Core 0 (Process Requester)</strong>. Other devices bind to MMU, RAM, and Swap controllers.
                    </p>
                  </div>

                  <div className="lobby-summary-box">
                    <div className="summary-row">
                      <span>Replacement Algorithm:</span>
                      <strong>{currentAlgo.name}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Capacity Limit:</span>
                      <strong>{memReqNodes} Connected Subsystems</strong>
                    </div>
                    <div className="summary-row">
                      <span>Master Controller (Host):</span>
                      <strong className="text-cyan-400">{user?.name || 'Local Machine'} (Assigned: CPU Core 0)</strong>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="lobby-action-submit-btn"
                    disabled={memIsSubmitting}
                  >
                    <Sparkles size={16} />
                    <span>{memIsSubmitting ? 'Generating 4-Digit Room...' : 'Create Memory Simulation Room'}</span>
                  </button>
                </form>
              )}

              {memLobbyTab === 'join' && (
                <form onSubmit={handleJoinMemRoom} className="lobby-form-pane">
                  <div className="lobby-field-group">
                    <label className="lobby-label">
                      <Radio size={14} />
                      <span>Enter 4-Digit Room Code</span>
                    </label>
                    <div className="room-code-input-wrapper">
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="e.g. 4819"
                        value={memJoinCodeInput}
                        onChange={(e) => setMemJoinCodeInput(e.target.value.replace(/[^0-9]/g, ''))}
                        className="room-code-large-input"
                        autoFocus
                      />
                    </div>
                    <p className="field-hint">
                      Ask the room owner for their 4-digit code. You will automatically receive an MMU, RAM, or Swap station role upon joining.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="lobby-action-submit-btn"
                    disabled={memIsSubmitting || memJoinCodeInput.trim().length !== 4}
                  >
                    <Users size={16} />
                    <span>{memIsSubmitting ? 'Connecting...' : 'Join Memory Lab Room'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ACTIVE MULTI-DEVICE MEMORY ARENA */}
        {activeTab === 'practical' && memRoom && (
          <div className="net-multiplayer-arena">

            {/* ARENA HEADER BAR */}
            <header className="arena-header-bar">
              <div className="arena-header-left">
                <div className="arena-code-card">
                  <span className="code-label">4-DIGIT ROOM CODE</span>
                  <div className="code-display-row">
                    <span className="code-digits">{memRoom.code}</span>
                    <button
                      type="button"
                      className="code-copy-btn"
                      onClick={handleCopyMemRoomCode}
                      title="Copy 4-digit code to invite other devices"
                    >
                      {memCopiedCode ? <Check size={14} className="copied-icon" /> : <Copy size={14} />}
                      <span>{memCopiedCode ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>
                </div>

                <div className="arena-topo-meta">
                  <span className="topo-tag">{currentAlgo.name.toUpperCase()} MMU</span>
                  <div className="capacity-pill">
                    <Users size={13} />
                    <span>
                      {memRoom.participants.length} / {memRoom.maxParticipants} Devices Connected
                    </span>
                  </div>
                </div>
              </div>

              <div className="arena-header-actions">
                <button
                  type="button"
                  className="arena-leave-btn"
                  onClick={handleLeaveMemRoom}
                >
                  <span>Exit Room</span>
                </button>
              </div>
            </header>

            {/* CONNECTED DEVICES ROSTER */}
            <section className="arena-roster-section">
              <div className="roster-header">
                <div className="roster-title-wrap">
                  <Radio size={14} className="live-spin" />
                  <h3 className="roster-title">Connected Devices & Assigned Memory Subsystem Roles</h3>
                </div>
                <span className="roster-sub">
                  Live heartbeat synchronized &bull; Green = Online &bull; Coordinated address translations
                </span>
              </div>

              <div className="roster-cards-grid">
                {memRoom.participants.map((p, idx) => {
                  const isMe = (p.email || '').toLowerCase().trim() === (user?.email || '').toLowerCase().trim();
                  const isHostUser = (p.email || '').toLowerCase().trim() === (memRoom.hostEmail || '').toLowerCase().trim();
                  const roleNames = ['CPU Core 0 (Requester)', 'MMU / TLB Cache', 'Physical RAM Frames', 'NVMe Swap Disk'];
                  const roleName = roleNames[idx % roleNames.length];
                  const roleLetter = idx === 0 ? 'CPU' : idx === 1 ? 'MMU' : idx === 2 ? 'RAM' : 'SWP';

                  return (
                    <div
                      key={p.email || idx}
                      className={`roster-participant-card ${isMe ? 'is-my-device' : ''} ${p.isOnline ? 'online' : 'offline'}`}
                    >
                      <div className="roster-card-header">
                        <div className="live-status-dot-wrap">
                          <span className={`live-status-dot ${p.isOnline ? 'green' : 'red'}`} />
                          <span className="live-status-label">{p.isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                        </div>
                        {isHostUser && <span className="host-badge">HOST / MASTER CPU</span>}
                        {isMe && <span className="me-badge">THIS DEVICE</span>}
                      </div>

                      <div className="roster-user-info">
                        <span className="roster-email" title={p.email}>{p.email}</span>
                        <span className="roster-name">{p.name || 'Subsystem Controller'}</span>
                      </div>

                      <div className="roster-station-role">
                        <div
                          className="assigned-node-pill"
                          style={{
                            borderColor: idx === 0 ? '#06b6d4' : idx === 1 ? '#10b981' : idx === 2 ? '#3b82f6' : '#ec4899'
                          }}
                        >
                          <span
                            className="node-letter-badge"
                            style={{
                              background: idx === 0 ? '#06b6d4' : idx === 1 ? '#10b981' : idx === 2 ? '#3b82f6' : '#ec4899'
                            }}
                          >
                            {roleLetter}
                          </span>
                          <span className="node-role-name">
                            {roleName}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {Array.from({ length: Math.max(0, memRoom.maxParticipants - memRoom.participants.length) }).map((_, slotIdx) => (
                  <div key={`empty-${slotIdx}`} className="roster-empty-slot">
                    <span className="empty-slot-plus">+</span>
                    <span className="empty-slot-text">Waiting for device to join...</span>
                    <span className="empty-slot-hint">Code: {memRoom.code}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* TWO COLUMN VIEW: CONTROLS LEFT (DESKTOP) / TOP (MOBILE), STAGE RIGHT */}
            <div className="topolab-practical-orientation-view memory-practical-orientation">
            {/* ==================================================== */}
            {/* LEFT COLUMN: ALL INTERACTIVE CONTROLS                 */}
            {/* ==================================================== */}
            <div className="practical-controls-col">
              {/* 1. Address Generator & Translation Trigger */}
              <div className="chaos-card-full">
                <div className="chaos-card-header">
                  <div className="flex items-center gap-2">
                    <Cpu size={18} className="text-cyan-400" />
                    <h3 className="chaos-card-title">MMU Virtual Address Probe</h3>
                  </div>
                  <span className="chaos-header-badge">HARDWARE TRANSLATION</span>
                </div>
                <p className="chaos-card-desc">
                  Issue arbitrary CPU memory read/write requests. The MMU evaluates the TLB, consults Page Tables, and triggers Page Fault traps on missing frames:
                </p>

                <form onSubmit={handleTranslateAddress} className="control-group">
                  <label className="control-label">Hex Virtual Address (32/64-bit):</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="control-input font-mono flex-1"
                      value={virtualAddrInput}
                      onChange={(e) => setVirtualAddrInput(e.target.value)}
                      placeholder="e.g. 0x0040A1F0"
                    />
                    <button type="submit" className="action-button-accent">
                      <Zap size={14} />
                      <span>Translate</span>
                    </button>
                  </div>
                </form>

                <div className="quick-addr-chips">
                  <span className="text-xs text-slate-400">Quick Addresses:</span>
                  <button type="button" className="addr-chip" onClick={() => setVirtualAddrInput('0x0040A1F0')}>Code Segment (0x40A1F0)</button>
                  <button type="button" className="addr-chip" onClick={() => setVirtualAddrInput('0x7FFF98E0')}>Stack Pointer (0x7FFF98)</button>
                  <button type="button" className="addr-chip" onClick={() => setVirtualAddrInput('0x1000B200')}>Heap Block (0x1000B2)</button>
                </div>
              </div>

              {/* 2. Memory Architecture & TLB Configuration */}
              <div className="chaos-card-full">
                <div className="chaos-card-header">
                  <div className="flex items-center gap-2">
                    <Sliders size={18} className="text-emerald-400" />
                    <h3 className="chaos-card-title">Memory & Hardware Parameters</h3>
                  </div>
                  <span className="chaos-header-badge">MMU CONFIG</span>
                </div>

                <div className="control-group">
                  <label className="control-label">TLB Cache Entries:</label>
                  <div className="flex gap-2">
                    {[4, 8, 16, 32].map(num => (
                      <button
                        key={num}
                        type="button"
                        className={`tlb-pill-btn ${tlbSize === num ? 'active' : ''}`}
                        onClick={() => {
                          setTlbSize(num);
                          setTlbHitRate(num === 4 ? 82.5 : num === 8 ? 91.4 : 96.8);
                        }}
                      >
                        {num} Entries
                      </button>
                    ))}
                  </div>
                </div>

                <div className="control-group">
                  <label className="control-label">Secondary Storage Swap Medium:</label>
                  <select
                    className="control-select"
                    value={diskLatencyMode}
                    onChange={(e) => setDiskLatencyMode(e.target.value)}
                  >
                    <option value="nvme">NVMe PCIe Gen4 M.2 SSD (~12.4µs latency)</option>
                    <option value="hdd">Rotational SATA HDD 7200 RPM (~10.2ms seek)</option>
                    <option value="ram">ZRAM Compressed RAM Block Device (~350ns)</option>
                  </select>
                </div>

                <div className="control-group">
                  <label className="control-label">Target Workload Process:</label>
                  <select
                    className="control-select"
                    value={activeProcessName}
                    onChange={(e) => setActiveProcessName(e.target.value)}
                  >
                    <option value="netrium-worker-worker01">netrium-worker-worker01 [PID 4192, 12 Threads]</option>
                    <option value="postgres-backend-db">postgres-backend-db [PID 1802, Shared Buffers]</option>
                    <option value="v8-chrome-isolate">v8-chrome-isolate [PID 8820, Heavy GC]</option>
                  </select>
                </div>
              </div>

              {/* 3. Memory Pressure & Thrashing Stress Injector */}
              <div className="chaos-card-full">
                <div className="chaos-card-header">
                  <div className="flex items-center gap-2">
                    <Flame size={18} className="text-rose-400" />
                    <h3 className="chaos-card-title">Memory Pressure & Thrashing</h3>
                  </div>
                  <span className={`chaos-status-pill ${isThrashing ? 'danger' : 'success'}`}>
                    {isThrashing ? 'THRASHING SPIKE' : 'STABLE'}
                  </span>
                </div>
                <p className="chaos-card-desc">
                  Simulate high memory demand exceeding physical RAM. Forces rapid page faults and disk swap write thrashing:
                </p>

                <div className="control-group">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Working Set Overcommit:</span>
                    <strong className={workingSetLoad > 100 ? 'text-rose-400' : 'text-emerald-400'}>
                      {workingSetLoad}% RAM Capacity
                    </strong>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="160"
                    value={workingSetLoad}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      setWorkingSetLoad(v);
                      setIsThrashing(v > 100);
                      if (v > 100) setTlbHitRate(45.2);
                      else setTlbHitRate(91.4);
                    }}
                    className="control-slider"
                  />
                </div>

                <button
                  type="button"
                  className={`stress-test-btn ${isThrashing ? 'active-melt' : ''}`}
                  onClick={toggleThrashingStorm}
                >
                  <Flame size={15} />
                  <span>{isThrashing ? 'Halt Memory Thrashing Storm' : 'Trigger Working Set Thrashing (145%)'}</span>
                </button>
              </div>
            </div>

            {/* ==================================================== */}
            {/* RIGHT COLUMN: CHARTS, HARDWARE MMU & LOGBOOKS        */}
            {/* ==================================================== */}
            <div className="practical-stage-col">
              {/* 1. Real-Time Hardware Performance HUD */}
              <div className="chaos-hud-strip">
                <div className="chaos-hud-card">
                  <div className="chaos-hud-header">
                    <span className="chaos-hud-label">Translation Lookaside Buffer</span>
                    <span className="chaos-status-pill success">L1 CACHE</span>
                  </div>
                  <div className="chaos-hud-metric">
                    <span className="metric-val text-emerald-400">{tlbHitRate}%</span>
                    <span className="metric-sub">TLB Hit Ratio</span>
                  </div>
                  <div className="chaos-hud-subtext">{tlbSize} Hardware CAM Entries</div>
                </div>

                <div className="chaos-hud-card">
                  <div className="chaos-hud-header">
                    <span className="chaos-hud-label">Kernel Page Fault Handler</span>
                    <span className={`chaos-status-pill ${isThrashing ? 'danger' : 'success'}`}>
                      {isThrashing ? 'IRQ 14 STORM' : 'NOMINAL'}
                    </span>
                  </div>
                  <div className="chaos-hud-metric">
                    <span className={`metric-val ${isThrashing ? 'text-rose-400' : 'text-cyan-400'}`}>
                      {pageFaultCount}
                    </span>
                    <span className="metric-sub">Total Page Faults</span>
                  </div>
                  <div className="chaos-hud-subtext">Handling via {currentAlgo.shortName}</div>
                </div>

                <div className="chaos-hud-card">
                  <div className="chaos-hud-header">
                    <span className="chaos-hud-label">Swap Disk Penalty</span>
                    <span className="chaos-status-pill warning">{diskLatencyMode.toUpperCase()}</span>
                  </div>
                  <div className="chaos-hud-metric">
                    <span className="metric-val text-amber-400">
                      {diskLatencyMode === 'hdd' ? '10.2 ms' : diskLatencyMode === 'nvme' ? '12.4 µs' : '350 ns'}
                    </span>
                    <span className="metric-sub">I/O Wait on Evict</span>
                  </div>
                  <div className="chaos-hud-subtext">Physical write-back latency</div>
                </div>

                <div className="chaos-hud-card reset-card">
                  <div className="chaos-hud-header">
                    <span className="chaos-hud-label">Thrashing Metric</span>
                    <span className={`chaos-status-pill ${isThrashing ? 'danger live-pulse' : 'success'}`}>
                      {isThrashing ? 'CRITICAL' : 'OPTIMAL'}
                    </span>
                  </div>
                  <div className="chaos-hud-metric">
                    <span className={`metric-val ${isThrashing ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {isThrashing ? '88% Wait' : '4% Wait'}
                    </span>
                    <span className="metric-sub">CPU Swap Thrash Index</span>
                  </div>
                  <button
                    type="button"
                    className="chaos-emergency-reset-btn"
                    onClick={() => {
                      setIsThrashing(false);
                      setWorkingSetLoad(65);
                      setTlbHitRate(91.4);
                      setPageFaultCount(0);
                    }}
                  >
                    <RotateCcw size={13} />
                    <span>Reset Telemetry</span>
                  </button>
                </div>
              </div>

              {/* 2. Interactive Hardware MMU Translation Pipeline Diagram */}
              <div className="chaos-card-full">
                <div className="chaos-card-header">
                  <div className="flex items-center gap-2">
                    <Server size={18} className="text-emerald-400" />
                    <h3 className="chaos-card-title">MMU Virtual-to-Physical Address Translation Pipeline</h3>
                  </div>
                  <span className="chaos-header-badge">x86-64 PAGING</span>
                </div>

                <div className="mmu-pipeline-diagram">
                  <div className="pipeline-node cpu-node">
                    <span className="p-title">CPU Core</span>
                    <span className="p-sub">Emits Virtual Addr</span>
                    <code className="p-code">{virtualAddrInput}</code>
                  </div>

                  <div className="pipeline-arrow">➔</div>

                  <div className="pipeline-node mmu-node">
                    <span className="p-title">Hardware MMU</span>
                    <span className="p-sub">Splits VPN + Offset</span>
                    <span className="p-badge">4KB Paging</span>
                  </div>

                  <div className="pipeline-arrow">➔</div>

                  <div className="pipeline-node tlb-node">
                    <span className="p-title">TLB Cache ({tlbSize})</span>
                    <span className="p-sub">1.2ns Access</span>
                    <span className="text-xs text-emerald-400">{tlbHitRate}% Hit Rate</span>
                  </div>

                  <div className="pipeline-arrow">➔</div>

                  <div className="pipeline-node ram-node">
                    <span className="p-title">Page Table & RAM</span>
                    <span className="p-sub">100ns RAM Access</span>
                    <span className="text-xs text-cyan-400">{currentAlgo.shortName} Eviction</span>
                  </div>
                </div>
              </div>

              {/* 3. Live Kernel Page Table & TLB Inspector */}
              <div className="chaos-card-full">
                <div className="chaos-card-header">
                  <div className="flex items-center gap-2">
                    <Database size={18} className="text-cyan-400" />
                    <h3 className="chaos-card-title">Live Hardware Page Table & Frame Registry</h3>
                  </div>
                  <span className="chaos-header-badge">PID {activeProcessName.split('[')[1]?.replace(']', '') || '4192'}</span>
                </div>

                <div className="table-responsive">
                  <table className="matrix-table text-xs">
                    <thead>
                      <tr>
                        <th>Virtual Page #</th>
                        <th>Physical Frame #</th>
                        <th>Valid Bit</th>
                        <th>Reference Bit</th>
                        <th>Dirty Bit</th>
                        <th>Protection</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 6 }).map((_, idx) => {
                        const isValid = idx < frameCount;
                        const isDirty = idx % 2 === 0;
                        return (
                          <tr key={idx}>
                            <td className="font-mono text-cyan-300">VPN #0x{((0x40A + idx * 4)).toString(16).toUpperCase()}</td>
                            <td className="font-mono">{isValid ? `Frame #${idx}` : 'SWAP DISK'}</td>
                            <td>
                              <span className={`status-pill ${isValid ? 'hit' : 'fault'}`}>
                                {isValid ? 'VALID' : 'INVALID'}
                              </span>
                            </td>
                            <td className="font-mono">{isValid ? 'R=1' : 'R=0'}</td>
                            <td className="font-mono">{isDirty ? 'M=1 (DIRTY)' : 'M=0 (CLEAN)'}</td>
                            <td className="text-slate-400">READ / WRITE / EXEC</td>
                            <td className="text-slate-300">
                              {isValid ? 'In Physical RAM' : 'Backed to Secondary Storage'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4. Real-Time Kernel Trap Logbook */}
              <div className="chaos-card-full">
                <div className="chaos-card-header">
                  <div className="flex items-center gap-2">
                    <Terminal size={18} className="text-emerald-400" />
                    <h3 className="chaos-card-title">Kernel Page Fault & MMU Event Log</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="telemetry-live-dot" />
                    <span className="text-xs text-slate-400 font-mono">STREAM ACTIVE</span>
                    <button
                      type="button"
                      className="chaos-clear-logs-btn"
                      onClick={() => setMmuTranslationLog([])}
                      title="Clear logbook"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="chaos-terminal-full" ref={terminalRef}>
                  {mmuTranslationLog.length === 0 ? (
                    <div className="terminal-empty">
                      <span>Kernel MMU log stream idle. Enter a virtual address on the left and click "Translate" or trigger memory pressure...</span>
                    </div>
                  ) : (
                    mmuTranslationLog.map((log) => (
                      <div key={log.id} className={`terminal-line-v2 ${log.type}`}>
                        <span className="text-slate-500 font-mono">[{log.time}]</span>{' '}
                        <span>{log.message}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
          </div>
        )}
      </main>
    </div>
  );
}
