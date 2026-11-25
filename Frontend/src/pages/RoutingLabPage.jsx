import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  FileText,
  Cpu,
  Sliders,
  GitFork,
  ArrowLeft,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Zap,
  Activity,
  Server,
  Database,
  Terminal,
  Radio,
  Network,
  Shield,
  Send,
  Scissors,
  Laptop,
  Smartphone,
  Compass,
  Crosshair,
  ArrowRight,
  Users,
  Globe,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';
import { ROUTING_ALGORITHMS } from '../utils/routingAlgorithmData';
import {
  DEFAULT_ROUTERS,
  DEFAULT_LINKS,
  computeAllRoutingTables,
  tracePacketForwarding
} from '../utils/routingEngine';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
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
import './RoutingLabPage.css';

export default function RoutingLabPage() {
  const navigate = useNavigate();
  const { algoId } = useParams();

  // Validate or default algorithm
  const currentAlgoKey = algoId && ROUTING_ALGORITHMS.some(a => a.id === algoId)
    ? algoId
    : 'ospf';

  const currentAlgo = useMemo(() => {
    return ROUTING_ALGORITHMS.find(a => a.id === currentAlgoKey) || ROUTING_ALGORITHMS[0];
  }, [currentAlgoKey]);

  // Subheader Tabs: 'theories' | 'functional' | 'practical'
  const [activeTab, setActiveTab] = useState('theories');

  // ==========================================
  // FUNCTIONAL MODEL SIMULATOR STATE
  // ==========================================
  const [sourceRouter, setSourceRouter] = useState('R1');
  const [targetRouter, setTargetRouter] = useState('R6');
  const [selectedInspectRouter, setSelectedInspectRouter] = useState('R1');
  const [severedLinks, setSeveredLinks] = useState([]);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [activePacketHop, setActivePacketHop] = useState(null);
  const [packetTraceResult, setPacketTraceResult] = useState(null);

  // Dynamic Routing Tables
  const routingTables = useMemo(() => {
    return computeAllRoutingTables(currentAlgoKey, DEFAULT_ROUTERS, DEFAULT_LINKS, severedLinks);
  }, [currentAlgoKey, severedLinks]);

  // Handle packet transmission animation
  const handleFirePacket = () => {
    const trace = tracePacketForwarding(sourceRouter, targetRouter, routingTables, DEFAULT_LINKS);
    setPacketTraceResult(trace);
    setIsTransmitting(true);
    setActivePacketHop(0);

    let currentHopIndex = 0;
    const interval = setInterval(() => {
      currentHopIndex++;
      if (currentHopIndex < trace.hops.length) {
        setActivePacketHop(currentHopIndex);
      } else {
        clearInterval(interval);
        setIsTransmitting(false);
      }
    }, 600);
  };

  // Toggle severed link
  const toggleSeverLink = (linkId) => {
    setSeveredLinks(prev =>
      prev.includes(linkId) ? prev.filter(id => id !== linkId) : [...prev, linkId]
    );
  };

  // ==========================================
  // MULTI-DEVICE & NODE SELECTION ROUTING STATE
  // ==========================================
  const { user, isAuthenticated } = useAuth();
  const routingRoomHost = user?.name || 'Local Machine (Room Host)';
  
  // Collaborative 4-Digit Room State
  const [routingRoom, setRoutingRoom] = useState(null);
  const [routingRoomCode, setRoutingRoomCode] = useState('');
  const [isRoutingHost, setIsRoutingHost] = useState(false);
  const [routingLobbyTab, setRoutingLobbyTab] = useState('create'); // 'create' | 'join'
  const [routingReqNodes, setRoutingReqNodes] = useState(6);
  const [routingJoinCodeInput, setRoutingJoinCodeInput] = useState('');
  const [routingIsSubmitting, setRoutingIsSubmitting] = useState(false);
  const [routingLobbyError, setRoutingLobbyError] = useState('');
  const [routingCopiedCode, setRoutingCopiedCode] = useState(false);
  const [myAssignedRouter, setMyAssignedRouter] = useState('R2');

  // Room Creation Handlers
  const handleCreateRoutingRoom = async (e) => {
    e?.preventDefault();
    setRoutingIsSubmitting(true);
    setRoutingLobbyError('');
    try {
      const result = await createRoomApi({
        topologyType: 'routing',
        maxParticipants: routingReqNodes,
        hostEmail: user?.email || 'router-host@netrium.site',
        hostName: user?.name || 'AS65001 Gateway Host',
        nodes: DEFAULT_ROUTERS.slice(0, routingReqNodes).map((r, i) => ({
          id: `node-${r.id.toLowerCase()}`,
          label: r.id,
          name: `Router ${r.id} (${r.name})`,
          status: 'online',
          role: i === 0 ? 'gateway' : 'router'
        })),
        sourceNodeId: 'node-r1',
        targetNodeId: `node-r${routingReqNodes}`,
        payloadText: practicalPayload
      });
      setRoutingRoom(result.room);
      setRoutingRoomCode(result.code);
      setIsRoutingHost(true);
      setMyAssignedRouter('R1');
    } catch (err) {
      setRoutingLobbyError(err.message || 'Failed to create routing room.');
    } finally {
      setRoutingIsSubmitting(false);
    }
  };

  const handleJoinRoutingRoom = async (e) => {
    e?.preventDefault();
    const clean = routingJoinCodeInput.trim().toUpperCase();
    if (clean.length !== 4) {
      setRoutingLobbyError('Please enter a valid 4-digit numeric code.');
      return;
    }
    setRoutingIsSubmitting(true);
    setRoutingLobbyError('');
    try {
      const result = await joinRoomApi({
        code: clean,
        email: user?.email || `router-${Date.now()}@netrium.site`,
        name: user?.name || 'Router Node'
      });
      setRoutingRoom(result.room);
      setRoutingRoomCode(result.room.code);
      const isHostCheck = (result.room.hostEmail || '').toLowerCase() === (user?.email || '').toLowerCase();
      setIsRoutingHost(isHostCheck);
      setMyAssignedRouter(isHostCheck ? 'R1' : 'R2');
    } catch (err) {
      setRoutingLobbyError(err.message || 'Room not found. Please verify code.');
    } finally {
      setRoutingIsSubmitting(false);
    }
  };

  const handleCopyRoutingRoomCode = () => {
    if (!routingRoomCode) return;
    navigator.clipboard.writeText(routingRoomCode);
    setRoutingCopiedCode(true);
    setTimeout(() => setRoutingCopiedCode(false), 2500);
  };

  const handleLeaveRoutingRoom = () => {
    if (window.confirm('Are you sure you want to exit this collaborative routing room?')) {
      setRoutingRoom(null);
      setRoutingRoomCode('');
      setIsRoutingHost(false);
    }
  };

  // Sync Room Updates across devices
  useEffect(() => {
    if (!routingRoomCode) return;
    const unsub = subscribeToRoomBroadcast(routingRoomCode, (updatedRoom) => {
      setRoutingRoom(updatedRoom);
    });
    const pollTimer = setInterval(async () => {
      const r = await pollRoomApi(routingRoomCode);
      if (r) setRoutingRoom(r);
    }, 1200);
    const pingTimer = setInterval(() => {
      pingRoomApi(routingRoomCode, user?.email || 'user@netrium.site');
    }, 3800);
    return () => {
      unsub();
      clearInterval(pollTimer);
      clearInterval(pingTimer);
    };
  }, [routingRoomCode, user?.email]);
  const [practicalSourceRouter, setPracticalSourceRouter] = useState('R1');
  const [practicalTargetRouter, setPracticalTargetRouter] = useState('R6');
  const [practicalPayload, setPracticalPayload] = useState('BGP/OSPF Routing Database Sync & Mission Payload');
  const [isPracticalTransmitting, setIsPracticalTransmitting] = useState(false);
  const [practicalActiveHopIdx, setPracticalActiveHopIdx] = useState(0);
  const [practicalTraceResult, setPracticalTraceResult] = useState(null);
  const [gpsDetecting, setGpsDetecting] = useState(false);
  const [gpsBoundCity, setGpsBoundCity] = useState('Chicago Transit Area (Midwest Anchor)');

  // GPS Auto-bind
  const handleDetectGpsAndBind = () => {
    if (!navigator.geolocation) {
      alert('Geolocation API not supported by browser.');
      return;
    }
    setGpsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setGpsDetecting(false);
        const routerCoords = {
          R1: { lat: 40.71, lon: -74.00, city: 'New York (East Coast Gateway)' },
          R2: { lat: 41.87, lon: -87.62, city: 'Chicago Transit (Midwest Backbone)' },
          R3: { lat: 32.77, lon: -96.79, city: 'Dallas Core (South Central)' },
          R4: { lat: 39.73, lon: -104.99, city: 'Denver Distribution (Mountain)' },
          R5: { lat: 47.60, lon: -122.33, city: 'Seattle Edge (Northwest Hub)' },
          R6: { lat: 34.05, lon: -118.24, city: 'Los Angeles Cloud (Pacific Egress)' }
        };
        let closest = 'R2';
        let minDist = Infinity;
        Object.entries(routerCoords).forEach(([rid, c]) => {
          const d = Math.hypot(latitude - c.lat, longitude - c.lon);
          if (d < minDist) {
            minDist = d;
            closest = rid;
          }
        });
        setMyAssignedRouter(closest);
        setGpsBoundCity(routerCoords[closest].city);
        setCliRouter(closest);
      },
      (err) => {
        console.warn('GPS error:', err);
        setGpsDetecting(false);
        setMyAssignedRouter('R2');
        setGpsBoundCity('Chicago Transit (Default Anchor)');
      },
      { timeout: 8000 }
    );
  };

  // Run Practical Routed Packet Traversal
  const handleRunPracticalTransmission = () => {
    if (isPracticalTransmitting) return;
    const trace = tracePacketForwarding(practicalSourceRouter, practicalTargetRouter, routingTables, DEFAULT_LINKS);
    setPracticalTraceResult(trace);
    setIsPracticalTransmitting(true);
    setPracticalActiveHopIdx(0);

    let idx = 0;
    const timer = setInterval(() => {
      idx++;
      if (idx < trace.hops.length) {
        setPracticalActiveHopIdx(idx);
      } else {
        clearInterval(timer);
        setIsPracticalTransmitting(false);
      }
    }, 850);
  };

  // ==========================================
  // PRACTICAL ORIENTATION MODE STATE
  // ==========================================
  const [cliCommand, setCliCommand] = useState('show ip route');
  const [cliOutput, setCliOutput] = useState('');
  const [cliRouter, setCliRouter] = useState('R1');
  const [convergenceTimeMs, setConvergenceTimeMs] = useState(4.2);
  const [wiresharkFilter, setWiresharkFilter] = useState('all');
  const [snifferLogs, setSnifferLogs] = useState([]);
  const terminalRef = useRef(null);

  // Generate Router CLI output for selected command
  const executeCliCommand = (cmd = cliCommand) => {
    const time = new Date().toLocaleTimeString();
    const router = DEFAULT_ROUTERS.find(r => r.id === cliRouter) || DEFAULT_ROUTERS[0];
    const table = routingTables[cliRouter] || [];

    let output = '';
    if (cmd === 'show ip route') {
      output = `
${router.name}# show ip route
Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP
       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area 
       i - IS-IS, su - IS-IS summary, * - candidate default, U - per-user static route

Gateway of last resort is ${currentAlgoKey === 'default' ? '10.0.2.1 to network 0.0.0.0' : 'not set'}

${table.map(e => `${e.protocol.slice(0, 2).padEnd(4)} ${e.destination.padEnd(18)} [${e.ad}/${e.metric}] via ${e.nextHop}, ${e.interface}`).join('\n')}
`;
    } else if (cmd === 'show ip ospf neighbor') {
      output = `
${router.name}# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
10.0.2.1          1   FULL/BDR        00:00:34    10.1.2.2        GigabitEthernet0/0
10.0.3.1          1   FULL/DR         00:00:31    10.1.3.2        GigabitEthernet0/1
`;
    } else if (cmd === 'show ip eigrp topology') {
      output = `
${router.name}# show ip eigrp topology
EIGRP-IPv4 VRF(default) Topology Table for AS(100)/ID(10.0.1.1)
Codes: P - Passive, A - Active, U - Update, Q - Query, R - Reply, r - reply Status

P 10.0.4.0/24, 1 successors, FD is 30720
        via 10.0.2.1 (30720/28160), GigabitEthernet0/0
        via 10.0.3.1 (41216/35840), GigabitEthernet0/1 [Feasible Successor]
`;
    } else if (cmd.startsWith('ping')) {
      const target = DEFAULT_ROUTERS.find(r => r.id === targetRouter) || DEFAULT_ROUTERS[5];
      const trace = tracePacketForwarding(cliRouter, target.id, routingTables, DEFAULT_LINKS);
      output = `
${router.name}# ${cmd}
Type escape sequence to abort.
Sending 5, 100-byte ICMP Echos to ${target.ip}, timeout is 2 seconds:
${trace.delivered ? '!!!!!' : '.....'}
Success rate is ${trace.delivered ? '100 percent (5/5)' : '0 percent (0/5)'}, round-trip min/avg/max = ${trace.totalLatency}/${trace.totalLatency + 1}/${trace.totalLatency + 3} ms
`;
    } else if (cmd.startsWith('traceroute')) {
      const target = DEFAULT_ROUTERS.find(r => r.id === targetRouter) || DEFAULT_ROUTERS[5];
      const trace = tracePacketForwarding(cliRouter, target.id, routingTables, DEFAULT_LINKS);
      output = `
${router.name}# ${cmd}
Tracing the route to ${target.name} (${target.ip})
${trace.hops.map((h, i) => `${i + 1}  ${DEFAULT_ROUTERS.find(r => r.id === h)?.ip || '10.0.0.1'} (${h})  ${(i + 1) * 2.1} ms`).join('\n')}
`;
    } else {
      output = `
${router.name}# ${cmd}
% Unrecognized command or parameter. Try 'show ip route', 'show ip ospf neighbor', 'ping', 'traceroute'.
`;
    }

    setCliOutput(output.trim());

    // Wireshark Sniffer frame generation
    const protoTag = currentAlgoKey === 'ospf' ? 'OSPF' : currentAlgoKey === 'rip' ? 'RIPv2' : currentAlgoKey === 'eigrp' ? 'EIGRP' : 'ICMP';
    const newSniffer = {
      id: Date.now(),
      time,
      src: router.ip,
      dst: '224.0.0.5',
      protocol: protoTag,
      length: '78 bytes',
      info: `${protoTag} Hello / Update Packet broadcasted out GigabitEthernet0/0 [Seq #0x${Math.floor(Math.random() * 0xFFFF).toString(16)}]`
    };
    setSnifferLogs(prev => [newSniffer, ...prev.slice(0, 30)]);
  };

  useEffect(() => {
    executeCliCommand(cliCommand);
  }, [cliRouter, cliCommand, currentAlgoKey, severedLinks]);

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
            onClick={() => navigate('/routing')}
            aria-label="Back to all protocols"
          >
            <ArrowLeft size={16} />
            <span>All Protocols</span>
          </button>
          <span className="topolab-sep">/</span>
          <div className="topolab-title-group">
            <span className="topolab-category-tag">COMPUTER NETWORKS ROUTING CORE</span>
            <h1 className="topolab-title">{currentAlgo.name}</h1>
          </div>
        </div>

        {/* Algorithm Switcher Dropdown */}
        <div className="topolab-header-right">
          <div className="topolab-selector-box">
            <label htmlFor="routing-algo-select" className="selector-label">Routing Engine:</label>
            <select
              id="routing-algo-select"
              className="topolab-select"
              value={currentAlgoKey}
              onChange={(e) => navigate(`/routing/${e.target.value}`)}
            >
              {ROUTING_ALGORITHMS.map((algo) => (
                <option key={algo.id} value={algo.id}>
                  {algo.name} [AD: {algo.adminDistance}]
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
              <span className="tab-pill-badge">RFC Curriculum</span>
            </button>

            <button
              type="button"
              className={`topolab-tab-btn ${activeTab === 'functional' ? 'active' : ''}`}
              onClick={() => setActiveTab('functional')}
            >
              <Cpu size={15} />
              <span className="tab-title-text">Functional Model</span>
              <span className="tab-pill-badge live-pulse">Topology Graph</span>
            </button>

            <button
              type="button"
              className={`topolab-tab-btn ${activeTab === 'practical' ? 'active' : ''}`}
              onClick={() => setActiveTab('practical')}
            >
              <Sliders size={15} />
              <span className="tab-title-text">Practical Oriented</span>
              <span className="tab-pill-badge">Router CLI & Wireshark</span>
            </button>
          </div>

          <div className="topolab-subheader-meta">
            <span className="meta-dot live" />
            <span className="meta-label">BGP/OSPF FABRIC ONLINE · AD {currentAlgo.adminDistance}</span>
          </div>
        </div>
      </nav>

      {/* ======================================================== */}
      {/* 3. MAIN CONTENT VIEWPORT                                */}
      {/* ======================================================== */}
      <main className="topolab-content-area">
        {/* ====================================================== */}
        {/* TAB 1: THEORIES & SPECIFICATIONS CURRICULUM            */}
        {/* ====================================================== */}
        {activeTab === 'theories' && (
          <div className="topolab-theory-layout">
            <div className="theory-main-column">
              <div className="theory-concept-card">
                <div className="theory-badge-row">
                  <span className="theory-cat-badge">{currentAlgo.category.toUpperCase()}</span>
                  <span className="theory-std-badge">ADMIN DISTANCE: {currentAlgo.adminDistance}</span>
                  <span className="theory-tag green">{currentAlgo.standard}</span>
                </div>

                <h2 className="theory-heading">{currentAlgo.name} Specification</h2>
                <p className="theory-lead-p">{currentAlgo.leadSummary}</p>
                <p className="theory-body-text">{currentAlgo.concept}</p>
              </div>

              {/* 01: Protocol Mechanics */}
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

              {/* 02: Metric Equation */}
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

              {/* 03: Pros & Cons */}
              <div className="theory-pros-cons-grid">
                <div className="theory-pros-card">
                  <h4 className="pros-title text-emerald-400">Protocol Strengths</h4>
                  <ul className="theory-bullet-list">
                    {currentAlgo.pros.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>

                <div className="theory-cons-card">
                  <h4 className="cons-title text-rose-400">Protocol Trade-offs</h4>
                  <ul className="theory-bullet-list">
                    {currentAlgo.cons.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 04: Real World Deployments */}
              <div className="theory-content-card">
                <div className="theory-card-header-row">
                  <div className="theory-card-number">03</div>
                  <h3 className="theory-card-title">Production Telecom & Enterprise Deployments</h3>
                </div>
                <p className="theory-body-text">{currentAlgo.industryDeployment}</p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="theory-side-column">
              <div className="theory-specs-card">
                <h3 className="sidebar-heading">Protocol Specifications</h3>
                <div className="spec-row">
                  <span className="spec-label">Category:</span>
                  <span className="spec-value text-emerald-400">{currentAlgo.category}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Complexity:</span>
                  <span className="spec-value text-cyan-400">{currentAlgo.complexity}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Admin Distance:</span>
                  <span className="spec-value text-amber-400">{currentAlgo.adminDistance}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">RFC / Standard:</span>
                  <span className="spec-value text-slate-300">{currentAlgo.standard}</span>
                </div>
              </div>

              <div className="theory-specs-card">
                <h3 className="sidebar-heading">All 10 Routing Protocols</h3>
                <div className="algo-quick-links">
                  {ROUTING_ALGORITHMS.map(a => (
                    <button
                      key={a.id}
                      type="button"
                      className={`algo-quick-link-btn ${a.id === currentAlgoKey ? 'active' : ''}`}
                      onClick={() => navigate(`/routing/${a.id}`)}
                    >
                      <span>{a.shortName}</span>
                      <span className="text-xs text-slate-500">AD: {a.adminDistance}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================== */}
        {/* TAB 2: FUNCTIONAL MODEL (INTERACTIVE TOPOLOGY GRAPH)   */}
        {/* ====================================================== */}
        {activeTab === 'functional' && (
          <div className="topolab-interactive-layout">
            {/* LEFT CONTROLS DOCK */}
            <div className="interactive-controls-dock">
              <div className="panel-card">
                <div className="panel-header">
                  <GitFork size={15} />
                  <h3 className="panel-title">Packet Traversal Dispatcher</h3>
                </div>

                <div className="control-group">
                  <label className="control-label">Source Router (Ingress):</label>
                  <select
                    className="control-select"
                    value={sourceRouter}
                    onChange={(e) => setSourceRouter(e.target.value)}
                  >
                    {DEFAULT_ROUTERS.map(r => (
                      <option key={r.id} value={r.id}>{r.id}: {r.name} ({r.ip})</option>
                    ))}
                  </select>
                </div>

                <div className="control-group">
                  <label className="control-label">Destination Router (Egress):</label>
                  <select
                    className="control-select"
                    value={targetRouter}
                    onChange={(e) => setTargetRouter(e.target.value)}
                  >
                    {DEFAULT_ROUTERS.map(r => (
                      <option key={r.id} value={r.id} disabled={r.id === sourceRouter}>
                        {r.id}: {r.name} ({r.ip})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  className="playback-btn primary w-full mt-2"
                  onClick={handleFirePacket}
                  disabled={isTransmitting}
                >
                  <Send size={15} />
                  <span>{isTransmitting ? 'Transmitting In Transit...' : 'Transmit Test Packet'}</span>
                </button>
              </div>

              {/* Link Sabotage / Cable Severing */}
              <div className="panel-card">
                <div className="panel-header">
                  <Scissors size={15} className="text-rose-400" />
                  <h3 className="panel-title">Physical Fiber Cut Simulator</h3>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Click any link below to sever the cable. Observe how {currentAlgo.shortName} detects the link outage and recalculates paths:
                </p>

                <div className="flex flex-col gap-2">
                  {DEFAULT_LINKS.map(link => {
                    const isCut = severedLinks.includes(link.id);
                    return (
                      <button
                        key={link.id}
                        type="button"
                        className={`sever-link-btn ${isCut ? 'severed' : ''}`}
                        onClick={() => toggleSeverLink(link.id)}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`link-dot ${isCut ? 'severed' : 'active'}`} />
                          <span className="font-mono text-xs">{link.source} ↔ {link.target}</span>
                          <span className="text-xs text-slate-500">({link.bandwidth}M)</span>
                        </div>
                        <span className={`cut-tag ${isCut ? 'cut' : 'ok'}`}>
                          {isCut ? 'SEVERED' : 'UP'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT STAGE: SVG TOPOLOGY & ROUTING TABLE */}
            <div className="interactive-stage-area">
              {/* Telemetry Result Banner */}
              {packetTraceResult && (
                <div className={`status-hud-banner ${packetTraceResult.delivered ? 'hud-hit' : 'hud-fault'}`}>
                  <div className="flex items-center gap-2">
                    {packetTraceResult.delivered ? (
                      <CheckCircle2 size={18} className="text-emerald-400" />
                    ) : (
                      <AlertTriangle size={18} className="text-rose-400" />
                    )}
                    <span className="hud-status-badge">
                      {packetTraceResult.delivered ? 'PACKET DELIVERED' : 'PACKET DROPPED'}
                    </span>
                  </div>
                  <div className="hud-log-text">{packetTraceResult.log}</div>
                </div>
              )}

              {/* Topology SVG Canvas */}
              <div className="frames-visualizer-card">
                <div className="frames-header">
                  <div className="flex items-center gap-2">
                    <Network size={16} className="text-emerald-400" />
                    <h3 className="frames-title">Core ISP Topology Fabric Map</h3>
                  </div>
                  <span className="frames-meta">
                    Protocol: {currentAlgo.name} • {DEFAULT_ROUTERS.length} Nodes
                  </span>
                </div>

                <div className="topology-svg-container">
                  <svg viewBox="0 0 700 320" className="topology-svg">
                    {/* Render Links */}
                    {DEFAULT_LINKS.map(link => {
                      const sNode = DEFAULT_ROUTERS.find(r => r.id === link.source);
                      const tNode = DEFAULT_ROUTERS.find(r => r.id === link.target);
                      if (!sNode || !tNode) return null;

                      const isSevered = severedLinks.includes(link.id);
                      const isTraversed = packetTraceResult?.hops &&
                        packetTraceResult.hops.some((h, i) =>
                          (h === link.source && packetTraceResult.hops[i + 1] === link.target) ||
                          (h === link.target && packetTraceResult.hops[i + 1] === link.source)
                        );

                      const midX = (sNode.x + tNode.x) / 2;
                      const midY = (sNode.y + tNode.y) / 2;

                      return (
                        <g key={link.id}>
                          <line
                            x1={sNode.x}
                            y1={sNode.y}
                            x2={tNode.x}
                            y2={tNode.y}
                            className={`topo-link ${isSevered ? 'link-severed' : ''} ${isTraversed ? 'link-traversed' : ''}`}
                          />
                          <rect
                            x={midX - 18}
                            y={midY - 10}
                            width="36"
                            height="18"
                            rx="4"
                            className="link-badge-bg"
                          />
                          <text
                            x={midX}
                            y={midY + 3}
                            className="link-cost-text"
                            textAnchor="middle"
                          >
                            {isSevered ? 'DOWN' : `c:${link.cost}`}
                          </text>
                        </g>
                      );
                    })}

                    {/* Animated Packet on Active Hop */}
                    {isTransmitting && packetTraceResult?.hops && activePacketHop !== null && (
                      <circle
                        cx={DEFAULT_ROUTERS.find(r => r.id === packetTraceResult.hops[activePacketHop])?.x || 80}
                        cy={DEFAULT_ROUTERS.find(r => r.id === packetTraceResult.hops[activePacketHop])?.y || 160}
                        r="8"
                        className="animated-packet-dot"
                      />
                    )}

                    {/* Render Router Nodes */}
                    {DEFAULT_ROUTERS.map(router => {
                      const isSource = router.id === sourceRouter;
                      const isTarget = router.id === targetRouter;
                      const isSelected = router.id === selectedInspectRouter;

                      return (
                        <g
                          key={router.id}
                          className="router-node-group"
                          onClick={() => setSelectedInspectRouter(router.id)}
                        >
                          <circle
                            cx={router.x}
                            cy={router.y}
                            r="24"
                            className={`router-circle ${isSource ? 'source-node' : ''} ${isTarget ? 'target-node' : ''} ${isSelected ? 'selected-node' : ''}`}
                          />
                          <text
                            x={router.x}
                            y={router.y + 4}
                            className="router-label"
                            textAnchor="middle"
                          >
                            {router.id}
                          </text>
                          <text
                            x={router.x}
                            y={router.y + 38}
                            className="router-ip-text"
                            textAnchor="middle"
                          >
                            {router.ip}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Dynamic Routing Table View for Selected Router */}
              <div className="history-table-card">
                <div className="history-header">
                  <div className="flex items-center gap-2">
                    <Database size={16} className="text-cyan-400" />
                    <h3 className="history-title">
                      Routing Information Base (RIB): {selectedInspectRouter} Table
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400">
                    Calculated via {currentAlgo.name}
                  </span>
                </div>

                <div className="table-responsive">
                  <table className="matrix-table">
                    <thead>
                      <tr>
                        <th>Destination</th>
                        <th>Prefix IP</th>
                        <th>Next Hop IP</th>
                        <th>Metric</th>
                        <th>AD</th>
                        <th>Interface</th>
                        <th>Protocol</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(routingTables[selectedInspectRouter] || []).map((entry, idx) => (
                        <tr key={idx}>
                          <td className="font-mono text-emerald-400">{entry.destination}</td>
                          <td className="font-mono text-slate-300">{entry.prefix}</td>
                          <td className="font-mono text-cyan-300">{entry.nextHop}</td>
                          <td className="font-bold">{entry.metric === Infinity ? '∞' : entry.metric}</td>
                          <td>{entry.ad}</td>
                          <td className="text-slate-400 font-mono">{entry.interface}</td>
                          <td>
                            <span className="theory-tag green text-xs">{entry.protocol}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================== */}
        {/* TAB 3: STANDARDIZED PRACTICAL ORIENTATION (CLI & WIRESHARK) */}
        {/* CONTROLS ON LEFT (DESKTOP) / ON TOP (MOBILE)          */}
        {/* CONSOLE & TELEMETRY ON RIGHT (DESKTOP) / BOTTOM       */}
        {/* ====================================================== */}
        {activeTab === 'practical' && !routingRoom && (
          <div className="net-multiplayer-lobby">
            <div className="lobby-hero-card">
              <div className="lobby-pill-row">
                <span className="lobby-mode-pill">
                  <Radio size={12} className="live-spin" />
                  <span>4-Digit Multiplayer Room Lobby</span>
                </span>
                <span className="lobby-topo-badge">AUTONOMOUS SYSTEM 65001</span>
              </div>
              <h2 className="lobby-title">Multi-Device Router Mesh & Convergence Lab</h2>
              <p className="lobby-subtitle">
                Connect multiple physical or virtual devices into an Autonomous System routing topology with a 4-digit code. Each device operates a dedicated hardware router (R1 through R6) computing dynamic RIB tables and forwarding routed data packets.
              </p>

              <div className="lobby-tabs-switcher">
                <button
                  type="button"
                  className={`lobby-tab-btn ${routingLobbyTab === 'create' ? 'active' : ''}`}
                  onClick={() => { setRoutingLobbyTab('create'); setRoutingLobbyError(''); }}
                >
                  <Sparkles size={14} />
                  <span>Create Simulation Room</span>
                </button>
                <button
                  type="button"
                  className={`lobby-tab-btn ${routingLobbyTab === 'join' ? 'active' : ''}`}
                  onClick={() => { setRoutingLobbyTab('join'); setRoutingLobbyError(''); }}
                >
                  <Radio size={14} />
                  <span>Join with 4-Digit Code</span>
                </button>
              </div>

              {routingLobbyError && (
                <div className="lobby-alert-error">
                  <AlertTriangle size={15} />
                  <span>{routingLobbyError}</span>
                </div>
              )}

              {routingLobbyTab === 'create' && (
                <form onSubmit={handleCreateRoutingRoom} className="lobby-form-pane">
                  <div className="lobby-field-group">
                    <label className="lobby-label">
                      <Sliders size={14} />
                      <span>How many routers / devices in this autonomous topology?</span>
                    </label>
                    <div className="node-count-selector">
                      {[2, 3, 4, 5, 6].map(num => (
                        <button
                          key={num}
                          type="button"
                          className={`node-count-btn ${routingReqNodes === num ? 'active' : ''}`}
                          onClick={() => setRoutingReqNodes(num)}
                        >
                          <span className="count-num">{num}</span>
                          <span className="count-label">Routers</span>
                        </button>
                      ))}
                    </div>
                    <p className="field-hint">
                      Exactly {routingReqNodes} participants will join. The host operates <strong>Router R1 (ASBR Gateway)</strong>. Other devices bind to R2 through R6.
                    </p>
                  </div>

                  <div className="lobby-summary-box">
                    <div className="summary-row">
                      <span>Routing Protocol:</span>
                      <strong>{currentAlgo.name}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Capacity Limit:</span>
                      <strong>{routingReqNodes} Connected Router Nodes</strong>
                    </div>
                    <div className="summary-row">
                      <span>Gateway Lead (Host):</span>
                      <strong className="text-emerald-400">{user?.name || 'Local Machine'} (Assigned: Router R1)</strong>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="lobby-action-submit-btn"
                    disabled={routingIsSubmitting}
                  >
                    <Sparkles size={16} />
                    <span>{routingIsSubmitting ? 'Generating 4-Digit Room...' : 'Create Routing Simulation Room'}</span>
                  </button>
                </form>
              )}

              {routingLobbyTab === 'join' && (
                <form onSubmit={handleJoinRoutingRoom} className="lobby-form-pane">
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
                        value={routingJoinCodeInput}
                        onChange={(e) => setRoutingJoinCodeInput(e.target.value.replace(/[^0-9]/g, ''))}
                        className="room-code-large-input"
                        autoFocus
                      />
                    </div>
                    <p className="field-hint">
                      Ask the routing room owner for their 4-digit code. You will automatically receive a router station role upon joining.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="lobby-action-submit-btn"
                    disabled={routingIsSubmitting || routingJoinCodeInput.trim().length !== 4}
                  >
                    <Users size={16} />
                    <span>{routingIsSubmitting ? 'Connecting...' : 'Join Routing Lab Room'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ACTIVE MULTI-DEVICE ROUTING ARENA */}
        {activeTab === 'practical' && routingRoom && (
          <div className="net-multiplayer-arena">

            {/* ARENA HEADER BAR */}
            <header className="arena-header-bar">
              <div className="arena-header-left">
                <div className="arena-code-card">
                  <span className="code-label">4-DIGIT ROOM CODE</span>
                  <div className="code-display-row">
                    <span className="code-digits">{routingRoom.code}</span>
                    <button
                      type="button"
                      className="code-copy-btn"
                      onClick={handleCopyRoutingRoomCode}
                      title="Copy 4-digit code to invite other devices"
                    >
                      {routingCopiedCode ? <Check size={14} className="copied-icon" /> : <Copy size={14} />}
                      <span>{routingCopiedCode ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>
                </div>

                <div className="arena-topo-meta">
                  <span className="topo-tag">{currentAlgo.name.toUpperCase()}</span>
                  <div className="capacity-pill">
                    <Users size={13} />
                    <span>
                      {routingRoom.participants.length} / {routingRoom.maxParticipants} Devices Connected
                    </span>
                  </div>
                </div>
              </div>

              <div className="arena-header-actions">
                <button
                  type="button"
                  className="arena-leave-btn"
                  onClick={handleLeaveRoutingRoom}
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
                  <h3 className="roster-title">Connected Devices & Assigned Router Stations</h3>
                </div>
                <span className="roster-sub">
                  Live heartbeat synchronized &bull; Green = Online &bull; Packets route through active stations
                </span>
              </div>

              <div className="roster-cards-grid">
                {routingRoom.participants.map((p, idx) => {
                  const isMe = (p.email || '').toLowerCase().trim() === (user?.email || '').toLowerCase().trim();
                  const isHostUser = (p.email || '').toLowerCase().trim() === (routingRoom.hostEmail || '').toLowerCase().trim();
                  const assignedRouterId = `R${(idx % 6) + 1}`;

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
                        {isHostUser && <span className="host-badge">HOST / ASBR GATEWAY</span>}
                        {isMe && <span className="me-badge">THIS DEVICE</span>}
                      </div>

                      <div className="roster-user-info">
                        <span className="roster-email" title={p.email}>{p.email}</span>
                        <span className="roster-name">{p.name || 'Station Router'}</span>
                      </div>

                      <div className="roster-station-role">
                        <div
                          className="assigned-node-pill"
                          style={{
                            borderColor: isHostUser ? '#10b981' : '#3b82f6'
                          }}
                        >
                          <span
                            className="node-letter-badge"
                            style={{
                              background: isHostUser ? '#10b981' : '#3b82f6'
                            }}
                          >
                            {assignedRouterId}
                          </span>
                          <span className="node-role-name">
                            Station {assignedRouterId} ({DEFAULT_ROUTERS.find(r => r.id === assignedRouterId)?.name.split(' ')[0]})
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {Array.from({ length: Math.max(0, routingRoom.maxParticipants - routingRoom.participants.length) }).map((_, slotIdx) => (
                  <div key={`empty-${slotIdx}`} className="roster-empty-slot">
                    <span className="empty-slot-plus">+</span>
                    <span className="empty-slot-text">Waiting for device to join...</span>
                    <span className="empty-slot-hint">Code: {routingRoom.code}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* TWO COLUMN VIEW: CONTROLS LEFT (DESKTOP) / TOP (MOBILE), STAGE RIGHT */}
            <div className="topolab-practical-orientation-view routing-practical-orientation">
            {/* ==================================================== */}
            {/* LEFT COLUMN: MULTI-DEVICE & NODE SELECTION CONTROLS  */}
            {/* ==================================================== */}
            <div className="practical-controls-col">
              
              {/* 1. Multi-Device Router Session Hub */}
              <div className="chaos-card-full">
                <div className="chaos-card-header">
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-cyan-400" />
                    <h3 className="chaos-card-title">Multi-Device Router Session</h3>
                  </div>
                  <span className="chaos-header-badge">ROOM {routingRoomCode}</span>
                </div>
                <p className="chaos-card-desc">
                  Collaborative routing laboratory. Choose which physical router node your device controls in the autonomous system:
                </p>

                <div className="bg-slate-950/60 p-3 rounded-lg border border-white/5 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Lab Coordinator:</span>
                    <strong className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                      <Server size={12} /> {routingRoomHost}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Your Assigned Node:</span>
                    <span className="text-amber-400 font-bold uppercase font-mono">
                      ROUTER {myAssignedRouter} [{DEFAULT_ROUTERS.find(r => r.id === myAssignedRouter)?.role}]
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>GPS Anchor:</span>
                    <span className="text-cyan-400 font-mono text-[11px]">{gpsBoundCity}</span>
                  </div>
                </div>

                <div className="control-group">
                  <label htmlFor="assign-router-node" className="control-label">Assign My Device to Router Node:</label>
                  <select
                    id="assign-router-node"
                    className="control-select font-mono"
                    value={myAssignedRouter}
                    onChange={(e) => {
                      setMyAssignedRouter(e.target.value);
                      setCliRouter(e.target.value);
                    }}
                  >
                    {DEFAULT_ROUTERS.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.id}: {r.name} ({r.ip}) — {r.role}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  className="w-full py-2 px-3 bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 text-emerald-400 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition"
                  onClick={handleDetectGpsAndBind}
                  disabled={gpsDetecting}
                >
                  <Compass size={14} className={gpsDetecting ? 'animate-spin' : ''} />
                  <span>{gpsDetecting ? 'Querying GPS & Locating...' : 'Detect GPS & Bind Closest Regional Router'}</span>
                </button>
              </div>

              {/* 2. Choose Transmission Nodes (Source & Target) */}
              <div className="chaos-card-full">
                <div className="chaos-card-header">
                  <div className="flex items-center gap-2">
                    <Network size={18} className="text-emerald-400" />
                    <h3 className="chaos-card-title">Choose Routing Nodes</h3>
                  </div>
                  <span className="chaos-header-badge">FLOW</span>
                </div>
                <p className="chaos-card-desc">
                  Select the originating ingress router and terminating egress router to simulate end-to-end packet traversal:
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <div className="control-group">
                    <label htmlFor="src-router-select" className="control-label">Source Node (Sender):</label>
                    <select
                      id="src-router-select"
                      className="control-select font-mono"
                      value={practicalSourceRouter}
                      onChange={(e) => setPracticalSourceRouter(e.target.value)}
                      disabled={isPracticalTransmitting}
                    >
                      {DEFAULT_ROUTERS.map(r => (
                        <option key={r.id} value={r.id}>{r.id} ({r.name.split(' ')[0]})</option>
                      ))}
                    </select>
                  </div>

                  <div className="control-group">
                    <label htmlFor="dst-router-select" className="control-label">Target Node (Receiver):</label>
                    <select
                      id="dst-router-select"
                      className="control-select font-mono"
                      value={practicalTargetRouter}
                      onChange={(e) => setPracticalTargetRouter(e.target.value)}
                      disabled={isPracticalTransmitting}
                    >
                      {DEFAULT_ROUTERS.map(r => (
                        <option key={r.id} value={r.id}>{r.id} ({r.name.split(' ')[0]})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="control-group">
                  <label className="control-label">Packet Payload Content:</label>
                  <input
                    type="text"
                    className="control-input text-xs font-mono"
                    value={practicalPayload}
                    onChange={(e) => setPracticalPayload(e.target.value)}
                    placeholder="Enter payload string..."
                  />
                </div>

                <button
                  type="button"
                  className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleRunPracticalTransmission}
                  disabled={isPracticalTransmitting || practicalSourceRouter === practicalTargetRouter}
                >
                  <Send size={15} />
                  <span>{isPracticalTransmitting ? 'Propagating Routed Hop...' : `Transmit Packet (${practicalSourceRouter} → ${practicalTargetRouter})`}</span>
                </button>
              </div>

              {/* 3. Link Failure & Fast Reroute Testing */}
              <div className="chaos-card-full">
                <div className="chaos-card-header">
                  <div className="flex items-center gap-2">
                    <Flame size={18} className="text-rose-400" />
                    <h3 className="chaos-card-title">Fiber Link Flap & Outage</h3>
                  </div>
                  <span className="chaos-status-pill danger">FAST REROUTE</span>
                </div>
                <p className="chaos-card-desc">
                  Sever primary fiber trunks to evaluate live convergence and dynamic rerouting across alternative paths:
                </p>

                <div className="flex flex-wrap gap-2">
                  {DEFAULT_LINKS.slice(0, 4).map(l => (
                    <button
                      key={l.id}
                      type="button"
                      className={`px-3 py-1.5 text-xs rounded border transition flex items-center gap-1.5 ${severedLinks.includes(l.id) ? 'bg-rose-500/20 border-rose-500/50 text-rose-300' : 'bg-white/5 border-white/10 text-slate-300'}`}
                      onClick={() => toggleSeverLink(l.id)}
                    >
                      <Scissors size={12} />
                      <span>{severedLinks.includes(l.id) ? `Restore ${l.id}` : `Sever ${l.id}`}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* ==================================================== */}
            {/* RIGHT COLUMN: GRAPH, DATA STREAM, CLI & WIRESHARK    */}
            {/* ==================================================== */}
            <div className="practical-stage-col">

              {/* 1. Real-Time Router Matrix Graph (SVG Topology) */}
              <div className="chaos-card-full">
                <div className="chaos-card-header">
                  <div className="flex items-center gap-2">
                    <Globe size={18} className="text-cyan-400" />
                    <h3 className="chaos-card-title">Real-Time Router Matrix & Hop Traversal Graph</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="telemetry-live-dot" />
                    <span className="text-xs text-slate-400 font-mono">AUTONOMOUS SYSTEM 65001</span>
                  </div>
                </div>
                <p className="chaos-card-desc">
                  Interactive router mesh with dynamic link costs calculated via <strong>{currentAlgo.name}</strong>. Packets animate hop-by-hop between selected nodes:
                </p>

                {/* SVG TOPOLOGY GRAPH */}
                <div className="w-full bg-slate-950/80 rounded-xl border border-white/10 p-3 overflow-hidden relative">
                  <svg viewBox="0 0 700 320" className="w-full h-auto block select-none">
                    <defs>
                      <filter id="router-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    {/* Links */}
                    {DEFAULT_LINKS.map(link => {
                      const sRouter = DEFAULT_ROUTERS.find(r => r.id === link.source);
                      const tRouter = DEFAULT_ROUTERS.find(r => r.id === link.target);
                      if (!sRouter || !tRouter) return null;

                      const isSevered = severedLinks.includes(link.id);
                      const traceHops = practicalTraceResult?.hops || [];
                      
                      // Check if link is in the current traversal path
                      let isTraversed = false;
                      for (let i = 0; i < traceHops.length - 1; i++) {
                        if (
                          (traceHops[i] === link.source && traceHops[i + 1] === link.target) ||
                          (traceHops[i] === link.target && traceHops[i + 1] === link.source)
                        ) {
                          isTraversed = true;
                          break;
                        }
                      }

                      const midX = (sRouter.x + tRouter.x) / 2;
                      const midY = (sRouter.y + tRouter.y) / 2;

                      return (
                        <g key={link.id}>
                          <line
                            x1={sRouter.x}
                            y1={sRouter.y}
                            x2={tRouter.x}
                            y2={tRouter.y}
                            stroke={isSevered ? '#f43f5e' : isTraversed ? '#00bf63' : 'rgba(255,255,255,0.2)'}
                            strokeWidth={isTraversed ? 4 : 2}
                            strokeDasharray={isSevered ? '6 6' : 'none'}
                          />
                          {/* Animated moving packet circle */}
                          {isPracticalTransmitting && isTraversed && (
                            <circle r="6" fill="#00bf63" filter="url(#router-glow)">
                              <animate
                                attributeName="cx"
                                from={sRouter.x}
                                to={tRouter.x}
                                dur="0.85s"
                                repeatCount="indefinite"
                              />
                              <animate
                                attributeName="cy"
                                from={sRouter.y}
                                to={tRouter.y}
                                dur="0.85s"
                                repeatCount="indefinite"
                              />
                            </circle>
                          )}
                          {/* Cost Badge */}
                          <rect
                            x={midX - 18}
                            y={midY - 9}
                            width="36"
                            height="18"
                            rx="4"
                            fill="#030712"
                            stroke={isSevered ? '#f43f5e' : 'rgba(255,255,255,0.15)'}
                          />
                          <text
                            x={midX}
                            y={midY + 4}
                            textAnchor="middle"
                            fill={isSevered ? '#f43f5e' : '#94a3b8'}
                            fontSize="9"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            {isSevered ? 'FAIL' : link.cost}
                          </text>
                        </g>
                      );
                    })}

                    {/* Routers */}
                    {DEFAULT_ROUTERS.map(router => {
                      const isSource = router.id === practicalSourceRouter;
                      const isTarget = router.id === practicalTargetRouter;
                      const isMyDevice = router.id === myAssignedRouter;
                      const traceHops = practicalTraceResult?.hops || [];
                      const isHopActive = isPracticalTransmitting && traceHops[practicalActiveHopIdx] === router.id;

                      const strokeColor = isSource ? '#00bf63' : isTarget ? '#f43f5e' : isMyDevice ? '#f59e0b' : '#38bdf8';

                      return (
                        <g
                          key={router.id}
                          transform={`translate(${router.x}, ${router.y})`}
                          className="cursor-pointer"
                          onClick={() => {
                            setMyAssignedRouter(router.id);
                            setCliRouter(router.id);
                          }}
                        >
                          {/* Outer pulse if active hop */}
                          {isHopActive && (
                            <circle r="30" fill="none" stroke={strokeColor} strokeWidth="2" opacity="0.6">
                              <animate attributeName="r" from="20" to="40" dur="1s" repeatCount="indefinite" />
                              <animate attributeName="opacity" from="0.8" to="0" dur="1s" repeatCount="indefinite" />
                            </circle>
                          )}

                          <circle
                            r="20"
                            fill="#0f172a"
                            stroke={strokeColor}
                            strokeWidth={isMyDevice || isHopActive ? 4 : 2}
                            filter="url(#router-glow)"
                          />
                          <text
                            x="0"
                            y="5"
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize="12"
                            fontWeight="bold"
                            fontFamily="monospace"
                          >
                            {router.id}
                          </text>

                          {/* Node label */}
                          <text
                            x="0"
                            y="34"
                            textAnchor="middle"
                            fill="#94a3b8"
                            fontSize="10"
                            fontFamily="sans-serif"
                            fontWeight="bold"
                          >
                            {router.name.split(' ')[0]} {router.name.split(' ')[1]}
                          </text>

                          {/* Badges */}
                          {isMyDevice && (
                            <g transform="translate(0, -28)">
                              <rect x="-38" y="-9" width="76" height="18" rx="4" fill="#f59e0b" />
                              <text x="0" y="4" textAnchor="middle" fill="#030712" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                                THIS DEVICE
                              </text>
                            </g>
                          )}
                          {isSource && !isMyDevice && (
                            <g transform="translate(0, -28)">
                              <rect x="-28" y="-9" width="56" height="18" rx="4" fill="#00bf63" />
                              <text x="0" y="4" textAnchor="middle" fill="#030712" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                                SENDER
                              </text>
                            </g>
                          )}
                          {isTarget && !isMyDevice && (
                            <g transform="translate(0, -28)">
                              <rect x="-30" y="-9" width="60" height="18" rx="4" fill="#f43f5e" />
                              <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                                RECEIVER
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* 2. Large Main Output Data Stream HUD */}
              <div className="large-output-hud-card">
                <div className="hud-card-top">
                  <div className="hud-badge">
                    <Activity size={14} />
                    <span>SYNCHRONIZED ROUTED DATA STREAM</span>
                  </div>
                  <span className="hud-topology-name">{currentAlgo.shortName} ENGINE</span>
                </div>

                <div className="hud-payload-banner">
                  <span className="payload-tag">ROUTED PACKET PAYLOAD</span>
                  <h1 className="hud-payload-huge">"{practicalPayload}"</h1>
                </div>

                {/* Traversal Flow */}
                <div className="hud-traversal-bar">
                  <span className="traversal-bar-label">HOP PATH:</span>
                  <div className="traversal-nodes-flow">
                    {(practicalTraceResult?.hops || [practicalSourceRouter, practicalTargetRouter]).map((rId, idx, arr) => {
                      const isCurrentHop = isPracticalTransmitting && practicalActiveHopIdx === idx;
                      const isPast = isPracticalTransmitting && practicalActiveHopIdx >= idx;
                      const isAssigned = rId === myAssignedRouter;

                      return (
                        <div key={rId} className="hop-step-item">
                          <div
                            className={`hop-node-bubble ${isCurrentHop ? 'active-hop' : ''} ${isPast ? 'delivered' : ''}`}
                            style={{ borderColor: isAssigned ? '#f59e0b' : '#38bdf8' }}
                          >
                            <span className="hop-letter">{rId}</span>
                            {isCurrentHop && <span className="hop-pulse-ring" />}
                          </div>
                          <span className="hop-station-tag">Router {rId} {isAssigned ? '[YOU]' : ''}</span>
                          {idx < arr.length - 1 && (
                            <ArrowRight size={16} className={`hop-arrow ${isPast ? 'active' : ''}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Status Marquee */}
                <div className={`hud-status-marquee ${isPracticalTransmitting ? 'running' : practicalTraceResult ? 'completed' : 'idle'}`}>
                  <div className="marquee-dot" />
                  <span>
                    {isPracticalTransmitting
                      ? `[HOP #${practicalActiveHopIdx + 1} OF ${practicalTraceResult?.hops.length}] Packet traversed to Router ${practicalTraceResult?.hops[practicalActiveHopIdx]}...`
                      : practicalTraceResult
                      ? practicalTraceResult.log
                      : `[READY] Select sender & receiver routers and click "Transmit Packet" to observe hop-by-hop forwarding.`}
                  </span>
                </div>
              </div>

              {/* 3. This Device's Local Perspective Card */}
              <div className="local-device-perspective-card">
                <div className="local-card-top">
                  <div className="local-title-row">
                    <Laptop size={16} className="device-icon" />
                    <h3>Your Device Local Perspective</h3>
                  </div>
                  <span
                    className="local-status-pill"
                    style={{
                      borderColor: myAssignedRouter === practicalSourceRouter ? '#00bf63' : myAssignedRouter === practicalTargetRouter ? '#f43f5e' : '#f59e0b',
                      color: myAssignedRouter === practicalSourceRouter ? '#00bf63' : myAssignedRouter === practicalTargetRouter ? '#f43f5e' : '#f59e0b'
                    }}
                  >
                    ROUTER {myAssignedRouter} [{DEFAULT_ROUTERS.find(r => r.id === myAssignedRouter)?.role}]
                  </span>
                </div>

                <p className="local-device-desc">
                  This card reflects your physical device's exact routing responsibilities in the autonomous system:
                </p>

                <div
                  className="local-action-banner"
                  style={{
                    borderLeftColor: myAssignedRouter === practicalSourceRouter ? '#00bf63' : myAssignedRouter === practicalTargetRouter ? '#f43f5e' : '#f59e0b'
                  }}
                >
                  <span className="local-msg-highlight">
                    {myAssignedRouter === practicalSourceRouter
                      ? `THIS DEVICE IS SENDER (INGRESS): Encapsulating IPv4 packet from local subnet ${DEFAULT_ROUTERS.find(r => r.id === myAssignedRouter)?.ip}/24 and transmitting to next hop.`
                      : myAssignedRouter === practicalTargetRouter
                      ? `THIS DEVICE IS RECEIVER (EGRESS): Terminating destination for ${practicalPayload}. Packet acknowledged with 0% loss.`
                      : practicalTraceResult?.hops.includes(myAssignedRouter)
                      ? `THIS DEVICE IS IN THE TRANSIT PATH: Received packet on Gi0/0; Consulted ${currentAlgo.name} RIB; Decrementing TTL to 63 and relaying downstream.`
                      : `THIS DEVICE IS OFF-PATH: Standing by with active OSPF/BGP neighbor adjacencies. Available for instant fast-reroute failover.`}
                  </span>
                </div>

                <div className="local-node-specs-grid">
                  <div className="spec-pill">
                    <span className="sp-title">Assigned Station</span>
                    <span className="sp-val font-mono">{myAssignedRouter} ({DEFAULT_ROUTERS.find(r => r.id === myAssignedRouter)?.name.split(' ')[0]})</span>
                  </div>
                  <div className="spec-pill">
                    <span className="sp-title">Router IP</span>
                    <span className="sp-val font-mono">{DEFAULT_ROUTERS.find(r => r.id === myAssignedRouter)?.ip}</span>
                  </div>
                  <div className="spec-pill">
                    <span className="sp-title">Algorithm Metric</span>
                    <span className="sp-val font-mono">{currentAlgo.shortName} [AD {currentAlgo.adminDistance}]</span>
                  </div>
                  <div className="spec-pill">
                    <span className="sp-title">Interface Health</span>
                    <span className="sp-val text-emerald-400 font-bold">Gi0/0 & Gi0/1 UP</span>
                  </div>
                </div>
              </div>

              {/* 4. Cisco IOS Virtual Console Terminal */}
              <div className="chaos-card-full">
                <div className="chaos-card-header">
                  <div className="flex items-center gap-2">
                    <Terminal size={18} className="text-emerald-400" />
                    <h3 className="chaos-card-title">Cisco IOS Router Virtual Console ({cliRouter})</h3>
                  </div>
                  <span className="chaos-header-badge">VT100 115200 BAUD</span>
                </div>
                <pre className="router-cli-terminal">
                  {cliOutput}
                </pre>
              </div>

              {/* 5. Wireshark Protocol Packet Inspector */}
              <div className="chaos-card-full">
                <div className="chaos-card-header">
                  <div className="flex items-center gap-2">
                    <Radio size={18} className="text-cyan-400" />
                    <h3 className="chaos-card-title">Wireshark Protocol Packet Inspector</h3>
                  </div>
                  <span className="telemetry-live-dot" />
                  <span className="text-xs text-slate-400 font-mono">SNIFFER ACTIVE</span>
                </div>

                <div className="table-responsive">
                  <table className="matrix-table text-xs">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Source</th>
                        <th>Destination</th>
                        <th>Protocol</th>
                        <th>Length</th>
                        <th>Frame Info</th>
                      </tr>
                    </thead>
                    <tbody>
                      {snifferLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="font-mono text-slate-400">{log.time}</td>
                          <td className="font-mono text-emerald-400">{log.src}</td>
                          <td className="font-mono text-cyan-400">{log.dst}</td>
                          <td>
                            <span className="theory-tag green text-xs">{log.protocol}</span>
                          </td>
                          <td className="text-slate-400">{log.length}</td>
                          <td className="text-slate-300 font-mono">{log.info}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
