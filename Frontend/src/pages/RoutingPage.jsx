import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  GitFork,
  Shield,
  Server,
  Radio,
  Activity,
  Repeat,
  Zap,
  Cpu,
  Network,
  Layers
} from 'lucide-react';
import Navbar from '../components/Navbar';
import HoloCard from '../components/HoloCard';
import { ROUTING_CARDS, ROUTING_SECTIONS } from '../utils/routingCards';
import './PageReplacementPage.css';

const ICON_MAP = {
  GitFork,
  Shield,
  Server,
  Radio,
  Activity,
  Repeat,
  Zap,
  Cpu,
  Network,
  Layers
};

export default function RoutingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // Filter state: 'all' | 'distance_vector' | 'link_state' | 'static_heuristic'
  const [activeFilter, setActiveFilter] = useState('all');

  const allCards = Object.values(ROUTING_CARDS);
  const filteredCards = allCards.filter(card => {
    if (activeFilter === 'all') return true;
    return card.section === activeFilter;
  });

  const handleLaunchLab = (algoId) => {
    navigate(`/routing/${algoId}`);
  };

  return (
    <div className="topologies-viewport pr-hub-viewport">
      {/* Persistent Navbar */}
      <Navbar onOpenFacility={(facilityId) => {
        if (facilityId === 'multi-mesh') navigate('/topologies');
        else if (facilityId === 'packet-trace' || facilityId === 'cdn') navigate('/cdn');
        else if (facilityId === 'dsa-algo' || facilityId === 'dsa') navigate('/dsa');
        else if (facilityId === 'virt-memory' || facilityId === 'paging') navigate('/page-replacement');
        else if (facilityId !== 'os-kernel' && facilityId !== 'routing') navigate('/');
      }} />

      <main className="topologies-main-container">
        {/* Breadcrumb Navigation */}
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
          <span className="topologies-crumb-active">Routing Algorithms</span>
        </div>

        {/* Hero Section */}
        <div className="topologies-hero-section">
          <h1 className="topologies-main-title">
            <span>ROUTING</span> <span className="topologies-title-gradient">ALGORITHMS</span>
          </h1>
          <p className="topologies-hero-subtitle">
            Explore shortest path tree computation, distance vector message exchanges, link-state advertisement flooding, and enterprise router CLI configuration. Choose any routing protocol below to run real-time packet simulations or study comprehensive technical specifications.
          </p>

          {/* Filter Pills */}
          <div className="hub-filter-pills-row">
            <button
              type="button"
              className={`hub-filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              <Network size={13} />
              <span>All Protocols (10)</span>
            </button>
            <button
              type="button"
              className={`hub-filter-pill ${activeFilter === ROUTING_SECTIONS.DISTANCE_VECTOR ? 'active' : ''}`}
              onClick={() => setActiveFilter(ROUTING_SECTIONS.DISTANCE_VECTOR)}
            >
              <Repeat size={13} />
              <span>Distance Vector & Hybrid (3)</span>
            </button>
            <button
              type="button"
              className={`hub-filter-pill ${activeFilter === ROUTING_SECTIONS.LINK_STATE ? 'active' : ''}`}
              onClick={() => setActiveFilter(ROUTING_SECTIONS.LINK_STATE)}
            >
              <Cpu size={13} />
              <span>Link State Protocols (3)</span>
            </button>
            <button
              type="button"
              className={`hub-filter-pill ${activeFilter === ROUTING_SECTIONS.STATIC_HEURISTIC ? 'active' : ''}`}
              onClick={() => setActiveFilter(ROUTING_SECTIONS.STATIC_HEURISTIC)}
            >
              <Shield size={13} />
              <span>Static & Heuristic (4)</span>
            </button>
          </div>
        </div>

        {/* Holographic Cards Grid */}
        <div className="topologies-grid">
          {filteredCards.map((card) => {
            const Icon = ICON_MAP[card.iconName] || GitFork;
            return (
              <div
                key={card.id}
                className="topology-holo-wrapper"
                onClick={() => handleLaunchLab(card.id)}
              >
                {/* 3D Holographic Card Emblem */}
                <div className="holo-card-center-stage">
                  <HoloCard
                    preset={card.preset}
                    foilColor={card.foilColor}
                    width={240}
                    ratio={1.5}
                    radius={16}
                    intensity={0.9}
                    edgeSparkle={0.85}
                    glare={0.6}
                    hoverScale={1.04}
                  >
                    <div className="topo-holo-emblem" style={{ color: card.foilColor }}>
                      <div
                        className="topo-emblem-icon-ring"
                        style={{ borderColor: `${card.foilColor}40`, boxShadow: `0 0 20px ${card.foilColor}25` }}
                      >
                        <Icon size={32} strokeWidth={2} />
                      </div>
                      <span className="topo-holo-label">{card.shortName}</span>
                    </div>
                  </HoloCard>
                </div>

                {/* Metadata & Launch Action */}
                <div className="topology-info-block">
                  <div className="flex justify-between items-center mb-1">
                    <span className="theory-cat-badge">{card.category}</span>
                    <span className="text-xs font-mono font-bold text-amber-400">AD: {card.adminDistance}</span>
                  </div>

                  <h3 className="topology-card-name">{card.name}</h3>
                  <p className="topology-card-desc">{card.description}</p>

                  <div className="dsa-specs-grid">
                    {card.specs.map((sp, idx) => (
                      <div key={idx} className="dsa-spec-chip">
                        <span className="spec-lbl">{sp.label}:</span>
                        <span className="spec-txt">{sp.value}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="topology-launch-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLaunchLab(card.id);
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
