import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Pause,
  Square,
  RefreshCw,
  Sliders,
  Send,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Cpu,
  Layers,
  Activity,
  Zap,
  Radio,
  Server,
  ArrowRight,
  Shield,
  FileText,
  Calculator,
  Globe,
  Terminal,
  Code2,
  Plus,
  Minus,
  Trash2
} from 'lucide-react';
import Navbar from '../components/Navbar';
import InteractiveSchematicViewer from '../components/InteractiveSchematicViewer';
import { TOPOLOGY_CARDS } from '../utils/topologyCardArts';
import { TOPOLOGY_THEORY_DATA } from '../utils/topologyTheoryData';
import './TopologyLabPage.css';

const TOPOLOGY_SCENARIOS = {
  star: {
    title: 'Star Switch Unicast Scenario',
    desc: 'Set Node A as the central Hub / Switch, select Node B as Source and Node E as Destination. Click Play Simulation to observe unicast frames isolated and routed via CAM table lookup directly across the switch backplane.'
  },
  bus: {
    title: 'Bus CSMA/CD Broadcast Scenario',
    desc: 'Select Node B as Sender and Node E as Receiver. Click Play Simulation to observe signal broadcast traveling bidirectionally along the shared coaxial trunk until absorbed by the 50Ω terminators.'
  },
  ring: {
    title: 'Token Circulation & Repeaters Scenario',
    desc: 'Select Node A as Sender and Node D as Receiver. Click Play Simulation to observe unidirectional token transmission circulating through intermediate repeater stations.'
  },
  mesh: {
    title: 'Direct Point-to-Point Multipath Scenario',
    desc: 'Select Node B as Source and Node E as Destination. Click Play Simulation to observe direct 1-hop point-to-point transmission without intermediate relay delays.'
  },
  tree: {
    title: 'Hierarchical Core/Access Routing Scenario',
    desc: 'Select leaf Node B to transmit to leaf Node E. Click Play Simulation to observe frames ascending to the Root Switch and routing down the target workgroup branch.'
  },
  hybrid: {
    title: 'Inter-Domain Bridge Scenario',
    desc: 'Select Node B (Star LAN) to transmit to Node E (Mesh Fabric). Click Play Simulation to trace packets traversing the central bridge gateway router.'
  }
};

export default function TopologyLabPage() {
  const { topologyId } = useParams();
  const navigate = useNavigate();

  // Validate or fallback to 'star'
  const currentTopoKey = TOPOLOGY_CARDS[topologyId] ? topologyId : 'star';
  const currentTopo = TOPOLOGY_CARDS[currentTopoKey];
  const currentTheory = TOPOLOGY_THEORY_DATA[currentTopoKey] || TOPOLOGY_THEORY_DATA.star;
  const currentScenario = TOPOLOGY_SCENARIOS[currentTopoKey] || TOPOLOGY_SCENARIOS.star;

  // Subheader Tabs: 'theories' | 'practical' | 'more-practical'
  const [activeTab, setActiveTab] = useState('theories');

  // ==========================================
  // PRACTICAL SIMULATION STATE
  // ==========================================
  const [nodes, setNodes] = useState([
    { id: 'node-a', label: 'A', name: 'Node A', role: currentTopoKey === 'star' ? 'hub' : currentTopoKey === 'tree' ? 'root' : currentTopoKey === 'hybrid' ? 'hub' : 'node', status: 'online' },
    { id: 'node-b', label: 'B', name: 'Node B', role: 'node', status: 'online' },
    { id: 'node-c', label: 'C', name: 'Node C', role: 'node', status: 'online' },
    { id: 'node-d', label: 'D', name: 'Node D', role: currentTopoKey === 'hybrid' ? 'hub' : 'node', status: 'online' },
    { id: 'node-e', label: 'E', name: 'Node E', role: 'node', status: 'online' }
  ]);

  const [sourceNodeId, setSourceNodeId] = useState('node-b');
  const [targetNodeId, setTargetNodeId] = useState('node-e');
  const [packetType, setPacketType] = useState('DATA');
  const [simSpeed, setSimSpeed] = useState(1); // 0.5, 1, 2

  // Playback states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [packetSeq, setPacketSeq] = useState(1);
  const [telemetryLogs, setTelemetryLogs] = useState([]);
  
  // Animation progress: 0 to 1
  const [animProgress, setAnimProgress] = useState(0);
  const [currentHop, setCurrentHop] = useState({ from: 'node-b', to: 'node-a', step: 1, totalSteps: 2 });
  const animRef = useRef(null);
  const lastTimeRef = useRef(null);

  // More Practical: Fault Injection & Traffic Modes
  const [trafficMode, setTrafficMode] = useState('unicast'); // 'unicast' | 'broadcast' | 'collision'
  const [failedLinks, setFailedLinks] = useState({});

  // Reset nodes when topology changes
  useEffect(() => {
    setNodes([
      { id: 'node-a', label: 'A', name: 'Node A', role: currentTopoKey === 'star' ? 'hub' : currentTopoKey === 'tree' ? 'root' : currentTopoKey === 'hybrid' ? 'hub' : 'node', status: 'online' },
      { id: 'node-b', label: 'B', name: 'Node B', role: 'node', status: 'online' },
      { id: 'node-c', label: 'C', name: 'Node C', role: 'node', status: 'online' },
      { id: 'node-d', label: 'D', name: 'Node D', role: currentTopoKey === 'hybrid' ? 'hub' : 'node', status: 'online' },
      { id: 'node-e', label: 'E', name: 'Node E', role: 'node', status: 'online' }
    ]);
    handleStopSimulation();
    setFailedLinks({});
  }, [currentTopoKey]);

  // Log message helper
  const addLog = (msg, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setTelemetryLogs((prev) => [
      { id: Date.now() + Math.random(), time: timestamp, msg, type },
      ...prev.slice(0, 40)
    ]);
  };

  // Node role changer
  const handleRoleChange = (nodeId, newRole) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (currentTopoKey === 'star' && newRole === 'hub') {
          // In Star topology, only 1 node is the hub; demote other hubs to nodes
          return n.id === nodeId ? { ...n, role: 'hub' } : n.role === 'hub' ? { ...n, role: 'node' } : n;
        }
        return n.id === nodeId ? { ...n, role: newRole } : n;
      })
    );
    const node = nodes.find((n) => n.id === nodeId);
    addLog(`Updated ${node?.label || nodeId} role to [${newRole.toUpperCase()}]`, 'config');
  };

  // Node name changer
  const handleNameChange = (nodeId, newName) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, name: newName } : n))
    );
  };

  // Add / Remove node
  const handleAddNode = () => {
    if (nodes.length >= 8) return;
    const nextChar = String.fromCharCode(65 + nodes.length);
    const newId = `node-${nextChar.toLowerCase()}`;
    const newNode = {
      id: newId,
      label: nextChar,
      name: `Node ${nextChar}`,
      role: 'node',
      status: 'online'
    };
    setNodes([...nodes, newNode]);
    addLog(`Added new node ${nextChar} to topology network`, 'config');
  };

  const handleRemoveNode = () => {
    if (nodes.length <= 3) return;
    const removed = nodes[nodes.length - 1];
    if (sourceNodeId === removed.id) setSourceNodeId(nodes[0].id);
    if (targetNodeId === removed.id) setTargetNodeId(nodes[1].id);
    setNodes(nodes.slice(0, -1));
    addLog(`Removed node ${removed.label} from topology`, 'config');
  };

  // Toggle node online / offline (for failure simulation)
  const handleToggleNodeHealth = (nodeId) => {
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === nodeId) {
          const newStatus = n.status === 'online' ? 'offline' : 'online';
          addLog(`Node ${n.label} is now ${newStatus.toUpperCase()}`, newStatus === 'offline' ? 'error' : 'success');
          return { ...n, status: newStatus };
        }
        return n;
      })
    );
  };

  // ==========================================
  // CONTINUOUS SIMULATION LOOP ENGINE
  // ==========================================

  // Determine path hops based on topology
  const getRouteHops = () => {
    const src = sourceNodeId;
    const dst = targetNodeId;
    if (src === dst) return [];

    const hubNode = nodes.find((n) => n.role === 'hub') || nodes[0];

    if (currentTopoKey === 'star') {
      // Star Topology Route:
      // If src is Hub -> direct to dst
      // If dst is Hub -> direct from src to Hub
      // Otherwise: src -> Hub -> dst
      if (src === hubNode.id) return [{ from: src, to: dst }];
      if (dst === hubNode.id) return [{ from: src, to: dst }];
      return [
        { from: src, to: hubNode.id },
        { from: hubNode.id, to: dst }
      ];
    }

    if (currentTopoKey === 'ring') {
      // Ring Topology Route: Unidirectional along the loop
      const srcIdx = nodes.findIndex((n) => n.id === src);
      const dstIdx = nodes.findIndex((n) => n.id === dst);
      const hops = [];
      let curr = srcIdx;
      while (curr !== dstIdx) {
        const next = (curr + 1) % nodes.length;
        hops.push({ from: nodes[curr].id, to: nodes[next].id });
        curr = next;
      }
      return hops;
    }

    if (currentTopoKey === 'bus') {
      // Bus Topology: Packet enters backbone at src tap, propagates across backbone to dst
      return [
        { from: src, to: 'bus-tap-src' },
        { from: 'bus-tap-src', to: 'bus-tap-dst' },
        { from: 'bus-tap-dst', to: dst }
      ];
    }

    if (currentTopoKey === 'mesh') {
      // Mesh Topology: Direct point-to-point connection!
      return [{ from: src, to: dst }];
    }

    if (currentTopoKey === 'tree') {
      // Tree Topology Route: packet travels along real parent/child branches via LCA
      const getTreeParentIdx = (idx) => {
        if (idx === 0) return null;
        if (idx === 1 || idx === 2) return 0;
        return idx % 2 === 1 ? 1 : 2;
      };

      const srcIdx = nodes.findIndex((n) => n.id === src);
      const dstIdx = nodes.findIndex((n) => n.id === dst);
      if (srcIdx === -1 || dstIdx === -1 || srcIdx === dstIdx) return [];

      // Trace path from src upwards to root
      const srcPath = [srcIdx];
      let cur = srcIdx;
      while (cur !== 0 && cur !== null) {
        cur = getTreeParentIdx(cur);
        if (cur !== null) srcPath.push(cur);
      }

      // Trace path from dst upwards to root
      const dstPath = [dstIdx];
      cur = dstIdx;
      while (cur !== 0 && cur !== null) {
        cur = getTreeParentIdx(cur);
        if (cur !== null) dstPath.push(cur);
      }

      // Find lowest common ancestor (LCA)
      let lca = 0;
      for (const nodeIdx of srcPath) {
        if (dstPath.includes(nodeIdx)) {
          lca = nodeIdx;
          break;
        }
      }

      const lcaInSrc = srcPath.indexOf(lca);
      const upPart = srcPath.slice(0, lcaInSrc + 1); // [srcIdx, ..., lca]
      const lcaInDst = dstPath.indexOf(lca);
      const downPart = dstPath.slice(0, lcaInDst).reverse(); // [...down to dstIdx]
      const fullPath = [...upPart, ...downPart];

      const hops = [];
      for (let i = 0; i < fullPath.length - 1; i++) {
        hops.push({
          from: nodes[fullPath[i]].id,
          to: nodes[fullPath[i + 1]].id
        });
      }
      return hops.length > 0 ? hops : [{ from: src, to: dst }];
    }

    if (currentTopoKey === 'hybrid') {
      // Hybrid Topology: Dual Star clusters linked by inter-hub bridge
      const srcIdx = nodes.findIndex((n) => n.id === src);
      const dstIdx = nodes.findIndex((n) => n.id === dst);
      const leftHubId = nodes[0]?.id || 'node-a';
      const rightHubId = nodes[3]?.id || 'node-d';

      const isLeft = (idx) => idx <= 2;
      const srcLeft = isLeft(srcIdx);
      const dstLeft = isLeft(dstIdx);

      if (srcLeft && dstLeft) {
        // Both within Left Cluster
        if (src === leftHubId || dst === leftHubId) return [{ from: src, to: dst }];
        return [{ from: src, to: leftHubId }, { from: leftHubId, to: dst }];
      } else if (!srcLeft && !dstLeft) {
        // Both within Right Cluster
        if (src === rightHubId || dst === rightHubId) return [{ from: src, to: dst }];
        return [{ from: src, to: rightHubId }, { from: rightHubId, to: dst }];
      } else {
        // Cross-cluster through Trunk Bridge
        const hops = [];
        if (srcLeft) {
          if (src !== leftHubId) hops.push({ from: src, to: leftHubId });
          hops.push({ from: leftHubId, to: rightHubId });
          if (dst !== rightHubId) hops.push({ from: rightHubId, to: dst });
        } else {
          if (src !== rightHubId) hops.push({ from: src, to: rightHubId });
          hops.push({ from: rightHubId, to: leftHubId });
          if (dst !== leftHubId) hops.push({ from: leftHubId, to: dst });
        }
        return hops;
      }
    }

    // Default direct
    return [{ from: src, to: dst }];
  };

  // Start continuous simulation
  const handlePlaySimulation = () => {
    if (sourceNodeId === targetNodeId) {
      addLog('Source and destination cannot be the same node!', 'warning');
      return;
    }
    const srcNode = nodes.find((n) => n.id === sourceNodeId);
    const dstNode = nodes.find((n) => n.id === targetNodeId);

    if (srcNode?.status === 'offline') {
      addLog(`Cannot transmit: Source node ${srcNode.label} is OFFLINE!`, 'error');
      return;
    }
    if (dstNode?.status === 'offline') {
      addLog(`Warning: Destination node ${dstNode.label} is OFFLINE!`, 'warning');
    }

    const hops = getRouteHops();
    if (hops.length === 0) return;

    setIsPlaying(true);
    setIsPaused(false);
    setCurrentHop({ ...hops[0], stepIndex: 0, totalHops: hops.length });
    setAnimProgress(0);
    lastTimeRef.current = performance.now();

    addLog(`INITIATED CONTINUOUS STREAM: ${srcNode?.label} ➔ ${dstNode?.label} [${currentTopo.name.toUpperCase()}]`, 'success');
  };

  const handlePauseSimulation = () => {
    setIsPaused(!isPaused);
    addLog(isPaused ? 'Simulation resumed' : 'Simulation paused', 'info');
  };

  const handleStopSimulation = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setAnimProgress(0);
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    addLog('Simulation stopped by user.', 'info');
  };

  // Animation frame loop
  useEffect(() => {
    if (!isPlaying || isPaused) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    const stepDuration = 1200 / simSpeed; // duration in ms per hop

    const animate = (time) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;

      setAnimProgress((prev) => {
        const next = prev + delta / stepDuration;
        if (next >= 1) {
          // Hop finished
          const hops = getRouteHops();
          const nextIndex = currentHop.stepIndex + 1;

          if (nextIndex < hops.length) {
            // Next intermediate hop
            const nextHop = hops[nextIndex];
            const fromObj = nodes.find((n) => n.id === nextHop.from) || { label: nextHop.from };
            const toObj = nodes.find((n) => n.id === nextHop.to) || { label: nextHop.to };
            addLog(`Hop ${nextIndex}/${hops.length}: Forwarded packet to ${toObj.label}`, 'info');
            setCurrentHop({ ...nextHop, stepIndex: nextIndex, totalHops: hops.length });
            return 0;
          } else {
            // Reached destination! Continuous loop cycles to next packet!
            const dstObj = nodes.find((n) => n.id === targetNodeId);
            setPacketSeq((s) => s + 1);
            addLog(`Packet #${packetSeq} delivered to ${dstObj?.label || 'Destination'}. ACK received. Dispatching next packet...`, 'success');

            // Reset to hop 0 for continuous transmission
            setCurrentHop({ ...hops[0], stepIndex: 0, totalHops: hops.length });
            return 0;
          }
        }
        return next;
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, isPaused, simSpeed, currentHop, currentTopoKey, sourceNodeId, targetNodeId, packetSeq]);

  // Node geometric placement calculations
  const getNodeCoordinates = (index, total) => {
    const cx = 350;
    const cy = 250;

    if (currentTopoKey === 'star') {
      const node = nodes[index];
      if (node.role === 'hub') {
        return { x: cx, y: cy };
      }
      // Distribute non-hub outer nodes symmetrically
      const nonHubs = nodes.filter((n) => n.role !== 'hub');
      const nonHubIndex = nonHubs.findIndex((n) => n.id === node.id);
      const angle = (nonHubIndex * (2 * Math.PI)) / Math.max(1, nonHubs.length) - Math.PI / 2;
      const radius = 170;
      return {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle)
      };
    }

    if (currentTopoKey === 'ring') {
      const angle = (index * (2 * Math.PI)) / total - Math.PI / 2;
      const radius = 160;
      return {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle)
      };
    }

    if (currentTopoKey === 'bus') {
      // Horizontal bus trunk between (120, 250) and (580, 250)
      const busStartX = 120;
      const busEndX = 580;
      const busY = 250;
      const spacing = (busEndX - busStartX) / (total + 1);
      const tapX = busStartX + (index + 1) * spacing;
      const isTop = index % 2 === 0;
      const nodeY = isTop ? busY - 110 : busY + 110;
      return { x: tapX, y: nodeY, tapX, busY };
    }

    if (currentTopoKey === 'mesh') {
      const angle = (index * (2 * Math.PI)) / total - Math.PI / 2;
      const radius = 160;
      return {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle)
      };
    }

    if (currentTopoKey === 'tree') {
      // Multi-tier hierarchy
      if (index === 0) return { x: cx, y: 110 }; // Root
      if (index <= 2) {
        const offset = index === 1 ? -120 : 120;
        return { x: cx + offset, y: 220 }; // Tier 1
      }
      // Tier 2 leaves
      const leafIndex = index - 3;
      const totalLeaves = total - 3;
      const leafSpacing = 480 / Math.max(1, totalLeaves + 1);
      return { x: 110 + (leafIndex + 1) * leafSpacing, y: 350 };
    }

    if (currentTopoKey === 'hybrid') {
      // Dual-Star Clusters joined by an inter-hub bridge
      if (index === 0) return { x: 230, y: 240 }; // Left Star Hub
      if (index === 1) return { x: 130, y: 160 }; // Left Satellite 1
      if (index === 2) return { x: 130, y: 320 }; // Left Satellite 2
      if (index === 3) return { x: 470, y: 240 }; // Right Star Hub
      if (index === 4) return { x: 570, y: 160 }; // Right Satellite 1
      if (index === 5) return { x: 570, y: 320 }; // Right Satellite 2
      return { x: 570, y: 240 };
    }

    return { x: cx, y: cy };
  };

  // Get active packet animated position (px)
  const getPacketCoord = () => {
    if (!isPlaying) return null;
    const { from, to } = currentHop;

    let p1 = { x: 0, y: 0 };
    let p2 = { x: 0, y: 0 };

    if (currentTopoKey === 'bus') {
      const srcNodeIndex = nodes.findIndex((n) => n.id === sourceNodeId);
      const dstNodeIndex = nodes.findIndex((n) => n.id === targetNodeId);
      const srcCoord = getNodeCoordinates(srcNodeIndex, nodes.length);
      const dstCoord = getNodeCoordinates(dstNodeIndex, nodes.length);

      if (from === sourceNodeId) {
        // Step 1: from Node -> bus tap
        p1 = { x: srcCoord.x, y: srcCoord.y };
        p2 = { x: srcCoord.tapX, y: srcCoord.busY };
      } else if (to === targetNodeId) {
        // Step 3: from bus tap -> dst Node
        p1 = { x: dstCoord.tapX, y: dstCoord.busY };
        p2 = { x: dstCoord.x, y: dstCoord.y };
      } else {
        // Step 2: across bus cable from src tap to dst tap
        p1 = { x: srcCoord.tapX, y: srcCoord.busY };
        p2 = { x: dstCoord.tapX, y: dstCoord.busY };
      }
    } else {
      const fromIndex = nodes.findIndex((n) => n.id === from);
      const toIndex = nodes.findIndex((n) => n.id === to);
      if (fromIndex === -1 || toIndex === -1) return null;
      p1 = getNodeCoordinates(fromIndex, nodes.length);
      p2 = getNodeCoordinates(toIndex, nodes.length);
    }

    const curX = p1.x + (p2.x - p1.x) * animProgress;
    const curY = p1.y + (p2.y - p1.y) * animProgress;
    return { x: curX, y: curY };
  };

  const packetCoord = getPacketCoord();  return (
    <div className="topolab-viewport">
      {/* Persistent Global Navbar */}
      <Navbar onOpenFacility={(facilityId) => {
        if (facilityId !== 'multi-mesh') {
          navigate('/');
        }
      }} />

      {/* Top Header */}
      <header className="topolab-header-bar">
        <div className="topolab-nav-left">
          <button 
            type="button" 
            className="topolab-back-btn"
            onClick={() => navigate('/topologies')}
            aria-label="Back to all topologies"
          >
            <ArrowLeft size={15} />
            <span>All Topologies</span>
          </button>

          <div className="topolab-divider-v" />

          <div className="topolab-title-group">
            <h1 className="topolab-active-title">
              <span>{currentTopo.name}</span>
            </h1>
            <span className="topolab-mode-tag">Architecture Emulation</span>
          </div>
        </div>

        <div className="topolab-nav-right">
          <div className="topolab-selector-wrap">
            <Layers size={14} className="selector-icon" />
            <span className="topolab-select-label">Switch Architecture:</span>
            <select
              className="topolab-select-dropdown"
              value={currentTopoKey}
              onChange={(e) => navigate(`/topologies/${e.target.value}`)}
            >
              <option value="star">Star Topology</option>
              <option value="bus">Bus Topology</option>
              <option value="ring">Ring Topology</option>
              <option value="mesh">Mesh Topology</option>
              <option value="tree">Tree Topology</option>
              <option value="hybrid">Hybrid Topology</option>
            </select>
          </div>
        </div>
      </header>

      {/* SUB HEADER TABS: Theories | Functional Model | Practical Oriented */}
      <nav className="topolab-subheader-tabs">
        <div className="topolab-tabs-container">
          <div className="topolab-tabs-dock">
            <button
              type="button"
              className={`topolab-tab-btn ${activeTab === 'theories' ? 'active' : ''}`}
              onClick={() => setActiveTab('theories')}
            >
              <FileText size={15} />
              <span>Theories & Specs</span>
              <span className="tab-pill-badge">Curriculum</span>
            </button>

            <button
              type="button"
              className={`topolab-tab-btn ${activeTab === 'practical' ? 'active' : ''}`}
              onClick={() => setActiveTab('practical')}
            >
              <Cpu size={15} />
              <span>Functional Model</span>
              <span className="tab-pill-badge live-pulse">Interactive</span>
            </button>

            <button
              type="button"
              className={`topolab-tab-btn ${activeTab === 'more-practical' ? 'active' : ''}`}
              onClick={() => setActiveTab('more-practical')}
            >
              <Sliders size={15} />
              <span>Practical Oriented</span>
              <span className="tab-pill-badge">Chaos Lab</span>
            </button>
          </div>

          <div className="topolab-subheader-meta">
            <span className="meta-dot live" />
            <span className="meta-label">HARDWARE ENGINE ONLINE · FULL DUPLEX</span>
          </div>
        </div>
      </nav>

      {/* MAIN VIEW AREA */}
      <main className="topolab-content-area">

        {/* ======================================================== */}
        {/* TAB 1: THEORIES (COMPREHENSIVE EXPANDED CURRICULUM)      */}
        {/* ======================================================== */}
        {activeTab === 'theories' && (
          <div className="topolab-theory-layout">
            {/* Left Column: Comprehensive In-Depth Theory Sections */}
            <div className="theory-main-column">
              
              {/* Header Overview Card */}
              <div className="theory-concept-card">
                <div className="theory-badge-row">
                  <span className="theory-cat-badge">ARCHITECTURAL SPECIFICATION</span>
                  <span className="theory-std-badge">NETRIUM LABORATORY CURRICULUM</span>
                </div>

                <h2 className="theory-heading">Understanding {currentTopo.name}</h2>
                <p className="theory-lead-p">{currentTheory.leadSummary}</p>
              </div>

              {/* Section 1: Physical Architecture & Signal Propagation */}
              <div className="theory-content-card">
                <div className="theory-card-header-row">
                  <div className="theory-card-number">01</div>
                  <h3 className="theory-card-title">{currentTheory.signalPhysics.title}</h3>
                </div>
                <p className="theory-body-text">{currentTheory.signalPhysics.description}</p>
                
                <div className="theory-key-facts-grid">
                  <div className="fact-item">
                    <span className="fact-label">Physical Transmission Media:</span>
                    <span className="fact-value">{currentTheory.signalPhysics.media}</span>
                  </div>
                  <div className="fact-item">
                    <span className="fact-label">Duplex Operating Mode:</span>
                    <span className="fact-value">{currentTheory.signalPhysics.duplex}</span>
                  </div>
                  <div className="fact-item">
                    <span className="fact-label">Signaling Standard:</span>
                    <span className="fact-value">{currentTheory.signalPhysics.voltage}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Medium Access & Frame Protocol Mechanics */}
              <div className="theory-content-card">
                <div className="theory-card-header-row">
                  <div className="theory-card-number">02</div>
                  <h3 className="theory-card-title">{currentTheory.protocolMechanics.title}</h3>
                </div>
                <p className="theory-body-text">{currentTheory.protocolMechanics.description}</p>

                {/* Algorithm Pseudocode Terminal Box */}
                <div className="theory-code-terminal">
                  <div className="terminal-header">
                    <div className="terminal-dots">
                      <span className="dot red" />
                      <span className="dot yellow" />
                      <span className="dot green" />
                    </div>
                    <span className="terminal-title">{currentTheory.protocolMechanics.algorithmTitle}</span>
                  </div>
                  <pre className="terminal-pre">
                    <code>{currentTheory.protocolMechanics.algorithmCode}</code>
                  </pre>
                </div>
              </div>

              {/* Section 3: Mathematical Modeling & Complexity Formulations */}
              <div className="theory-content-card">
                <div className="theory-card-header-row">
                  <div className="theory-card-number">03</div>
                  <h3 className="theory-card-title">{currentTheory.mathematics.title}</h3>
                </div>

                <div className="math-formulas-grid">
                  <div className="math-pill-box">
                    <span className="math-box-title">Physical Links Required</span>
                    <span className="math-box-formula">{currentTheory.mathematics.linkFormula}</span>
                  </div>
                  <div className="math-pill-box">
                    <span className="math-box-title">I/O Port Density</span>
                    <span className="math-box-formula">{currentTheory.mathematics.portFormula}</span>
                  </div>
                  <div className="math-pill-box">
                    <span className="math-box-title">Network Diameter</span>
                    <span className="math-box-formula">{currentTheory.mathematics.diameter}</span>
                  </div>
                  <div className="math-pill-box">
                    <span className="math-box-title">Cabling Cost Order</span>
                    <span className="math-box-formula">{currentTheory.mathematics.cableCost}</span>
                  </div>
                </div>

                <div className="math-analysis-callout">
                  <strong>Complexity Analysis: </strong>
                  <span>{currentTheory.mathematics.notes}</span>
                </div>
              </div>

              {/* Section 4: Fault Isolation & Resilience Profile */}
              <div className="theory-content-card">
                <div className="theory-card-header-row">
                  <div className="theory-card-number">04</div>
                  <h3 className="theory-card-title">{currentTheory.faultTolerance.title}</h3>
                </div>

                <div className="fault-analysis-rows">
                  <div className="fault-row-item">
                    <div className="fault-row-header warning">
                      <AlertTriangle size={15} />
                      <span>Single Point of Failure (SPOF) Analysis</span>
                    </div>
                    <p className="fault-row-desc">{currentTheory.faultTolerance.spof}</p>
                  </div>

                  <div className="fault-row-item">
                    <div className="fault-row-header info">
                      <Activity size={15} />
                      <span>Individual Link Severing Impact</span>
                    </div>
                    <p className="fault-row-desc">{currentTheory.faultTolerance.linkFailure}</p>
                  </div>

                  <div className="fault-row-item">
                    <div className="fault-row-header diagnostic">
                      <Shield size={15} />
                      <span>Hardware Diagnostics & Detection</span>
                    </div>
                    <p className="fault-row-desc">{currentTheory.faultTolerance.diagnostics}</p>
                  </div>
                </div>
              </div>

              {/* Section 5: Real-World Industry Standards & Deployments */}
              <div className="theory-content-card">
                <div className="theory-card-header-row">
                  <div className="theory-card-number">05</div>
                  <h3 className="theory-card-title">Industry Standards & Real-World Deployments</h3>
                </div>

                <div className="standards-badge-bar">
                  <span className="standards-bar-label">Governing Specifications:</span>
                  <span className="standards-spec-text">{currentTheory.industryUse.standards}</span>
                </div>

                <div className="deployments-list">
                  <h4 className="deployments-heading">Active Industrial Deployments:</h4>
                  <ul>
                    {currentTheory.industryUse.realWorld.map((useCase, idx) => (
                      <li key={idx}>
                        <ArrowRight size={13} className="deploy-bullet-icon" />
                        <span>{useCase}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Section 6: Comprehensive Pros & Cons */}
              <div className="theory-pros-cons-grid">
                <div className="pros-card">
                  <div className="card-pro-title">
                    <CheckCircle size={16} />
                    <span>Architectural Advantages</span>
                  </div>
                  <ul>
                    {currentTheory.pros.map((pro, idx) => (
                      <li key={idx}>{pro}</li>
                    ))}
                  </ul>
                </div>

                <div className="cons-card">
                  <div className="card-con-title">
                    <AlertTriangle size={16} />
                    <span>Trade-offs & Constraints</span>
                  </div>
                  <ul>
                    {currentTheory.cons.map((con, idx) => (
                      <li key={idx}>{con}</li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>

            {/* Right Column: Static Visual Example Schematic & Specs */}
            <div className="theory-side-column">
              {/* Technical Specifications Matrix Card */}
              <div className="theory-specs-card">
                <div className="specs-card-header">
                  <Calculator size={16} />
                  <h3>Technical Specifications</h3>
                </div>

                <div className="specs-table-list">
                  <div className="specs-table-row">
                    <span className="spec-row-key">Topology Class</span>
                    <span className="spec-row-val highlight">{currentTheory.specs.topologyType}</span>
                  </div>
                  <div className="specs-table-row">
                    <span className="spec-row-key">Cabling Footprint</span>
                    <span className="spec-row-val">{currentTheory.specs.cableFootprint}</span>
                  </div>
                  <div className="specs-table-row">
                    <span className="spec-row-key">Setup Complexity</span>
                    <span className="spec-row-val">{currentTheory.specs.installationComplexity}</span>
                  </div>
                  <div className="specs-table-row">
                    <span className="spec-row-key">Resilience Rating</span>
                    <span className="spec-row-val rating">{currentTheory.specs.faultTolerance}</span>
                  </div>
                  <div className="specs-table-row">
                    <span className="spec-row-key">Standard Distance</span>
                    <span className="spec-row-val">{currentTheory.specs.typicalSpan}</span>
                  </div>
                  <div className="specs-table-row">
                    <span className="spec-row-key">Collision Domains</span>
                    <span className="spec-row-val">{currentTheory.specs.collisionDomains}</span>
                  </div>
                </div>
              </div>

              {/* Interactive Architecture Schematic with Zoom & Pan */}
              <div className="theory-visual-card">
                <div className="visual-card-header">
                  <h3>Interactive Architecture Schematic</h3>
                  <span className="visual-label-tag">Figure 1.1 · Zoom & Pan</span>
                </div>

                <InteractiveSchematicViewer
                  topologyKey={currentTopoKey}
                  topologyName={currentTopo.name}
                />

                <div className="diagram-annotation-box">
                  <h4>Component Breakdown</h4>
                  <div className="annotation-items-list">
                    <div className="anno-item">
                      <span className="anno-dot" />
                      <span><strong>End Stations:</strong> Host devices transmitting data frames.</span>
                    </div>
                    <div className="anno-item">
                      <span className="anno-dot" />
                      <span><strong>Conduits:</strong> Physical copper/fiber media connecting topology vertices.</span>
                    </div>
                    <div className="anno-item">
                      <span className="anno-dot" />
                      <span><strong>Signaling:</strong> Governed by IEEE 802 physical specifications.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Launch Simulation Card */}
              <div className="theory-simulation-cta-card">
                <div className="cta-icon-wrap">
                  <Zap size={20} />
                </div>
                <h4>Interactive Simulation</h4>
                <p>Observe live packet routing, frame headers, and link states on this topology.</p>
                <button
                  type="button"
                  className="theory-launch-sim-btn"
                  onClick={() => setActiveTab('practical')}
                >
                  <span>Launch Functional Model</span>
                  <ArrowRight size={14} />
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: PRACTICAL (INTERACTIVE SIMULATION LAB)            */}
        {/* ======================================================== */}
        {activeTab === 'practical' && (
          <div className="topolab-practical-layout">
            
            {/* Left Panel: Node Config & Data Flow Controls */}
            <div className="sim-controls-panel">
              <div className="controls-panel-card">
                <h3 className="panel-title">
                  <Sliders size={16} />
                  <span>Data Flow Control</span>
                </h3>

                <div className="controls-flow-grid">
                  {/* Source Node Selector */}
                  <div className="flow-field">
                    <label className="field-label">Source Node (Sender):</label>
                    <select
                      className="flow-select"
                      value={sourceNodeId}
                      onChange={(e) => {
                        setSourceNodeId(e.target.value);
                        addLog(`Sender set to Node ${nodes.find(n => n.id === e.target.value)?.label}`, 'config');
                      }}
                      disabled={isPlaying}
                    >
                      {nodes.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.label} - {n.name} ({n.role.toUpperCase()})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Destination Node Selector */}
                  <div className="flow-field">
                    <label className="field-label">Destination Node (Receiver):</label>
                    <select
                      className="flow-select"
                      value={targetNodeId}
                      onChange={(e) => {
                        setTargetNodeId(e.target.value);
                        addLog(`Receiver set to Node ${nodes.find(n => n.id === e.target.value)?.label}`, 'config');
                      }}
                      disabled={isPlaying}
                    >
                      {nodes.map((n) => (
                        <option key={n.id} value={n.id} disabled={n.id === sourceNodeId}>
                          {n.label} - {n.name} ({n.role.toUpperCase()})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Packet Protocol */}
                  <div className="flow-field">
                    <label className="field-label">Transmission Protocol:</label>
                    <select
                      className="flow-select"
                      value={packetType}
                      onChange={(e) => setPacketType(e.target.value)}
                      disabled={isPlaying}
                    >
                      <option value="DATA">Standard Data Frame (TCP ACK)</option>
                      <option value="UDP">High-Speed UDP Telemetry</option>
                      <option value="ICMP">ICMP Echo Ping Request</option>
                    </select>
                  </div>
                </div>

                {/* Node Manager Section */}
                <div className="node-manager-header">
                  <div className="node-manager-title">
                    <Server size={14} />
                    <h4 className="sub-title">Node Configuration & Roles</h4>
                  </div>
                  <div className="node-count-actions">
                    <button 
                      type="button" 
                      className="node-action-pill add-btn"
                      onClick={handleAddNode}
                      disabled={nodes.length >= 8 || isPlaying}
                      title="Add new network node"
                    >
                      <Plus size={13} />
                      <span>Add Node</span>
                    </button>
                    <button 
                      type="button" 
                      className="node-action-pill remove-btn"
                      onClick={handleRemoveNode}
                      disabled={nodes.length <= 3 || isPlaying}
                      title="Remove last network node"
                    >
                      <Minus size={13} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>

                <div className="nodes-config-list">
                  {nodes.map((node) => (
                    <div key={node.id} className={`node-row-item ${node.status === 'offline' ? 'offline' : ''}`}>
                      <div className="node-badge-col">
                        <span className="node-avatar-badge">{node.label}</span>
                      </div>

                      <div className="node-inputs-col">
                        <input
                          type="text"
                          className="node-rename-input"
                          value={node.name}
                          onChange={(e) => handleNameChange(node.id, e.target.value)}
                          placeholder="Node name"
                          disabled={isPlaying}
                        />

                        {/* Role selection dropdown */}
                        <select
                          className="node-role-select"
                          value={node.role}
                          onChange={(e) => handleRoleChange(node.id, e.target.value)}
                          disabled={isPlaying}
                        >
                          {currentTopoKey === 'star' && (
                            <>
                              <option value="hub">Central Hub / Switch</option>
                              <option value="node">Client Station</option>
                            </>
                          )}
                          {currentTopoKey === 'tree' && (
                            <>
                              <option value="root">Root Core Switch</option>
                              <option value="node">Branch / Leaf</option>
                            </>
                          )}
                          {currentTopoKey === 'bus' && (
                            <>
                              <option value="node">Bus Station</option>
                              <option value="terminator">Terminator Tap</option>
                            </>
                          )}
                          {(currentTopoKey === 'ring' || currentTopoKey === 'mesh' || currentTopoKey === 'hybrid') && (
                            <>
                              <option value="node">Standard Node</option>
                              <option value="gateway">Gateway / Monitor</option>
                            </>
                          )}
                        </select>
                      </div>

                      {/* Online / Offline switch button */}
                      <button
                        type="button"
                        className={`node-status-toggle ${node.status}`}
                        onClick={() => handleToggleNodeHealth(node.id)}
                        title={`Click to toggle ${node.name} online/offline`}
                      >
                        <span className={`status-dot ${node.status}`} />
                        <span>{node.status === 'online' ? 'Active' : 'Down'}</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Example Quick Action Helper Box */}
                <div className="sim-example-helper">
                  <div className="helper-title">
                    <Zap size={14} />
                    <span>{currentScenario.title}</span>
                  </div>
                  <p>{currentScenario.desc}</p>
                </div>
              </div>
            </div>

            {/* Right Panel: Simulation Canvas & Playback */}
            <div className="sim-canvas-panel">
              <div className="sim-panel-header">
                <div className="sim-header-title">
                  <Activity size={18} className="pulse-icon" />
                  <span>Interactive Node Stage</span>
                </div>
                
                {/* Play, Pause, Stop Bar */}
                <div className="sim-playback-controls">
                  {!isPlaying ? (
                    <button
                      type="button"
                      className="sim-ctrl-btn play-btn"
                      onClick={handlePlaySimulation}
                    >
                      <Play size={15} fill="currentColor" />
                      <span>Play Simulation</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="sim-ctrl-btn pause-btn"
                        onClick={handlePauseSimulation}
                      >
                        <Pause size={15} />
                        <span>{isPaused ? 'Resume' : 'Pause'}</span>
                      </button>

                      <button
                        type="button"
                        className="sim-ctrl-btn stop-btn"
                        onClick={handleStopSimulation}
                      >
                        <Square size={14} fill="currentColor" />
                        <span>Stop</span>
                      </button>
                    </>
                  )}

                  {/* Speed Selector */}
                  <div className="sim-speed-selector">
                    <button 
                      type="button" 
                      className={`speed-pill ${simSpeed === 0.5 ? 'active' : ''}`}
                      onClick={() => setSimSpeed(0.5)}
                    >
                      0.5x
                    </button>
                    <button 
                      type="button" 
                      className={`speed-pill ${simSpeed === 1 ? 'active' : ''}`}
                      onClick={() => setSimSpeed(1)}
                    >
                      1x
                    </button>
                    <button 
                      type="button" 
                      className={`speed-pill ${simSpeed === 2 ? 'active' : ''}`}
                      onClick={() => setSimSpeed(2)}
                    >
                      2x
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              <div className={`sim-status-banner ${isPlaying ? (isPaused ? 'paused' : 'running') : 'idle'}`}>
                <div className="status-indicator-dot" />
                <span>
                  {isPlaying
                    ? isPaused
                      ? 'SIMULATION PAUSED'
                      : `CONTINUOUS TRANSMISSION ACTIVE: Node ${nodes.find(n => n.id === sourceNodeId)?.label} ➔ Node ${nodes.find(n => n.id === targetNodeId)?.label} [Packet #${packetSeq}]`
                    : 'READY: Choose source, destination, and press Play to stream continuous data.'}
                </span>
              </div>

              {/* SVG Topology Simulation Stage */}
              <div className="svg-stage-wrapper">
                <svg viewBox="0 0 700 500" className="topology-interactive-svg">
                  <defs>
                    <linearGradient id="linkActiveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#00bf63" />
                      <stop offset="100%" stop-color="#38bdf8" />
                    </linearGradient>
                    <filter id="packetGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Render Topology Links */}
                  {/* STAR TOPOLOGY LINKS */}
                  {currentTopoKey === 'star' && (() => {
                    const hubIndex = nodes.findIndex((n) => n.role === 'hub');
                    const hub = getNodeCoordinates(hubIndex !== -1 ? hubIndex : 0, nodes.length);
                    return nodes.map((node, idx) => {
                      if (node.role === 'hub') return null;
                      const pt = getNodeCoordinates(idx, nodes.length);
                      const isTransmitting = isPlaying && 
                        ((currentHop.from === node.id && currentHop.to === (nodes[hubIndex]?.id || nodes[0].id)) ||
                         (currentHop.from === (nodes[hubIndex]?.id || nodes[0].id) && currentHop.to === node.id));

                      return (
                        <line
                          key={node.id}
                          x1={hub.x}
                          y1={hub.y}
                          x2={pt.x}
                          y2={pt.y}
                          stroke={isTransmitting ? '#00bf63' : 'rgba(255, 255, 255, 0.15)'}
                          strokeWidth={isTransmitting ? 4 : 2}
                          strokeDasharray={isTransmitting ? '6 4' : 'none'}
                          className={isTransmitting ? 'active-cable-pulse' : ''}
                        />
                      );
                    });
                  })()}

                  {/* RING TOPOLOGY LINKS */}
                  {currentTopoKey === 'ring' && (() => {
                    return nodes.map((node, idx) => {
                      const nextIdx = (idx + 1) % nodes.length;
                      const p1 = getNodeCoordinates(idx, nodes.length);
                      const p2 = getNodeCoordinates(nextIdx, nodes.length);
                      const isTransmitting = isPlaying && currentHop.from === node.id && currentHop.to === nodes[nextIdx].id;

                      return (
                        <line
                          key={node.id}
                          x1={p1.x}
                          y1={p1.y}
                          x2={p2.x}
                          y2={p2.y}
                          stroke={isTransmitting ? '#c084fc' : 'rgba(192, 132, 252, 0.3)'}
                          strokeWidth={isTransmitting ? 4 : 2.5}
                          strokeDasharray={isTransmitting ? '6 4' : 'none'}
                        />
                      );
                    });
                  })()}

                  {/* BUS TOPOLOGY LINKS */}
                  {currentTopoKey === 'bus' && (() => {
                    return (
                      <g>
                        {/* Coaxial Backbone Trunk Glow */}
                        <line x1={70} y1={250} x2={630} y2={250} stroke="#38bdf8" strokeWidth={12} strokeOpacity={0.2} strokeLinecap="round" />
                        {/* Core Coaxial Cable */}
                        <line x1={70} y1={250} x2={630} y2={250} stroke="#38bdf8" strokeWidth={5} strokeLinecap="round" />

                        {/* Left 50-Ohm Terminator */}
                        <g transform="translate(68, 230)">
                          <rect x={-10} y={0} width={18} height={40} rx={4} fill="#180a0c" stroke="#ef4444" strokeWidth={2} />
                          <circle cx={-1} cy={20} r={3} fill="#ef4444" />
                          <text x={-1} y={52} fill="#ef4444" fontSize={9} fontFamily="'JetBrains Mono', monospace" fontWeight={800} textAnchor="middle">50Ω</text>
                        </g>

                        {/* Right 50-Ohm Terminator */}
                        <g transform="translate(632, 230)">
                          <rect x={-8} y={0} width={18} height={40} rx={4} fill="#180a0c" stroke="#ef4444" strokeWidth={2} />
                          <circle cx={1} cy={20} r={3} fill="#ef4444" />
                          <text x={1} y={52} fill="#ef4444" fontSize={9} fontFamily="'JetBrains Mono', monospace" fontWeight={800} textAnchor="middle">50Ω</text>
                        </g>

                        {/* Drop cables to nodes */}
                        {nodes.map((node, idx) => {
                          const pt = getNodeCoordinates(idx, nodes.length);
                          const isTapActive = isPlaying && (currentHop.from === node.id || currentHop.to === node.id);
                          return (
                            <g key={node.id}>
                              <line
                                x1={pt.tapX}
                                y1={pt.busY}
                                x2={pt.x}
                                y2={pt.y}
                                stroke={isTapActive ? '#00bf63' : 'rgba(56, 189, 248, 0.45)'}
                                strokeWidth={isTapActive ? 3.5 : 2}
                                strokeDasharray={isTapActive ? '6 4' : '4 4'}
                                className={isTapActive ? 'active-cable-pulse' : ''}
                              />
                              <circle 
                                cx={pt.tapX} 
                                cy={pt.busY} 
                                r={isTapActive ? 7 : 5} 
                                fill={isTapActive ? '#00bf63' : '#38bdf8'} 
                                stroke="#04060a" 
                                strokeWidth={2}
                              />
                            </g>
                          );
                        })}
                      </g>
                    );
                  })()}

                  {/* MESH TOPOLOGY LINKS */}
                  {currentTopoKey === 'mesh' && (() => {
                    const lines = [];
                    for (let i = 0; i < nodes.length; i++) {
                      for (let j = i + 1; j < nodes.length; j++) {
                        const p1 = getNodeCoordinates(i, nodes.length);
                        const p2 = getNodeCoordinates(j, nodes.length);
                        const isTransmitting = isPlaying && 
                          ((currentHop.from === nodes[i].id && currentHop.to === nodes[j].id) ||
                           (currentHop.from === nodes[j].id && currentHop.to === nodes[i].id));
                        lines.push(
                          <line
                            key={`${i}-${j}`}
                            x1={p1.x}
                            y1={p1.y}
                            x2={p2.x}
                            y2={p2.y}
                            stroke={isTransmitting ? '#f59e0b' : 'rgba(245, 158, 11, 0.22)'}
                            strokeWidth={isTransmitting ? 4 : 1.5}
                          />
                        );
                      }
                    }
                    return lines;
                  })()}

                  {/* TREE TOPOLOGY LINKS */}
                  {currentTopoKey === 'tree' && (() => {
                    const links = [];
                    const root = getNodeCoordinates(0, nodes.length);

                    const isLinkActive = (fromNodeId, toNodeId) => {
                      return isPlaying && (
                        (currentHop.from === fromNodeId && currentHop.to === toNodeId) ||
                        (currentHop.from === toNodeId && currentHop.to === fromNodeId)
                      );
                    };

                    // Root to tier 1
                    if (nodes.length > 1) {
                      const t1a = getNodeCoordinates(1, nodes.length);
                      const active = isLinkActive(nodes[0].id, nodes[1].id);
                      links.push(
                        <line
                          key="r-1"
                          x1={root.x}
                          y1={root.y}
                          x2={t1a.x}
                          y2={t1a.y}
                          stroke={active ? '#10b981' : 'rgba(16, 185, 129, 0.35)'}
                          strokeWidth={active ? 4.5 : 2.5}
                          strokeDasharray={active ? '6 4' : 'none'}
                          className={active ? 'active-cable-pulse' : ''}
                        />
                      );
                    }
                    if (nodes.length > 2) {
                      const t1b = getNodeCoordinates(2, nodes.length);
                      const active = isLinkActive(nodes[0].id, nodes[2].id);
                      links.push(
                        <line
                          key="r-2"
                          x1={root.x}
                          y1={root.y}
                          x2={t1b.x}
                          y2={t1b.y}
                          stroke={active ? '#10b981' : 'rgba(16, 185, 129, 0.35)'}
                          strokeWidth={active ? 4.5 : 2.5}
                          strokeDasharray={active ? '6 4' : 'none'}
                          className={active ? 'active-cable-pulse' : ''}
                        />
                      );
                    }
                    // Tier 1 to leaves
                    for (let i = 3; i < nodes.length; i++) {
                      const parentIdx = i % 2 === 1 ? 1 : 2;
                      const parent = getNodeCoordinates(parentIdx, nodes.length);
                      const leaf = getNodeCoordinates(i, nodes.length);
                      const active = isLinkActive(nodes[parentIdx].id, nodes[i].id);
                      links.push(
                        <line
                          key={`l-${i}`}
                          x1={parent.x}
                          y1={parent.y}
                          x2={leaf.x}
                          y2={leaf.y}
                          stroke={active ? '#10b981' : 'rgba(16, 185, 129, 0.3)'}
                          strokeWidth={active ? 4 : 2}
                          strokeDasharray={active ? '6 4' : 'none'}
                          className={active ? 'active-cable-pulse' : ''}
                        />
                      );
                    }
                    return links;
                  })()}

                  {/* HYBRID TOPOLOGY LINKS */}
                  {currentTopoKey === 'hybrid' && (() => {
                    const links = [];
                    const h1 = getNodeCoordinates(0, nodes.length);
                    const h2 = nodes[3] ? getNodeCoordinates(3, nodes.length) : h1;

                    // Inter-hub trunk bridge
                    if (nodes[3]) {
                      const isBridgeActive = isPlaying && 
                        ((currentHop.from === nodes[0].id && currentHop.to === nodes[3].id) ||
                         (currentHop.from === nodes[3].id && currentHop.to === nodes[0].id));
                      links.push(
                        <line
                          key="bridge"
                          x1={h1.x}
                          y1={h1.y}
                          x2={h2.x}
                          y2={h2.y}
                          stroke={isBridgeActive ? '#a855f7' : 'rgba(168, 85, 247, 0.45)'}
                          strokeWidth={isBridgeActive ? 5 : 3}
                          strokeDasharray={isBridgeActive ? '6 4' : 'none'}
                          className={isBridgeActive ? 'active-cable-pulse' : ''}
                        />
                      );
                    }

                    // Left cluster spokes
                    for (let i = 1; i <= Math.min(2, nodes.length - 1); i++) {
                      const pt = getNodeCoordinates(i, nodes.length);
                      const isActive = isPlaying && 
                        ((currentHop.from === nodes[0].id && currentHop.to === nodes[i].id) ||
                         (currentHop.from === nodes[i].id && currentHop.to === nodes[0].id));
                      links.push(
                        <line
                          key={`l-spoke-${i}`}
                          x1={h1.x}
                          y1={h1.y}
                          x2={pt.x}
                          y2={pt.y}
                          stroke={isActive ? '#00bf63' : 'rgba(0, 191, 99, 0.3)'}
                          strokeWidth={isActive ? 4 : 2}
                          strokeDasharray={isActive ? '6 4' : 'none'}
                          className={isActive ? 'active-cable-pulse' : ''}
                        />
                      );
                    }

                    // Right cluster spokes
                    for (let i = 4; i < nodes.length; i++) {
                      const pt = getNodeCoordinates(i, nodes.length);
                      const isActive = isPlaying && 
                        ((currentHop.from === nodes[3].id && currentHop.to === nodes[i].id) ||
                         (currentHop.from === nodes[i].id && currentHop.to === nodes[3].id));
                      links.push(
                        <line
                          key={`r-spoke-${i}`}
                          x1={h2.x}
                          y1={h2.y}
                          x2={pt.x}
                          y2={pt.y}
                          stroke={isActive ? '#38bdf8' : 'rgba(56, 189, 248, 0.3)'}
                          strokeWidth={isActive ? 4 : 2}
                          strokeDasharray={isActive ? '6 4' : 'none'}
                          className={isActive ? 'active-cable-pulse' : ''}
                        />
                      );
                    }

                    return links;
                  })()}

                  {/* Render Nodes */}
                  {nodes.map((node, idx) => {
                    const { x, y } = getNodeCoordinates(idx, nodes.length);
                    const isSource = node.id === sourceNodeId;
                    const isTarget = node.id === targetNodeId;
                    const isHub = node.role === 'hub' || node.role === 'root';
                    const isOffline = node.status === 'offline';

                    const roleLabel =
                      node.role === 'root'
                        ? 'ROOT'
                        : node.role === 'hub'
                        ? 'HUB'
                        : node.role === 'terminator'
                        ? 'TERM'
                        : node.role === 'gateway'
                        ? 'GW'
                        : null;

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${x}, ${y})`}
                        className="interactive-svg-node"
                        onClick={() => {
                          if (isOffline) {
                            handleToggleNodeHealth(node.id);
                          } else if (sourceNodeId !== node.id) {
                            setTargetNodeId(node.id);
                            addLog(`Set target to ${node.label} (${node.name})`, 'config');
                          }
                        }}
                      >
                        {/* Glow halo for source or target - properly sized so it won't collide with labels */}
                        {isSource && (
                          <circle
                            r={isHub ? 36 : 28}
                            fill="none"
                            stroke="#00bf63"
                            strokeWidth="2.5"
                            strokeDasharray="4 4"
                            className="pulse-icon"
                          />
                        )}
                        {isTarget && (
                          <circle
                            r={isHub ? 36 : 28}
                            fill="none"
                            stroke="#38bdf8"
                            strokeWidth="2.5"
                            strokeDasharray="4 4"
                            className="pulse-icon"
                          />
                        )}

                        {/* Node circle */}
                        <circle
                          r={isHub ? 30 : 22}
                          fill={isOffline ? '#2a1215' : isHub ? '#0c1f19' : '#0e1726'}
                          stroke={
                            isOffline
                              ? '#ef4444'
                              : isSource
                              ? '#00bf63'
                              : isTarget
                              ? '#38bdf8'
                              : isHub
                              ? '#00bf63'
                              : '#ffffff'
                          }
                          strokeWidth={isHub ? 3 : 2}
                        />

                        {/* Node Identifier letter */}
                        <text
                          y={roleLabel ? -3 : 4}
                          fontFamily="'Outfit', sans-serif"
                          fontSize={isHub ? 15 : 13}
                          fontWeight="800"
                          fill={isOffline ? '#ef4444' : '#ffffff'}
                          textAnchor="middle"
                        >
                          {node.label}
                        </text>

                        {/* Role tag inside circle (ROOT, HUB, etc.) */}
                        {roleLabel && (
                          <text
                            y={13}
                            fontFamily="'JetBrains Mono', monospace"
                            fontSize="8.5"
                            fontWeight="800"
                            fill={node.role === 'root' ? '#10b981' : node.role === 'hub' ? '#00bf63' : '#38bdf8'}
                            textAnchor="middle"
                          >
                            {roleLabel}
                          </text>
                        )}

                        {/* Status Pin (Green = online, Red = offline) */}
                        <circle
                          cx={isHub ? 21 : 16}
                          cy={isHub ? -21 : -16}
                          r={4}
                          fill={isOffline ? '#ef4444' : '#00bf63'}
                        />

                        {/* Node Friendly Name (e.g. Node A, Node B) */}
                        <text
                          y={isHub ? 45 : 37}
                          fontFamily="'Outfit', sans-serif"
                          fontSize="11"
                          fontWeight="600"
                          fill="#94a3b8"
                          textAnchor="middle"
                        >
                          {node.name}
                        </text>

                        {/* Dedicated SOURCE / TARGET Badge Pill */}
                        {(isSource || isTarget) && (
                          <g transform={`translate(0, ${isHub ? 59 : 51})`}>
                            <rect
                              x="-26"
                              y="-8"
                              width="52"
                              height="16"
                              rx="8"
                              fill={isSource ? 'rgba(0, 191, 99, 0.18)' : 'rgba(56, 189, 248, 0.18)'}
                              stroke={isSource ? '#00bf63' : '#38bdf8'}
                              strokeWidth="1.2"
                            />
                            <text
                              y="3"
                              fontFamily="'JetBrains Mono', monospace"
                              fontSize="8"
                              fontWeight="800"
                              letterSpacing="0.8"
                              fill={isSource ? '#00bf63' : '#38bdf8'}
                              textAnchor="middle"
                            >
                              {isSource ? 'SOURCE' : 'TARGET'}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* Dynamic Glowing Packet in Transit */}
                  {isPlaying && packetCoord && (
                    <g transform={`translate(${packetCoord.x}, ${packetCoord.y})`} filter="url(#packetGlow)">
                      <circle r="11" fill="#00bf63" opacity="0.3" className="pulse-icon" />
                      <circle r="7" fill="#ffffff" stroke="#00bf63" strokeWidth="2" />
                      <text
                        y="3"
                        fontFamily="'JetBrains Mono', monospace"
                        fontSize="7"
                        fontWeight="900"
                        fill="#000000"
                        textAnchor="middle"
                      >
                        P
                      </text>
                    </g>
                  )}
                </svg>
              </div>

              {/* Bottom Telemetry Console */}
              <div className="sim-telemetry-console">
                <div className="telemetry-bar-top">
                  <div className="telemetry-title">
                    <Terminal size={14} />
                    <span>Real-Time Packet Stream Telemetry</span>
                  </div>
                  <button 
                    type="button" 
                    className="telemetry-clear-btn"
                    onClick={() => setTelemetryLogs([])}
                    title="Clear console output"
                  >
                    <Trash2 size={12} />
                    <span>Clear Console</span>
                  </button>
                </div>

                <div className="telemetry-log-scroll">
                  {telemetryLogs.length === 0 ? (
                    <div className="telemetry-empty">Waiting for transmission. Press 'Play Simulation' above.</div>
                  ) : (
                    telemetryLogs.map((log) => (
                      <div key={log.id} className={`telemetry-row ${log.type}`}>
                        <span className="log-time">[{log.time}]</span>
                        <span className="log-text">{log.msg}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: MORE PRACTICAL (CHAOS TESTING & FAULT RESILIENCY) */}
        {/* ======================================================== */}
        {activeTab === 'more-practical' && (
          <div className="topolab-morepractical-layout">
            <div className="more-grid">
              
              {/* Failure Impact Analysis Card */}
              <div className="more-card">
                <div className="more-card-header">
                  <AlertTriangle size={18} className="warn-icon" />
                  <h3>Fault Injection & Single Point of Failure Analysis</h3>
                </div>
                <p className="more-desc">
                  Simulate network cable disconnections, hardware breakdowns, and packet collisions in real time.
                </p>

                <div className="fault-test-buttons-row">
                  <button
                    type="button"
                    className="fault-scenario-btn"
                    onClick={() => {
                      // Star: break hub
                      const hub = nodes.find(n => n.role === 'hub') || nodes[0];
                      handleToggleNodeHealth(hub.id);
                    }}
                  >
                    <span>Sever Central Hub (Star Test)</span>
                  </button>

                  <button
                    type="button"
                    className="fault-scenario-btn"
                    onClick={() => {
                      // Ring: break 1 node
                      handleToggleNodeHealth(nodes[1]?.id || 'node-b');
                    }}
                  >
                    <span>Sever Ring Link (Token Ring Test)</span>
                  </button>

                  <button
                    type="button"
                    className="fault-scenario-btn"
                    onClick={() => {
                      // Restore all nodes
                      setNodes(prev => prev.map(n => ({ ...n, status: 'online' })));
                      addLog('Restored all nodes to 100% HEALTHY online state.', 'success');
                    }}
                  >
                    <span>Restore All Nodes to Online</span>
                  </button>
                </div>

                {/* Impact assessment summary */}
                <div className="fault-verdict-box">
                  <h4>Topology Resiliency Matrix</h4>
                  <div className="resiliency-specs-grid">
                    <div className="spec-metric">
                      <span className="metric-title">Fault Tolerance Rating</span>
                      <span className="metric-val">
                        {currentTopoKey === 'mesh' ? '99.999% (Full P2P)' : currentTopoKey === 'star' ? '75% (Hub Vulnerable)' : '40% (Single Loop)'}
                      </span>
                    </div>
                    <div className="spec-metric">
                      <span className="metric-title">Cable Requirement</span>
                      <span className="metric-val">
                        {currentTopoKey === 'mesh' ? 'O(N²) High' : currentTopoKey === 'star' ? 'O(N) Moderate' : 'O(N) Low'}
                      </span>
                    </div>
                    <div className="spec-metric">
                      <span className="metric-title">Broadcast Domain</span>
                      <span className="metric-val">Single Shared Subnet</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Traffic Mode Experimenter */}
              <div className="more-card">
                <div className="more-card-header">
                  <Radio size={18} />
                  <h3>Transmission Modes: Unicast vs Broadcast</h3>
                </div>
                <p className="more-desc">
                  Explore how frames propagate across broadcast domains versus switched unicast segments.
                </p>

                <div className="traffic-mode-options">
                  <label className={`traffic-radio-pill ${trafficMode === 'unicast' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="traffic"
                      value="unicast"
                      checked={trafficMode === 'unicast'}
                      onChange={() => {
                        setTrafficMode('unicast');
                        addLog('Switched to UNICAST mode: Direct address filtering active.', 'info');
                      }}
                    />
                    <span>Unicast (Directed)</span>
                  </label>

                  <label className={`traffic-radio-pill ${trafficMode === 'broadcast' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="traffic"
                      value="broadcast"
                      checked={trafficMode === 'broadcast'}
                      onChange={() => {
                        setTrafficMode('broadcast');
                        addLog('Switched to BROADCAST mode: All nodes receive frame simultaneously.', 'warning');
                      }}
                    />
                    <span>Broadcast (All Nodes)</span>
                  </label>

                  <label className={`traffic-radio-pill ${trafficMode === 'collision' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="traffic"
                      value="collision"
                      checked={trafficMode === 'collision'}
                      onChange={() => {
                        setTrafficMode('collision');
                        addLog('Switched to CSMA/CD SIMULATION: Multiple stations contend for line.', 'error');
                      }}
                    />
                    <span>CSMA/CD Contention</span>
                  </label>
                </div>

                <div className="mode-explanation-box">
                  {trafficMode === 'unicast' && (
                    <p>
                      <strong>Unicast Transmission:</strong> Packet headers contain a specific destination MAC address (e.g. Node E). Only Node E inspects the packet; non-target stations ignore the frame.
                    </p>
                  )}
                  {trafficMode === 'broadcast' && (
                    <p>
                      <strong>Broadcast Transmission:</strong> Packet is addressed to <code>FF:FF:FF:FF:FF:FF</code>. In Bus and unmanaged Hub networks, every connected station processes the packet interrupt.
                    </p>
                  )}
                  {trafficMode === 'collision' && (
                    <p>
                      <strong>Carrier Sense Multiple Access with Collision Detection (CSMA/CD):</strong> When two stations transmit concurrently on a shared cable, voltage levels exceed thresholds, generating a jam signal and forcing random exponential backoff intervals.
                    </p>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
