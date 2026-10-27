import { useState } from 'react';
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
  Activity
} from 'lucide-react';
import GradientWaves from '../components/GradientWaves';
import FacilityModal from '../components/FacilityModal';
import darkLogo from '../assets/DarkLogo.png';
import './MyLabsPage.css';

const LAB_FACILITIES = [
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
    id: 'packet-trace',
    title: 'Content Delivery Network (CDN)',
    category: 'Distributed Systems',
    icon: Server,
    tag: 'Network Simulation',
    description: 'Edge caching, Point of Presence (POP) global node replication, cache miss mitigation, and live packet hop latency tracing.',
    stats: '5 Global Edge Nodes &bull; Live Packet Flow'
  },
  {
    id: 'multi-mesh',
    title: 'Network Topologies',
    category: 'Network Engineering',
    icon: Network,
    tag: 'Topology Engine',
    description: 'Star, Mesh, Ring, and Bus structural architectures with automated fault injection, node failure recovery, and broadcast tracing.',
    stats: '4 Topologies &bull; Fault Tolerance Testing'
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
  const [activeFacility, setActiveFacility] = useState(null);

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
        <div className="labs-hero-badge-wrap">
          <span className="labs-hero-badge">
            <Activity size={13} />
            <span>Active Laboratories & Interactive Simulators</span>
          </span>
          <h1 className="labs-hero-title">My Research Laboratories</h1>
          <p className="labs-hero-subtitle">
            Direct access to your dedicated systems simulators, algorithmic visualizers, and operating system kernels.
          </p>
        </div>

        {/* Facilities Grid */}
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
      </main>

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
