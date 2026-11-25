import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  Layers,
  Sparkles,
  Clock,
  Repeat,
  Activity,
  Zap,
  RotateCcw,
  Sliders,
  Server,
  HelpCircle,
  Binary,
  Cpu
} from 'lucide-react';
import Navbar from '../components/Navbar';
import HoloCard from '../components/HoloCard';
import { PAGE_REPLACEMENT_CARDS, PAGE_REPLACEMENT_SECTIONS } from '../utils/pageReplacementCards';
import './PageReplacementPage.css';

const ICON_MAP = {
  Layers,
  Sparkles,
  Clock,
  Repeat,
  Activity,
  Zap,
  RotateCcw,
  Sliders,
  Server,
  HelpCircle,
  Binary,
  Cpu
};

export default function PageReplacementPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // Filter state: 'all' | 'classical' | 'frequency' | 'hardware'
  const [activeFilter, setActiveFilter] = useState('all');

  const allCards = Object.values(PAGE_REPLACEMENT_CARDS);
  const filteredCards = allCards.filter(card => {
    if (activeFilter === 'all') return true;
    return card.section === activeFilter;
  });

  const handleLaunchLab = (algoId) => {
    navigate(`/page-replacement/${algoId}`);
  };

  return (
    <div className="topologies-viewport pr-hub-viewport">
      {/* Persistent Navbar */}
      <Navbar onOpenFacility={(facilityId) => {
        if (facilityId === 'multi-mesh') navigate('/topologies');
        else if (facilityId === 'packet-trace' || facilityId === 'cdn') navigate('/cdn');
        else if (facilityId === 'dsa-algo' || facilityId === 'dsa') navigate('/dsa');
        else if (facilityId === 'os-kernel' || facilityId === 'routing') navigate('/routing');
        else if (facilityId !== 'virt-memory' && facilityId !== 'paging') navigate('/');
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
          <span className="topologies-crumb-active">Page Replacement Algorithms</span>
        </div>

        {/* Hero Section */}
        <div className="topologies-hero-section">
          <h1 className="topologies-main-title">
            <span>PAGE REPLACEMENT</span> <span className="topologies-title-gradient">ALGORITHMS</span>
          </h1>
          <p className="topologies-hero-subtitle">
            Explore Operating System virtual memory allocation, page hit/miss ratios, Belady's Anomaly, and hardware MMU translation. Choose any algorithm below to launch its interactive step-by-step simulator, architectural specs curriculum, or practical kernel lab.
          </p>

          {/* Filter Pills */}
          <div className="hub-filter-pills-row">
            <button
              type="button"
              className={`hub-filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              <Layers size={13} />
              <span>All Algorithms (12)</span>
            </button>
            <button
              type="button"
              className={`hub-filter-pill ${activeFilter === PAGE_REPLACEMENT_SECTIONS.CLASSICAL ? 'active' : ''}`}
              onClick={() => setActiveFilter(PAGE_REPLACEMENT_SECTIONS.CLASSICAL)}
            >
              <Sparkles size={13} />
              <span>Classical & Stack (4)</span>
            </button>
            <button
              type="button"
              className={`hub-filter-pill ${activeFilter === PAGE_REPLACEMENT_SECTIONS.FREQUENCY ? 'active' : ''}`}
              onClick={() => setActiveFilter(PAGE_REPLACEMENT_SECTIONS.FREQUENCY)}
            >
              <Activity size={13} />
              <span>Frequency & Aging (3)</span>
            </button>
            <button
              type="button"
              className={`hub-filter-pill ${activeFilter === PAGE_REPLACEMENT_SECTIONS.HARDWARE ? 'active' : ''}`}
              onClick={() => setActiveFilter(PAGE_REPLACEMENT_SECTIONS.HARDWARE)}
            >
              <Cpu size={13} />
              <span>Hardware Approximations (5)</span>
            </button>
          </div>
        </div>

        {/* Holographic Cards Grid */}
        <div className="topologies-grid">
          {filteredCards.map((card) => {
            const Icon = ICON_MAP[card.iconName] || Layers;
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
                    <span className="text-xs font-mono font-bold text-emerald-400">{card.timeComplexity}</span>
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
