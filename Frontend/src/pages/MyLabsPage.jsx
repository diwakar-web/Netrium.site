import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Binary,
  Server,
  Network,
  Layers,
  GitFork,
  ArrowLeft,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  Activity,
  Calendar,
  Users,
  Trash2,
  ExternalLink,
  Terminal,
  Radio,
  Clock,
  ArrowRight,
  X,
  PlusCircle,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import GradientWaves from '../components/GradientWaves';
import FacilityModal from '../components/FacilityModal';
import darkLogo from '../assets/DarkLogo.png';
import { useAuth } from '../context/AuthContext';
import { getApiUrl, safeJsonParse } from '../utils/api';
import './MyLabsPage.css';

const LAB_FACILITIES = [
  {
    id: 'multi-mesh',
    title: 'Network Topologies & Multi-Device Rooms',
    category: 'Network Engineering',
    icon: Network,
    tag: 'Multiplayer Engine',
    description: 'Star, Mesh, Ring, and Bus structural architectures with 4-digit multi-device rooms, role assignment, and live packet hop tracing.',
    stats: 'Multi-Device Collaborative &bull; Real-time Playback'
  },
  {
    id: 'packet-trace',
    title: 'Content Delivery Network (CDN)',
    category: 'Distributed Systems',
    icon: Server,
    tag: 'Network Simulation',
    description: 'Edge caching, Point of Presence (POP) global node replication, cache miss mitigation, and live packet hop latency tracing.',
    stats: '5 Global Edge Nodes &bull; Live Packet Flow'
  },
  {
    id: 'dsa-algo',
    title: 'Data Structures & Algorithms',
    category: 'Computer Science Core',
    icon: Binary,
    tag: 'Interactive Matrix',
    description: 'Binary Search Trees, Graph Traversals, Breadth-First Search, and Dynamic Programming state transitions visualizer.',
    stats: '12 Algorithm Modules &bull; Real-time Playback'
  },
  {
    id: 'virt-memory',
    title: 'Page Replacement Algorithms',
    category: 'Operating Systems',
    icon: Layers,
    tag: 'Kernel Memory',
    description: 'FIFO, LRU, LFU, and Clock page replacement algorithms with live cache hits, misses, and virtual-to-physical address translation.',
    stats: '4 Kernel Strategies &bull; Frame Allocator'
  },
  {
    id: 'os-kernel',
    title: 'Routing Algorithms',
    category: 'Internet Architecture',
    icon: GitFork,
    tag: 'Routing Core',
    description: 'Dijkstra shortest path, Bellman-Ford negative cycle resolution, OSPF link-state updates, and BGP inter-autonomous routing.',
    stats: 'Shortest Path Matrix &bull; Real-time Convergence'
  }
];

export default function MyLabsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeFacility, setActiveFacility] = useState(null);

  // Tabs: 'saved-labs' | 'facilities'
  const [viewTab, setViewTab] = useState('saved-labs');

  // Saved Collaborative Labs
  const [savedLabs, setSavedLabs] = useState([]);
  const [isLoadingLabs, setIsLoadingLabs] = useState(false);
  const [selectedSavedLab, setSelectedSavedLab] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Fetch saved labs for logged-in user
  const fetchSavedLabs = async () => {
    if (!user?.email) return;
    setIsLoadingLabs(true);
    try {
      const res = await fetch(getApiUrl(`/api/topology-rooms/user/labs?email=${encodeURIComponent(user.email)}`));
      if (res.ok) {
        const data = await safeJsonParse(res);
        if (data.success && Array.isArray(data.labs)) {
          setSavedLabs(data.labs);
          // If no saved labs, default to facilities tab
          if (data.labs.length === 0) {
            setViewTab('saved-labs'); // Keep user on saved labs to see empty state with easy launch
          }
        }
      }
    } catch (err) {
      console.warn('[Fetch Saved Labs Notice]', err.message);
    } finally {
      setIsLoadingLabs(false);
    }
  };

  useEffect(() => {
    fetchSavedLabs();
  }, [user?.email]);

  const handleDeleteLab = async (labId, e) => {
    e?.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this saved lab session from your portfolio?')) {
      return;
    }

    try {
      const res = await fetch(getApiUrl(`/api/topology-rooms/user/labs/${labId}?email=${encodeURIComponent(user.email)}`), {
        method: 'DELETE'
      });
      const data = await safeJsonParse(res);
      if (data.success) {
        setSavedLabs(prev => prev.filter(l => l._id !== labId));
        if (selectedSavedLab?._id === labId) setSelectedSavedLab(null);
        setToastMsg('Lab record removed.');
        setTimeout(() => setToastMsg(''), 4000);
      }
    } catch (err) {
      alert('Failed to delete lab: ' + err.message);
    }
  };

  return (
    <div className="netrium-labs-viewport">
      {/* Raymarched GradientWaves Background */}
      <GradientWaves
        horizonColor="#000000ff"
        waveColor="#c6c6c6ff"
        crestColor="#ffffff"
        speed={0.4}
        amplitude={2.8}
        waveScale={0.6}
        waveRatio={0.9}
        swell={30}
        turbulence={18}
        tilt={1.11}
        zoom={1.0}
        height={5.0}
        fogDepth={22}
        detail="medium"
        brightness={1.2}
        opacity={0.95}
        mouseInteraction={true}
        parallaxStrength={0.5}
        grain={true}
        grainIntensity={0.04}
      />

      {/* Ambient Radial Lighting */}
      <div className="labs-ambient-glow glow-left" />
      <div className="labs-ambient-glow glow-right" />

      {/* Header Bar */}
      <header className="labs-header-bar">
        <button
          type="button"
          className="labs-back-btn"
          onClick={() => navigate('/')}
          aria-label="Back to website"
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>

        <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="labs-logo-link">
          <img src={darkLogo} alt="Netrium" className="labs-logo-img" />
        </a>
      </header>

      {/* Content Container */}
      <main className="labs-main-container">
        
        {/* Floating Notification Toast */}
        {toastMsg && (
          <div className="labs-toast-banner">
            <CheckCircle2 size={15} />
            <span>{toastMsg}</span>
          </div>
        )}

        <div className="labs-hero-badge-wrap">
          <span className="labs-hero-badge">
            <Activity size={13} />
            <span>Research Laboratories & Collaborative Sessions</span>
          </span>
          <h1 className="labs-hero-title">My Research Laboratories</h1>
          <p className="labs-hero-subtitle">
            Review your saved multi-device collaborative network topology sessions and launch dedicated systems visualizers.
          </p>

          {/* Section Switcher Tabs */}
          <div className="labs-view-switcher">
            <button
              type="button"
              className={`switcher-pill ${viewTab === 'saved-labs' ? 'active' : ''}`}
              onClick={() => setViewTab('saved-labs')}
            >
              <Bookmark size={15} />
              <span>Saved Multi-Device Labs ({savedLabs.length})</span>
            </button>
            <button
              type="button"
              className={`switcher-pill ${viewTab === 'facilities' ? 'active' : ''}`}
              onClick={() => setViewTab('facilities')}
            >
              <Layers size={15} />
              <span>Simulation Facilities (5)</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: SAVED COLLABORATIVE LABS (IN LIST FORM)           */}
        {/* ======================================================== */}
        {viewTab === 'saved-labs' && (
          <div className="saved-labs-list-container">
            <div className="list-section-header">
              <div className="list-header-left">
                <Radio size={16} className="live-spin" />
                <h2>Saved Multi-Device Topology Labs</h2>
              </div>
              <button
                type="button"
                className="create-new-lab-btn"
                onClick={() => navigate('/topologies')}
              >
                <PlusCircle size={15} />
                <span>Launch New Simulation Room</span>
              </button>
            </div>

            {isLoadingLabs ? (
              <div className="labs-loading-box">
                <Radio size={24} className="live-spin" />
                <span>Loading your saved lab sessions...</span>
              </div>
            ) : savedLabs.length === 0 ? (
              <div className="labs-empty-card">
                <Bookmark size={36} className="empty-icon" />
                <h3>No Saved Collaborative Labs Yet</h3>
                <p>
                  Create or join a multi-device room in the Network Topology section under <strong>Practical Oriented</strong>. During or after your simulation, click <strong>"Save Lab to My Labs"</strong> to persist the participants, payload, and hop logs here!
                </p>
                <button
                  type="button"
                  className="empty-cta-btn"
                  onClick={() => navigate('/topologies')}
                >
                  <Network size={16} />
                  <span>Explore Network Topologies</span>
                </button>
              </div>
            ) : (
              <div className="saved-labs-rows-list">
                {savedLabs.map((lab) => {
                  const createdDate = new Date(lab.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div
                      key={lab._id}
                      className="saved-lab-row-card"
                      onClick={() => setSelectedSavedLab(lab)}
                    >
                      <div className="row-left-cell">
                        <div className="row-top-meta">
                          <span className="row-topo-badge">{lab.topologyType?.toUpperCase()} TOPOLOGY</span>
                          {lab.roomCode && (
                            <span className="row-code-badge">ROOM #{lab.roomCode}</span>
                          )}
                          <span className="row-date-text">
                            <Clock size={12} />
                            <span>{createdDate}</span>
                          </span>
                        </div>
                        <h3 className="row-title">{lab.title}</h3>
                        
                        {/* Traversal Flow Summary */}
                        <div className="row-traversal-flow">
                          <span className="flow-label">Path:</span>
                          <span className="flow-path-text">
                            {(lab.pathLabels?.length > 0 ? lab.pathLabels : ['A', 'B', 'C']).join(' \u2192 ')}
                          </span>
                          <span className="flow-separator">&bull;</span>
                          <span className="flow-label">Payload:</span>
                          <span className="flow-payload-quote">"{lab.payloadText}"</span>
                        </div>
                      </div>

                      {/* Participants Preview */}
                      <div className="row-participants-cell">
                        <span className="participants-label">
                          <Users size={12} />
                          <span>{(lab.participants || []).length} Devices Connected:</span>
                        </span>
                        <div className="participant-chips-wrap">
                          {(lab.participants || []).slice(0, 3).map((p, pIdx) => (
                            <span key={pIdx} className="participant-email-chip" title={p.email}>
                              <span className="dot-green" />
                              <span>{p.email}</span>
                            </span>
                          ))}
                          {(lab.participants || []).length > 3 && (
                            <span className="more-chips-tag">
                              +{lab.participants.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="row-actions-cell" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="row-inspect-btn"
                          onClick={() => setSelectedSavedLab(lab)}
                          title="View procedural logs and node steps"
                        >
                          <Terminal size={14} />
                          <span>View Logs</span>
                        </button>

                        <button
                          type="button"
                          className="row-launch-btn"
                          onClick={() => navigate(`/topologies/${lab.topologyType}`)}
                          title="Open this topology simulator"
                        >
                          <ArrowUpRight size={14} />
                        </button>

                        <button
                          type="button"
                          className="row-delete-btn"
                          onClick={(e) => handleDeleteLab(lab._id, e)}
                          title="Delete saved lab"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: ACTIVE FACILITIES (CORE SIMULATORS)               */}
        {/* ======================================================== */}
        {viewTab === 'facilities' && (
          <div className="labs-cards-grid">
            {LAB_FACILITIES.map((facility) => {
              const Icon = facility.icon;
              return (
                <div key={facility.id} className="labs-card">
                  <div className="labs-card-top">
                    <div className="labs-icon-box">
                      <Icon size={24} />
                    </div>
                    <span className="labs-tag">{facility.tag}</span>
                  </div>

                  <div className="labs-card-body">
                    <span className="labs-category">{facility.category}</span>
                    <h2 className="labs-card-title">{facility.title}</h2>
                    <p className="labs-card-desc">{facility.description}</p>
                  </div>

                  <div className="labs-card-footer">
                    <span
                      className="labs-stats-text"
                      dangerouslySetInnerHTML={{ __html: facility.stats }}
                    />
                    <button
                      type="button"
                      className="labs-launch-btn"
                      onClick={() => {
                        if (facility.id === 'multi-mesh') {
                          navigate('/topologies');
                        } else if (facility.id === 'packet-trace' || facility.id === 'cdn') {
                          navigate('/cdn');
                        } else if (facility.id === 'dsa-algo' || facility.id === 'dsa') {
                          navigate('/dsa');
                        } else {
                          setActiveFacility(facility.id);
                        }
                      }}
                    >
                      <span>Launch Simulation</span>
                      <ArrowUpRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* ======================================================== */}
      {/* SAVED LAB DETAILS MODAL (STEP-BY-STEP LOGS & PERSPECTIVES) */}
      {/* ======================================================== */}
      {selectedSavedLab && (
        <div className="lab-modal-backdrop" onClick={() => setSelectedSavedLab(null)}>
          <div className="lab-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="lab-modal-header">
              <div className="modal-title-row">
                <Network size={20} className="modal-header-icon" />
                <div>
                  <h3 className="modal-lab-title">{selectedSavedLab.title}</h3>
                  <div className="modal-meta-row">
                    <span className="modal-topo-tag">{selectedSavedLab.topologyType?.toUpperCase()} TOPOLOGY</span>
                    {selectedSavedLab.roomCode && (
                      <span className="modal-code-tag">ROOM #{selectedSavedLab.roomCode}</span>
                    )}
                    <span className="modal-date-text">
                      Saved {new Date(selectedSavedLab.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedSavedLab(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="lab-modal-body">
              {/* Highlight Payload & Hop Traversal */}
              <div className="modal-payload-box">
                <span className="box-label">TRANSMITTED PAYLOAD TEXT</span>
                <h2 className="modal-payload-huge">"{selectedSavedLab.payloadText}"</h2>
                <div className="modal-path-line">
                  <span>Traversal Route:</span>
                  <strong>
                    {(selectedSavedLab.pathLabels?.length > 0 ? selectedSavedLab.pathLabels : ['A', 'B', 'C']).join(' \u2192 ')}
                  </strong>
                </div>
              </div>

              {/* Connected Devices Roster */}
              <div className="modal-devices-section">
                <h4>Connected Devices ({(selectedSavedLab.participants || []).length}):</h4>
                <div className="modal-devices-grid">
                  {(selectedSavedLab.participants || []).map((p, idx) => (
                    <div key={idx} className="modal-device-chip">
                      <span className="dot-green" />
                      <div className="chip-info">
                        <span className="chip-email">{p.email}</span>
                        <span className="chip-role">
                          {p.nodeLabel ? `Station ${p.nodeLabel}` : 'Station Node'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Procedural Logs Terminal */}
              <div className="modal-terminal-section">
                <div className="modal-term-header">
                  <Terminal size={14} />
                  <span>Synchronized Execution Logbook ({(selectedSavedLab.logs || []).length} events)</span>
                </div>
                <div className="modal-term-content">
                  {(selectedSavedLab.logs || []).length === 0 ? (
                    <span className="empty-log-text">No recorded events for this session.</span>
                  ) : (
                    (selectedSavedLab.logs || []).map((log, lIdx) => (
                      <div key={log.id || lIdx} className={`term-row ${log.type || 'info'}`}>
                        <span className="term-time">[{log.time}]</span>
                        <span className="term-msg">{log.message}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="lab-modal-footer">
              <button
                type="button"
                className="modal-open-topo-btn"
                onClick={() => {
                  navigate(`/topologies/${selectedSavedLab.topologyType}`);
                }}
              >
                <ArrowUpRight size={15} />
                <span>Open {selectedSavedLab.topologyType?.toUpperCase()} Topology Studio</span>
              </button>
              <button
                type="button"
                className="modal-dismiss-btn"
                onClick={() => setSelectedSavedLab(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Facility Simulation Modal */}
      {activeFacility && (
        <FacilityModal
          facilityId={activeFacility}
          onClose={() => setActiveFacility(null)}
        />
      )}
    </div>
  );
}
