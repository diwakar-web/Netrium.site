import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowUpRight, 
  Network, 
  Share2, 
  GitCommit, 
  Repeat, 
  Grid, 
  GitBranch, 
  Layers 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import HoloCard from '../components/HoloCard';
import { TOPOLOGY_CARDS } from '../utils/topologyCardArts';
import './TopologiesPage.css';

const TOPOLOGY_ICONS = {
  star: Share2,
  bus: GitCommit,
  ring: Repeat,
  mesh: Grid,
  tree: GitBranch,
  hybrid: Layers
};

export default function TopologiesPage() {
  const navigate = useNavigate();

  // Scroll to absolute top on page mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  const topologyList = Object.values(TOPOLOGY_CARDS);

  const handleCardClick = (id) => {
    navigate(`/topologies/${id}`);
  };

  return (
    <div className="topologies-viewport">
      {/* Persistent Top Navbar */}
      <Navbar onOpenFacility={(facilityId) => {
        if (facilityId !== 'multi-mesh') {
          navigate('/');
        }
      }} />

      {/* Main Container */}
      <main className="topologies-main-container">
        {/* Navigation Breadcrumb Row */}
        <div className="topologies-breadcrumb-row">
          <button 
            type="button" 
            className="topologies-back-pill"
            onClick={() => navigate('/')}
            aria-label="Back to home"
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </button>
          <span className="topologies-sep">/</span>
          <span className="topologies-crumb-active">Network Topologies</span>
        </div>

        {/* Hero Section */}
        <div className="topologies-hero-section">
          <h1 className="topologies-main-title">
            <span>NETWORK</span> <span className="topologies-title-gradient">TOPOLOGIES</span>
          </h1>
          <p className="topologies-hero-subtitle">
            Explore geometric node interconnections, physical signal propagation, and packet routing protocols. Select an architecture below to run real-time hardware simulations or study comprehensive technical specifications.
          </p>
        </div>

        {/* Topologies Grid with Compact HoloCard - NO image on cards */}
        <div className="topologies-grid">
          {topologyList.map((topo) => {
            const Icon = TOPOLOGY_ICONS[topo.id] || Network;
            return (
              <div 
                key={topo.id} 
                className="topology-holo-wrapper"
                onClick={() => handleCardClick(topo.id)}
              >
                {/* Compact Interactive 3D Holographic Reactbits Card Element */}
                <div className="holo-card-center-stage">
                  <HoloCard
                    preset={topo.preset}
                    foilColor={topo.foilColor}
                    width={240}
                    ratio={1.5}
                    radius={16}
                    intensity={0.9}
                    edgeSparkle={0.85}
                    glare={0.6}
                    hoverScale={1.04}
                  >
                    <div className="topo-holo-emblem" style={{ color: topo.foilColor }}>
                      <div className="topo-emblem-icon-ring" style={{ borderColor: `${topo.foilColor}40`, boxShadow: `0 0 20px ${topo.foilColor}25` }}>
                        <Icon size={32} strokeWidth={2} />
                      </div>
                      <span className="topo-holo-label">{topo.name.replace(' Topology', '')}</span>
                    </div>
                  </HoloCard>
                </div>

                {/* Text & Short Description Below Reactbits Card Element */}
                <div className="topology-info-block">
                  <h3 className="topology-card-name">{topo.name}</h3>
                  <p className="topology-card-desc">{topo.description}</p>

                  {/* Action Button */}
                  <button 
                    type="button" 
                    className="topology-launch-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick(topo.id);
                    }}
                  >
                    <span>Launch Interactive Lab</span>
                    <ArrowUpRight size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
