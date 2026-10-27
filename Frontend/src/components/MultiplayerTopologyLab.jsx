import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Radio,
  Send,
  Play,
  RotateCcw,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle2,
  Server,
  Activity,
  Layers,
  ArrowRight,
  Shield,
  Zap,
  Terminal,
  Save,
  LogIn,
  Sliders,
  Sparkles,
  ExternalLink,
  Laptop,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl, safeJsonParse } from '../utils/api';
import './MultiplayerTopologyLab.css';

const NODE_COLORS = {
  A: '#3b82f6', // Electric Blue
  B: '#10b981', // Emerald
  C: '#f59e0b', // Amber
  D: '#ec4899', // Pink
  E: '#8b5cf6', // Violet
  F: '#06b6d4', // Cyan
  G: '#14b8a6', // Teal
  H: '#f97316'  // Orange
};

export default function MultiplayerTopologyLab({
  topologyType = 'ring',
  currentTopoName = 'Ring Topology'
}) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Active Room State
  const [room, setRoom] = useState(null);
  const [roomCode, setRoomCode] = useState('');
  const [isHost, setIsHost] = useState(false);

  // Lobby States
  const [lobbyTab, setLobbyTab] = useState('create'); // 'create' | 'join'
  const [reqNodes, setReqNodes] = useState(4); // 2 to 6
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lobbyError, setLobbyError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Host Configuration Controls
  const [payloadInput, setPayloadInput] = useState('Hello Netrium');
  const [selectedSource, setSelectedSource] = useState('node-a');
  const [selectedTarget, setSelectedTarget] = useState('node-c');
  const [assignmentDraft, setAssignmentDraft] = useState({});

  // Simulation playback state
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [activeStepIdx, setActiveStepIdx] = useState(0);

  // Save Lab State
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');

  // Polling ref to prevent concurrent duplicate calls
  const isPollingRef = useRef(false);
  const autoStepTimerRef = useRef(null);

  // Current user's email normalized
  const myEmail = useMemo(() => (user?.email || '').toLowerCase().trim(), [user]);

  // Determine current user's assigned node
  const myParticipant = useMemo(() => {
    if (!room || !myEmail) return null;
    return room.participants.find(p => (p.email || '').toLowerCase().trim() === myEmail);
  }, [room, myEmail]);

  const myNode = useMemo(() => {
    if (!room || !myParticipant?.nodeId) return null;
    return room.nodes.find(n => n.id === myParticipant.nodeId);
  }, [room, myParticipant]);

  // Sync draft assignments when room updates
  useEffect(() => {
    if (room) {
      setIsHost((room.hostEmail || '').toLowerCase().trim() === myEmail);
      setSelectedSource(room.sourceNodeId || 'node-a');
      setSelectedTarget(room.targetNodeId || 'node-c');
      if (room.payloadText) setPayloadInput(room.payloadText);

      const drafts = {};
      room.participants.forEach(p => {
        drafts[p.email] = p.nodeId || '';
      });
      setAssignmentDraft(drafts);
    }
  }, [room?.code, room?.hostEmail, myEmail]);

  // ========================================================
  // REAL-TIME POLLING & HEARTBEAT ENGINE (Sub-second sync)
  // ========================================================
  useEffect(() => {
    if (!roomCode) return;

    // Fast polling every 900ms for instant real-time synchronization across devices
    const pollInterval = setInterval(async () => {
      if (isPollingRef.current) return;
      isPollingRef.current = true;

      try {
        const res = await fetch(getApiUrl(`/api/topology-rooms/${roomCode}`));
        if (res.ok) {
          const data = await safeJsonParse(res);
          if (data.success && data.room) {
            setRoom(prev => {
              // Only trigger state update if JSON actually changed
              const prevJson = JSON.stringify({
                p: prev?.participants,
                s: prev?.simulation,
                n: prev?.nodes,
                src: prev?.sourceNodeId,
                tgt: prev?.targetNodeId,
                txt: prev?.payloadText
              });
              const newJson = JSON.stringify({
                p: data.room.participants,
                s: data.room.simulation,
                n: data.room.nodes,
                src: data.room.sourceNodeId,
                tgt: data.room.targetNodeId,
                txt: data.room.payloadText
              });
              return prevJson !== newJson ? data.room : prev;
            });
          }
        }
      } catch (err) {
        console.warn('[Room Sync Warning]', err.message);
      } finally {
        isPollingRef.current = false;
      }
    }, 900);

    // Heartbeat presence ping every 3.5s to keep green dot alive
    const pingInterval = setInterval(async () => {
      if (!myEmail) return;
      try {
        await fetch(getApiUrl(`/api/topology-rooms/${roomCode}/ping`), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: myEmail })
        });
      } catch (err) {
        // silent ping failure
      }
    }, 3500);

    return () => {
      clearInterval(pollInterval);
      clearInterval(pingInterval);
    };
  }, [roomCode, myEmail]);

  // ========================================================
  // AUTOMATED STEPPED PLAYBACK (Hop-by-hop synchronization)
  // ========================================================
  useEffect(() => {
    if (room?.simulation?.status === 'running') {
      const path = room.simulation.path || [];
      const currentIdx = room.simulation.currentStepIndex || 0;
      setActiveStepIdx(currentIdx);

      // Only host coordinates advancing the step forward to prevent race conditions
      if (isHost && path.length > 1 && currentIdx < path.length - 1) {
        if (autoStepTimerRef.current) clearTimeout(autoStepTimerRef.current);

        autoStepTimerRef.current = setTimeout(async () => {
          try {
            await fetch(getApiUrl(`/api/topology-rooms/${room.code}/step`), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ stepIndex: currentIdx + 1 })
            });
          } catch (err) {
            console.error('[Step Advance Error]', err);
          }
        }, 1600); // 1.6s per hop gives devices time to visualize the transfer
      }
    } else {
      if (room?.simulation?.status === 'completed') {
        const path = room.simulation.path || [];
        setActiveStepIdx(path.length - 1);
      }
      if (autoStepTimerRef.current) clearTimeout(autoStepTimerRef.current);
    }

    return () => {
      if (autoStepTimerRef.current) clearTimeout(autoStepTimerRef.current);
    };
  }, [room?.simulation?.status, room?.simulation?.currentStepIndex, isHost, room?.code]);

  // ========================================================
  // ROOM ACTIONS (Create, Join, Transmit, Save)
  // ========================================================

  const handleCreateRoom = async (e) => {
    e?.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { message: 'Please sign in to create a multiplayer simulation room.' } });
      return;
    }

    setIsSubmitting(true);
    setLobbyError('');

    try {
      const res = await fetch(getApiUrl('/api/topology-rooms/create'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topologyType,
          maxParticipants: reqNodes,
          hostEmail: myEmail,
          hostName: user?.name || 'Lab Host'
        })
      });

      const data = await safeJsonParse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to create room.');
      }

      setRoom(data.room);
      setRoomCode(data.room.code);
      setIsHost(true);
    } catch (err) {
      setLobbyError(err.message || 'Unable to create room. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e?.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { message: 'Please sign in to join a multiplayer simulation room.' } });
      return;
    }

    const cleanCode = joinCodeInput.trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 4) {
      setLobbyError('Please enter a valid 4-digit room code.');
      return;
    }

    setIsSubmitting(true);
    setLobbyError('');

    try {
      const res = await fetch(getApiUrl('/api/topology-rooms/join'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: cleanCode,
          email: myEmail,
          name: user?.name || 'Participant'
        })
      });

      const data = await safeJsonParse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to join room.');
      }

      setRoom(data.room);
      setRoomCode(data.room.code);
      setIsHost((data.room.hostEmail || '').toLowerCase().trim() === myEmail);
    } catch (err) {
      setLobbyError(err.message || 'Room not found or limit reached.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (!room?.code) return;
    navigator.clipboard.writeText(room.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSaveAssignments = async () => {
    if (!isHost || !room) return;
    try {
      const assignments = Object.entries(assignmentDraft).map(([email, nodeId]) => ({
        email,
        nodeId
      }));

      const res = await fetch(getApiUrl(`/api/topology-rooms/${room.code}/assign`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostEmail: myEmail,
          assignments,
          sourceNodeId: selectedSource,
          targetNodeId: selectedTarget,
          payloadText: payloadInput
        })
      });

      const data = await safeJsonParse(res);
      if (data.success && data.room) {
        setRoom(data.room);
      }
    } catch (err) {
      console.error('[Save Assignments Error]', err);
    }
  };

  const handleToggleNodeHealth = async (nodeId) => {
    if (!isHost || !room) return;
    try {
      const res = await fetch(getApiUrl(`/api/topology-rooms/${room.code}/toggle-node`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostEmail: myEmail,
          nodeId
        })
      });
      const data = await safeJsonParse(res);
      if (data.success && data.room) {
        setRoom(data.room);
      }
    } catch (err) {
      console.error('[Toggle Node Error]', err);
    }
  };

  const handleRunSimulation = async () => {
    if (!room) return;
    setIsTransmitting(true);
    setSaveSuccessMsg('');
    setSaveErrorMsg('');

    try {
      const res = await fetch(getApiUrl(`/api/topology-rooms/${room.code}/transmit`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: myEmail,
          payloadText: payloadInput.trim() || 'Hello Netrium',
          sourceNodeId: selectedSource,
          targetNodeId: selectedTarget
        })
      });

      const data = await safeJsonParse(res);
      if (data.success && data.room) {
        setRoom(data.room);
      } else {
        alert(data.message || 'Cannot run simulation with current node state.');
      }
    } catch (err) {
      console.error('[Run Simulation Error]', err);
      alert('Simulation error: ' + err.message);
    } finally {
      setIsTransmitting(false);
    }
  };

  const handleSaveLabSession = async () => {
    if (!room || !myEmail) return;
    setIsSaving(true);
    setSaveSuccessMsg('');
    setSaveErrorMsg('');

    try {
      const res = await fetch(getApiUrl(`/api/topology-rooms/${room.code}/save`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: myEmail,
          userName: user?.name || 'Researcher',
          title: `${room.topologyType.toUpperCase()} Multi-Device Collaborative Simulation (${room.code})`,
          notes: `Simulated with ${room.participants.length} connected stations. Traversal: ${(room.simulation?.path || []).join(' -> ')}`
        })
      });

      const data = await safeJsonParse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save lab session.');
      }

      setSaveSuccessMsg('Lab session successfully saved to your My Labs portfolio!');
      setTimeout(() => setSaveSuccessMsg(''), 6000);
    } catch (err) {
      setSaveErrorMsg(err.message || 'Could not save lab.');
      setTimeout(() => setSaveErrorMsg(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLeaveRoom = () => {
    if (window.confirm('Are you sure you want to exit this collaborative room?')) {
      setRoom(null);
      setRoomCode('');
      setIsHost(false);
    }
  };

  // Node helper lookup
  const nodeMap = useMemo(() => {
    const map = new Map();
    if (room?.nodes) {
      room.nodes.forEach(n => map.set(n.id, n));
    }
    return map;
  }, [room?.nodes]);

  // Derive current device's local action text
  const myLocalPerspective = useMemo(() => {
    if (!room) return null;
    const path = room.simulation?.path || [];
    const stepMessages = room.simulation?.stepMessages || [];
    const isSimActive = room.simulation?.status === 'running' || room.simulation?.status === 'completed';

    if (!myNode) {
      return {
        title: 'Observer Mode',
        actionText: 'You are connected as an unassigned observer. The room owner can assign you to a station node.',
        status: 'observer',
        accentColor: '#94a3b8'
      };
    }

    if (myNode.status === 'offline') {
      return {
        title: `Station ${myNode.label} (Hardware Offline)`,
        actionText: `Station ${myNode.label} is marked OFFLINE. Packet traffic will bypass this node or drop if single point of failure.`,
        status: 'offline',
        accentColor: '#ef4444'
      };
    }

    if (!isSimActive) {
      const isSrc = myNode.id === room.sourceNodeId;
      const isTgt = myNode.id === room.targetNodeId;
      return {
        title: `Station ${myNode.label} ${isSrc ? '(Source / Sender)' : isTgt ? '(Destination / Receiver)' : '(Relay Node)'}`,
        actionText: isSrc 
          ? `Ready to transmit: "${room.payloadText || payloadInput}" to next node in ${room.topologyType} topology.`
          : isTgt 
          ? `Ready to receive data payload once simulation is executed.`
          : `Station online and listening for packet transmission.`,
        status: 'ready',
        accentColor: NODE_COLORS[myNode.label] || '#3b82f6'
      };
    }

    // Match exact step message for this node
    const nodeMsg = stepMessages.find(sm => sm.nodeId === myNode.id);
    if (nodeMsg) {
      return {
        title: `Station ${myNode.label} (${nodeMsg.role.toUpperCase()})`,
        actionText: nodeMsg.displayText,
        status: nodeMsg.role,
        accentColor: NODE_COLORS[myNode.label] || '#10b981'
      };
    }

    return {
      title: `Station ${myNode.label}`,
      actionText: `Monitoring data traversal across ${room.topologyType} network.`,
      status: 'idle',
      accentColor: '#10b981'
    };
  }, [room, myNode, payloadInput]);

  // ========================================================
  // RENDER: LOBBY / ROOM JOIN & CREATE VIEW
  // ========================================================
  if (!room) {
    return (
      <div className="net-multiplayer-lobby">
        <div className="lobby-hero-card">
          <div className="lobby-pill-row">
            <span className="lobby-mode-pill">
              <Radio size={13} className="live-spin" />
              <span>Multiplayer Game Simulation</span>
            </span>
            <span className="lobby-topo-badge">{currentTopoName}</span>
          </div>

          <h2 className="lobby-title">Multi-Device Collaborative Laboratory</h2>
          <p className="lobby-subtitle">
            Experience real-world network routing across multiple physical devices simultaneously. Create a shared room, invite peers with a 4-digit code, assign station nodes, and watch data packets hop from screen to screen with zero time lag.
          </p>

          {!isAuthenticated && (
            <div className="lobby-auth-notice">
              <Shield size={16} />
              <span>Sign in required to participate in multi-device network sessions.</span>
              <button
                type="button"
                className="lobby-signin-btn"
                onClick={() => navigate('/login', { state: { message: 'Sign in to access multi-device labs.' } })}
              >
                <LogIn size={14} />
                <span>Sign In / Create Account</span>
              </button>
            </div>
          )}

          {/* Tab Switcher: Create vs Join */}
          <div className="lobby-tabs-nav">
            <button
              type="button"
              className={`lobby-tab-btn ${lobbyTab === 'create' ? 'active' : ''}`}
              onClick={() => { setLobbyTab('create'); setLobbyError(''); }}
            >
              <Zap size={15} />
              <span>Create New Room</span>
            </button>
            <button
              type="button"
              className={`lobby-tab-btn ${lobbyTab === 'join' ? 'active' : ''}`}
              onClick={() => { setLobbyTab('join'); setLobbyError(''); }}
            >
              <Users size={15} />
              <span>Join with 4-Digit Code</span>
            </button>
          </div>

          {lobbyError && (
            <div className="lobby-alert-error">
              <AlertTriangle size={15} />
              <span>{lobbyError}</span>
            </div>
          )}

          {/* TAB 1: CREATE ROOM */}
          {lobbyTab === 'create' && (
            <form onSubmit={handleCreateRoom} className="lobby-form-pane">
              <div className="lobby-field-group">
                <label className="lobby-label">
                  <Sliders size={14} />
                  <span>How many nodes / devices are required for this lab?</span>
                </label>
                <div className="node-count-selector">
                  {[2, 3, 4, 5, 6].map(num => (
                    <button
                      key={num}
                      type="button"
                      className={`node-count-btn ${reqNodes === num ? 'active' : ''}`}
                      onClick={() => setReqNodes(num)}
                    >
                      <span className="count-num">{num}</span>
                      <span className="count-label">Stations</span>
                    </button>
                  ))}
                </div>
                <p className="field-hint">
                  Exactly {reqNodes} participants will be permitted to join this room. Once all {reqNodes} devices connect, station roles and routing will be configured.
                </p>
              </div>

              <div className="lobby-summary-box">
                <div className="summary-row">
                  <span>Selected Topology:</span>
                  <strong>{currentTopoName}</strong>
                </div>
                <div className="summary-row">
                  <span>Capacity Limit:</span>
                  <strong>{reqNodes} Connected Devices</strong>
                </div>
                <div className="summary-row">
                  <span>Room Creator (Host):</span>
                  <strong>{myEmail || 'Signed-In Account'}</strong>
                </div>
              </div>

              <button
                type="submit"
                className="lobby-action-submit-btn"
                disabled={isSubmitting || !isAuthenticated}
              >
                <Sparkles size={16} />
                <span>{isSubmitting ? 'Generating 4-Digit Room...' : 'Create Simulation Room'}</span>
              </button>
            </form>
          )}

          {/* TAB 2: JOIN ROOM */}
          {lobbyTab === 'join' && (
            <form onSubmit={handleJoinRoom} className="lobby-form-pane">
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
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.replace(/[^0-9]/g, ''))}
                    className="room-code-large-input"
                    autoFocus
                  />
                </div>
                <p className="field-hint">
                  Ask the lab owner for their 4-digit code. You will automatically receive a station role upon joining.
                </p>
              </div>

              <button
                type="submit"
                className="lobby-action-submit-btn"
                disabled={isSubmitting || joinCodeInput.trim().length !== 4 || !isAuthenticated}
              >
                <Users size={16} />
                <span>{isSubmitting ? 'Verifying Code & Connecting...' : 'Join Lab Room'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ========================================================
  // RENDER: ACTIVE SIMULATION ROOM ARENA ("GAME ENVIRONMENT")
  // ========================================================
  const currentStep = room.simulation?.currentStepIndex || 0;
  const isSimRunning = room.simulation?.status === 'running';
  const isSimCompleted = room.simulation?.status === 'completed';
  const simPath = room.simulation?.path || [];

  return (
    <div className="net-multiplayer-arena">
      
      {/* ARENA HEADER BAR */}
      <header className="arena-header-bar">
        <div className="arena-header-left">
          <div className="arena-code-card">
            <span className="code-label">4-DIGIT ROOM CODE</span>
            <div className="code-display-row">
              <span className="code-digits">{room.code}</span>
              <button
                type="button"
                className="code-copy-btn"
                onClick={handleCopyCode}
                title="Copy 4-digit code to invite other devices"
              >
                {copiedCode ? <Check size={14} className="copied-icon" /> : <Copy size={14} />}
                <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
          </div>

          <div className="arena-topo-meta">
            <span className="topo-tag">{currentTopoName}</span>
            <div className="capacity-pill">
              <Users size={13} />
              <span>
                {room.participants.length} / {room.maxParticipants} Devices Connected
              </span>
            </div>
          </div>
        </div>

        <div className="arena-header-actions">
          {/* Save Lab Option */}
          <button
            type="button"
            className="arena-save-btn"
            onClick={handleSaveLabSession}
            disabled={isSaving}
          >
            <Save size={15} />
            <span>{isSaving ? 'Saving Lab...' : 'Save Lab to My Labs'}</span>
          </button>

          <button
            type="button"
            className="arena-leave-btn"
            onClick={handleLeaveRoom}
          >
            <span>Exit Room</span>
          </button>
        </div>
      </header>

      {/* Save Success Banner */}
      {saveSuccessMsg && (
        <div className="arena-success-toast">
          <CheckCircle2 size={16} />
          <span>{saveSuccessMsg}</span>
          <button
            type="button"
            className="toast-link-btn"
            onClick={() => navigate('/my-labs')}
          >
            <span>View in My Labs</span>
            <ExternalLink size={12} />
          </button>
        </div>
      )}

      {saveErrorMsg && (
        <div className="arena-error-toast">
          <AlertTriangle size={16} />
          <span>{saveErrorMsg}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. PARTICIPANTS ROSTER (LIVE GREEN / RED STATUS DOTS)    */}
      {/* ======================================================== */}
      <section className="arena-roster-section">
        <div className="roster-header">
          <div className="roster-title-wrap">
            <Radio size={14} className="live-spin" />
            <h3 className="roster-title">Connected Devices & Assigned Stations</h3>
          </div>
          <span className="roster-sub">
            Live heartbeat synchronized &bull; Green = Online, Red = Disconnected
          </span>
        </div>

        <div className="roster-cards-grid">
          {room.participants.map((p, idx) => {
            const isMe = (p.email || '').toLowerCase().trim() === myEmail;
            const assignedNode = room.nodes.find(n => n.id === p.nodeId);
            const isHostUser = (p.email || '').toLowerCase().trim() === (room.hostEmail || '').toLowerCase().trim();

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
                  {isHostUser && <span className="host-badge">HOST / OWNER</span>}
                  {isMe && <span className="me-badge">THIS DEVICE</span>}
                </div>

                <div className="roster-user-info">
                  <span className="roster-email" title={p.email}>{p.email}</span>
                  <span className="roster-name">{p.name || 'Station Operator'}</span>
                </div>

                <div className="roster-station-role">
                  {assignedNode ? (
                    <div
                      className="assigned-node-pill"
                      style={{ borderColor: NODE_COLORS[assignedNode.label] || '#3b82f6' }}
                    >
                      <span
                        className="node-letter-badge"
                        style={{ background: NODE_COLORS[assignedNode.label] || '#3b82f6' }}
                      >
                        {assignedNode.label}
                      </span>
                      <span className="node-role-name">
                        {assignedNode.id === room.sourceNodeId
                          ? `Station ${assignedNode.label} (Source)`
                          : assignedNode.id === room.targetNodeId
                          ? `Station ${assignedNode.label} (Destination)`
                          : `Station ${assignedNode.label} (Relay)`}
                      </span>
                    </div>
                  ) : (
                    <span className="unassigned-pill">Unassigned Station</span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Missing participant slots placeholder */}
          {Array.from({ length: Math.max(0, room.maxParticipants - room.participants.length) }).map((_, slotIdx) => (
            <div key={`empty-${slotIdx}`} className="roster-empty-slot">
              <span className="empty-slot-plus">+</span>
              <span className="empty-slot-text">Waiting for device to join...</span>
              <span className="empty-slot-hint">Code: {room.code}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. THE 3 SYNCHRONIZED VISUAL DISPLAYS (USER SPECIFICATION) */}
      {/* ======================================================== */}
      <div className="arena-displays-layout">
        
        {/* LEFT COLUMN: LARGE MAIN OUTPUT DATA & SVG ARENA */}
        <div className="arena-main-visualizer-col">
          
          {/* DISPLAY 1: LARGE FORM — MAIN OUTPUT DATA */}
          <div className="large-output-hud-card">
            <div className="hud-card-top">
              <div className="hud-badge">
                <Activity size={14} />
                <span>MAIN OUTPUT DATA STREAM &bull; SYNCHRONIZED</span>
              </div>
              <span className="hud-topology-name">{room.topologyType.toUpperCase()} TOPOLOGY</span>
            </div>

            {/* Huge Prominent Payload Display */}
            <div className="hud-payload-banner">
              <span className="payload-tag">TRANSMITTED PAYLOAD TEXT</span>
              <h1 className="hud-payload-huge">"{room.payloadText || payloadInput}"</h1>
            </div>

            {/* Active Path & Hop Tracker */}
            <div className="hud-traversal-bar">
              <span className="traversal-bar-label">PATH TRAVERSAL:</span>
              <div className="traversal-nodes-flow">
                {(simPath.length > 0 ? simPath : [room.sourceNodeId, room.targetNodeId]).map((nId, idx) => {
                  const nObj = nodeMap.get(nId);
                  const isCurrentHop = isSimRunning && currentStep === idx;
                  const isDelivered = (isSimRunning && currentStep >= idx) || isSimCompleted;
                  const isTarget = idx === simPath.length - 1;

                  return (
                    <div key={nId} className="hop-step-item">
                      <div
                        className={`hop-node-bubble ${isCurrentHop ? 'active-hop' : ''} ${isDelivered ? 'delivered' : ''}`}
                        style={{
                          borderColor: NODE_COLORS[nObj?.label] || '#3b82f6',
                          boxShadow: isCurrentHop ? `0 0 16px ${NODE_COLORS[nObj?.label] || '#3b82f6'}` : 'none'
                        }}
                      >
                        <span className="hop-letter">{nObj?.label || nId}</span>
                        {isCurrentHop && <span className="hop-pulse-ring" />}
                      </div>
                      <span className="hop-station-tag">Station {nObj?.label}</span>

                      {idx < (simPath.length || 2) - 1 && (
                        <ArrowRight size={16} className={`hop-arrow ${isDelivered ? 'active' : ''}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Status Notification */}
            <div className={`hud-status-marquee ${isSimRunning ? 'running' : isSimCompleted ? 'completed' : 'idle'}`}>
              <div className="marquee-dot" />
              <span>
                {isSimRunning
                  ? `[HOP #${currentStep + 1} OF ${Math.max(1, simPath.length - 1)}] ${room.simulation?.lastAction || 'Transmitting payload packet...'}`
                  : isSimCompleted
                  ? `[TRANSMISSION COMPLETE] Payload "${room.payloadText || payloadInput}" successfully acknowledged at Station ${nodeMap.get(room.targetNodeId)?.label}. (0% Packet Loss)`
                  : `[READY] Click "Run Simulation" on Host Device to initiate multi-device packet traversal.`}
              </span>
            </div>
          </div>

          {/* INTERACTIVE TOPOLOGY GRAPH CANVAS (SVG) */}
          <div className="arena-schematic-canvas-card">
            <div className="canvas-header">
              <Layers size={15} />
              <h4>Live Topology Network Matrix</h4>
              <span className="canvas-hint">Active nodes glow with hardware status</span>
            </div>

            <div className="schematic-svg-wrapper">
              <svg viewBox="0 0 600 320" className="topology-schematic-svg">
                <defs>
                  <filter id="glow-filter" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <linearGradient id="link-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                  </linearGradient>
                </defs>

                {/* Render Topology Links & Active Transmission Pulses */}
                {renderTopologySvgLinks(room, nodeMap, currentStep, isSimRunning)}

                {/* Render Nodes */}
                {renderTopologySvgNodes(room, nodeMap, currentStep, isSimRunning, isHost, handleToggleNodeHealth)}
              </svg>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SMALLER FORM (LOCAL PERSPECTIVE) & LOGBOOK & HOST CONTROLS */}
        <div className="arena-side-col">
          
          {/* DISPLAY 2: SMALLER FORM — THIS DEVICE'S LOCAL VIEW (USER SPECIFICATION) */}
          <div className="local-device-perspective-card">
            <div className="local-card-top">
              <div className="local-title-row">
                <Laptop size={16} className="device-icon" />
                <h3>Your Device Local Perspective</h3>
              </div>
              <span
                className="local-status-pill"
                style={{ borderColor: myLocalPerspective.accentColor, color: myLocalPerspective.accentColor }}
              >
                {myLocalPerspective.title}
              </span>
            </div>

            <p className="local-device-desc">
              This card reflects your physical device's exact role in the network topology right now:
            </p>

            {/* Dynamic Local Transmission Message */}
            <div
              className="local-action-banner"
              style={{ borderLeftColor: myLocalPerspective.accentColor }}
            >
              <span className="local-msg-highlight">{myLocalPerspective.actionText}</span>
            </div>

            {myNode && (
              <div className="local-node-specs-grid">
                <div className="spec-pill">
                  <span className="sp-title">Assigned Node</span>
                  <span className="sp-val">Station {myNode.label}</span>
                </div>
                <div className="spec-pill">
                  <span className="sp-title">Hardware Status</span>
                  <span className={`sp-val ${myNode.status}`}>{myNode.status.toUpperCase()}</span>
                </div>
                <div className="spec-pill">
                  <span className="sp-title">Logged Account</span>
                  <span className="sp-val user-email-val">{myEmail}</span>
                </div>
              </div>
            )}
          </div>

          {/* DISPLAY 3: VIRTUAL SCREEN / LOGBOOK TERMINAL */}
          <div className="arena-logbook-card">
            <div className="logbook-header">
              <div className="logbook-title-wrap">
                <Terminal size={15} />
                <h4>Virtual Screen & Procedural Logbook</h4>
              </div>
              <span className="logbook-count">{(room.logs || []).length} Events</span>
            </div>

            <div className="logbook-terminal-screen">
              {(room.logs || []).slice().reverse().map((entry, idx) => (
                <div key={entry.id || idx} className={`log-entry-row ${entry.type || 'info'}`}>
                  <span className="log-time">[{entry.time}]</span>
                  <span className="log-content">{entry.message}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ======================================================== */}
          {/* HOST / OWNER CONFIGURATION DECK                         */}
          {/* ======================================================== */}
          {isHost ? (
            <div className="arena-host-controls-card">
              <div className="host-card-top">
                <Sliders size={16} />
                <h3>Room Owner Control Deck</h3>
              </div>
              <p className="host-desc">
                As the room owner, configure device assignments, source and destination nodes, and hardware health.
              </p>

              {/* Data Payload Input */}
              <div className="host-control-group">
                <label className="host-label">Message / Data Payload to Transmit</label>
                <div className="payload-input-wrap">
                  <input
                    type="text"
                    value={payloadInput}
                    onChange={(e) => setPayloadInput(e.target.value)}
                    placeholder="Enter message (e.g. Hello)"
                    className="host-text-input"
                  />
                </div>
              </div>

              {/* Source & Destination Selectors */}
              <div className="host-selectors-row">
                <div className="selector-col">
                  <label className="host-label">Source Node (Sender)</label>
                  <select
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                    className="host-select"
                  >
                    {room.nodes.map(n => (
                      <option key={n.id} value={n.id}>
                        Station {n.label} {n.status === 'offline' ? '(OFFLINE)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="selector-col">
                  <label className="host-label">Target Node (Destination)</label>
                  <select
                    value={selectedTarget}
                    onChange={(e) => setSelectedTarget(e.target.value)}
                    className="host-select"
                  >
                    {room.nodes.map(n => (
                      <option key={n.id} value={n.id}>
                        Station {n.label} {n.status === 'offline' ? '(OFFLINE)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Hardware Health Toggles (Single Point of Failure / Ring Bypass) */}
              <div className="host-control-group">
                <label className="host-label">
                  Station Hardware Health (Click to Toggle Online/Offline)
                </label>
                <div className="node-health-toggles-row">
                  {room.nodes.map(n => (
                    <button
                      key={n.id}
                      type="button"
                      className={`health-pill-btn ${n.status}`}
                      onClick={() => handleToggleNodeHealth(n.id)}
                      title={`Toggle Station ${n.label} between online and offline`}
                    >
                      <span className="dot-mini" />
                      <span>Station {n.label}: {n.status.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Role Assignment Dropdowns for Connected Devices */}
              <div className="host-control-group">
                <label className="host-label">Assign Devices to Station Roles</label>
                <div className="device-assignment-list">
                  {room.participants.map(p => (
                    <div key={p.email} className="assignment-row">
                      <span className="asgn-email" title={p.email}>
                        {p.email} {p.email === myEmail ? '(You)' : ''}
                      </span>
                      <select
                        value={assignmentDraft[p.email] || ''}
                        onChange={(e) => {
                          const updated = { ...assignmentDraft, [p.email]: e.target.value };
                          setAssignmentDraft(updated);
                        }}
                        className="asgn-select"
                      >
                        <option value="">Unassigned</option>
                        {room.nodes.map(n => (
                          <option key={n.id} value={n.id}>
                            Assign to Station {n.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="apply-assignments-btn"
                  onClick={handleSaveAssignments}
                >
                  <Check size={13} />
                  <span>Update Role Assignments</span>
                </button>
              </div>

              {/* Main Action Button */}
              <button
                type="button"
                className="run-simulation-master-btn"
                onClick={handleRunSimulation}
                disabled={isTransmitting || isSimRunning}
              >
                <Play size={16} fill="currentColor" />
                <span>
                  {isTransmitting
                    ? 'Computing Route...'
                    : isSimRunning
                    ? 'Simulation In Progress Across Devices...'
                    : 'Run Multi-Device Simulation'}
                </span>
              </button>
            </div>
          ) : (
            <div className="arena-participant-wait-card">
              <Radio size={16} className="live-spin" />
              <h4>Participant Mode Active</h4>
              <p>
                Connected to Room <strong>{room.code}</strong> as Station <strong>{myNode?.label || 'Observer'}</strong>. The host controls route execution; your screen will update in real time as packets transmit.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ========================================================
// SVG SCHEMATIC RENDER HELPERS
// ========================================================

function getNodePositions(nodes, topologyType) {
  const positions = {};
  const N = nodes.length || 4;
  const cx = 300;
  const cy = 160;

  if (topologyType === 'star') {
    // Hub in center
    positions[nodes[0]?.id] = { x: cx, y: cy };
    const radius = 100;
    for (let i = 1; i < N; i++) {
      const angle = (2 * Math.PI * (i - 1)) / (N - 1) - Math.PI / 2;
      positions[nodes[i]?.id] = {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle)
      };
    }
  } else if (topologyType === 'bus') {
    // Linear bus
    const spacing = 500 / Math.max(1, N - 1);
    const startX = 50;
    nodes.forEach((n, idx) => {
      positions[n.id] = { x: startX + idx * spacing, y: 160 };
    });
  } else {
    // Ring, Mesh, Tree, Hybrid default circular layout
    const radius = 105;
    nodes.forEach((n, idx) => {
      const angle = (2 * Math.PI * idx) / N - Math.PI / 2;
      positions[n.id] = {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle)
      };
    });
  }

  return positions;
}

function renderTopologySvgLinks(room, nodeMap, currentStep, isSimRunning) {
  const nodes = room.nodes || [];
  const positions = getNodePositions(nodes, room.topologyType);
  const path = room.simulation?.path || [];
  const links = [];

  const addLink = (idA, idB, key) => {
    const pA = positions[idA];
    const pB = positions[idB];
    if (!pA || !pB) return;

    // Check if link is active in current hop
    let isCurrentHop = false;
    let isTraversed = false;

    if (isSimRunning && path.length > 1) {
      const fromId = path[currentStep];
      const toId = path[currentStep + 1];
      if ((fromId === idA && toId === idB) || (fromId === idB && toId === idA)) {
        isCurrentHop = true;
      }
    }

    links.push(
      <g key={key}>
        <line
          x1={pA.x}
          y1={pA.y}
          x2={pB.x}
          y2={pB.y}
          stroke={isCurrentHop ? '#10b981' : '#334155'}
          strokeWidth={isCurrentHop ? 4 : 2}
          strokeDasharray={isCurrentHop ? '6 4' : 'none'}
          className={isCurrentHop ? 'svg-active-link-anim' : ''}
        />
        {isCurrentHop && (
          <circle
            cx={(pA.x + pB.x) / 2}
            cy={(pA.y + pB.y) / 2}
            r={5}
            fill="#10b981"
            filter="url(#glow-filter)"
          />
        )}
      </g>
    );
  };

  if (room.topologyType === 'star') {
    const hubId = nodes[0]?.id;
    for (let i = 1; i < nodes.length; i++) {
      addLink(hubId, nodes[i]?.id, `star-${i}`);
    }
  } else if (room.topologyType === 'bus') {
    for (let i = 0; i < nodes.length - 1; i++) {
      addLink(nodes[i]?.id, nodes[i + 1]?.id, `bus-${i}`);
    }
  } else if (room.topologyType === 'ring') {
    for (let i = 0; i < nodes.length; i++) {
      const nextIdx = (i + 1) % nodes.length;
      addLink(nodes[i]?.id, nodes[nextIdx]?.id, `ring-${i}`);
    }
  } else {
    // Mesh: connect all pairs
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        addLink(nodes[i]?.id, nodes[j]?.id, `mesh-${i}-${j}`);
      }
    }
  }

  return links;
}

function renderTopologySvgNodes(room, nodeMap, currentStep, isSimRunning, isHost, onToggleHealth) {
  const nodes = room.nodes || [];
  const positions = getNodePositions(nodes, room.topologyType);
  const path = room.simulation?.path || [];

  return nodes.map(n => {
    const pos = positions[n.id];
    if (!pos) return null;

    const isOffline = n.status === 'offline';
    const isSource = n.id === room.sourceNodeId;
    const isTarget = n.id === room.targetNodeId;

    const isCurrentActive = isSimRunning && path[currentStep] === n.id;
    const baseColor = NODE_COLORS[n.label] || '#3b82f6';
    const fillCol = isOffline ? '#ef4444' : isCurrentActive ? '#10b981' : baseColor;

    return (
      <g
        key={n.id}
        transform={`translate(${pos.x}, ${pos.y})`}
        style={{ cursor: isHost ? 'pointer' : 'default' }}
        onClick={() => isHost && onToggleHealth(n.id)}
      >
        {/* Glow halo */}
        {isCurrentActive && (
          <circle r={28} fill="#10b981" opacity={0.3} className="svg-pulse-anim" />
        )}

        {/* Node Circle */}
        <circle
          r={18}
          fill="#0f172a"
          stroke={fillCol}
          strokeWidth={isCurrentActive ? 3.5 : 2}
          filter={isCurrentActive ? 'url(#glow-filter)' : 'none'}
        />

        {/* Node Label Text */}
        <text
          y={5}
          textAnchor="middle"
          fill="#ffffff"
          fontSize={13}
          fontWeight="700"
          fontFamily="system-ui"
        >
          {n.label}
        </text>

        {/* Role or Health Tag */}
        <text
          y={28}
          textAnchor="middle"
          fill={isOffline ? '#ef4444' : '#94a3b8'}
          fontSize={9}
          fontWeight="600"
          fontFamily="system-ui"
        >
          {isOffline ? 'OFFLINE' : isSource ? 'SRC' : isTarget ? 'DEST' : `STATION ${n.label}`}
        </text>
      </g>
    );
  });
}
