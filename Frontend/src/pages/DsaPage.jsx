import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowUpRight, 
  Search, 
  Repeat, 
  GitCommit, 
  GitBranch, 
  Layers, 
  Sliders, 
  Network, 
  Share2, 
  Cpu, 
  Grid, 
  Zap,
  Binary,
  Layers as LinearIcon
} from 'lucide-react';
import Navbar from '../components/Navbar';
import HoloCard from '../components/HoloCard';
import { DSA_CARDS, DSA_SECTIONS } from '../utils/dsaCardArts';
import './DsaPage.css';

const DSA_ICONS = {
  Search,
  ArrowRight: Search,
  Zap,
  Repeat,
  GitCommit,
  GitBranch,
  Layers,
  Sliders,
  Network,
  Share2,
  Cpu,
  Grid
};

export default function DsaPage() {
  const navigate = useNavigate();

  // Scroll to absolute top on page mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // Filter state: 'all' | 'algorithms' | 'data_structures'
  const [activeFilter, setActiveFilter] = useState('all');

  const allCards = Object.values(DSA_CARDS);
  const algorithmCards = allCards.filter(c => c.section === DSA_SECTIONS.ALGORITHMS);
  const dataStructureCards = allCards.filter(c => c.section === DSA_SECTIONS.DATA_STRUCTURES);

  const handleLaunchLab = (id) => {
    navigate(`/dsa/${id}`);
  };

  return (
    <div className="dsa-viewport">
      {/* Persistent Top Navbar */}
      <Navbar onOpenFacility={(facilityId) => {
        if (facilityId === 'multi-mesh') navigate('/topologies');
        else if (facilityId === 'packet-trace' || facilityId === 'cdn') navigate('/cdn');
        else if (facilityId !== 'dsa-algo' && facilityId !== 'dsa') navigate('/');
      }} />

      {/* Main Container */}
      <main className="dsa-main-container">
        {/* Navigation Breadcrumb Row */}
        <div className="dsa-breadcrumb-row">
          <button 
            type="button" 
            className="dsa-back-pill"
            onClick={() => navigate('/')}
            aria-label="Back to home"
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </button>
          <span className="dsa-sep">/</span>
          <span className="dsa-crumb-active">Data Structures & Algorithms</span>
        </div>

        {/* Hero Section */}
        <div className="dsa-hero-section">
          <h1 className="dsa-main-title">
            <span>DATA STRUCTURES</span> <span className="dsa-title-gradient">& ALGORITHMS</span>
          </h1>
          <p className="dsa-hero-subtitle">
            Explore computational complexities, spatial models, and state transitions. Select any algorithm or data structure below to launch interactive real-time visualizers with step-by-step memory frame execution and multi-language code.
          </p>

          {/* Section Filter Pills */}
          <div className="dsa-filter-pills-row">
            <button
              type="button"
              className={`dsa-filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              <Binary size={13} />
              <span>All Modules (2 Distinct Sections)</span>
            </button>
            <button
              type="button"
              className={`dsa-filter-pill ${activeFilter === 'algorithms' ? 'active' : ''}`}
              onClick={() => setActiveFilter('algorithms')}
            >
              <Repeat size={13} />
              <span>Searching & Sorting Algorithms ({algorithmCards.length})</span>
            </button>
            <button
              type="button"
              className={`dsa-filter-pill ${activeFilter === 'data_structures' ? 'active' : ''}`}
              onClick={() => setActiveFilter('data_structures')}
            >
              <Network size={13} />
              <span>Data Structures ({dataStructureCards.length})</span>
            </button>
          </div>
        </div>

        {/* =================================================================
            SECTION 1: ALGORITHMS (SEARCHING & SORTING)
            ================================================================= */}
        {(activeFilter === 'all' || activeFilter === 'algorithms') && (
          <section className="dsa-section-block">
            <div className="dsa-section-header">
              <div className="dsa-sec-badge">SECTION 01</div>
              <h2 className="dsa-section-title">Algorithms (Searching & Sorting)</h2>
              <p className="dsa-section-desc">
                High-performance divide-and-conquer algorithms, logarithmic binary search, partition-exchange sorting, and comparison engines.
              </p>
            </div>

            <div className="dsa-grid">
              {algorithmCards.map((card) => {
                const Icon = DSA_ICONS[card.iconName] || Binary;
                return (
                  <div 
                    key={card.id}
                    className="dsa-holo-wrapper"
                    onClick={() => handleLaunchLab(card.id)}
                  >
                    {/* Compact Interactive 3D Holographic Reactbits Card Element */}
                    <div className="dsa-holo-center-stage">
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
                        <div className="dsa-holo-emblem" style={{ color: card.foilColor }}>
                          <div 
                            className="dsa-emblem-icon-ring"
                            style={{ borderColor: `${card.foilColor}40`, boxShadow: `0 0 20px ${card.foilColor}25` }}
                          >
                            <Icon size={32} strokeWidth={2} />
                          </div>
                          <span className="dsa-holo-label">{card.name}</span>
                        </div>
                      </HoloCard>
                    </div>

                    {/* Information & Action block */}
                    <div className="dsa-info-block">
                      <div className="dsa-card-top-meta">
                        <span className="dsa-sub-tag">{card.subCategory}</span>
                        <span className="dsa-complexity-badge">{card.timeComplexity}</span>
                      </div>
                      <h3 className="dsa-card-name">{card.name}</h3>
                      <p className="dsa-card-desc">{card.description}</p>

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
                        className="dsa-launch-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLaunchLab(card.id);
                        }}
                      >
                        <span>Launch Interactive Lab</span>
                        <ArrowUpRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* =================================================================
            SECTION 2: DATA STRUCTURES
            ================================================================= */}
        {(activeFilter === 'all' || activeFilter === 'data_structures') && (
          <section className="dsa-section-block">
            <div className="dsa-section-header">
              <div className="dsa-sec-badge alt">SECTION 02</div>
              <h2 className="dsa-section-title">Data Structures</h2>
              <p className="dsa-section-desc">
                Hierarchical binary search trees, dynamic pointer-linked memory nodes, LIFO stacks, FIFO queues, and interconnected graph networks.
              </p>
            </div>

            <div className="dsa-grid">
              {dataStructureCards.map((card) => {
                const Icon = DSA_ICONS[card.iconName] || Network;
                return (
                  <div 
                    key={card.id}
                    className="dsa-holo-wrapper"
                    onClick={() => handleLaunchLab(card.id)}
                  >
                    {/* Compact Interactive 3D Holographic Reactbits Card Element */}
                    <div className="dsa-holo-center-stage">
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
                        <div className="dsa-holo-emblem" style={{ color: card.foilColor }}>
                          <div 
                            className="dsa-emblem-icon-ring"
                            style={{ borderColor: `${card.foilColor}40`, boxShadow: `0 0 20px ${card.foilColor}25` }}
                          >
                            <Icon size={32} strokeWidth={2} />
                          </div>
                          <span className="dsa-holo-label">{card.name}</span>
                        </div>
                      </HoloCard>
                    </div>

                    {/* Information & Action block */}
                    <div className="dsa-info-block">
                      <div className="dsa-card-top-meta">
                        <span className="dsa-sub-tag alt">{card.subCategory}</span>
                        <span className="dsa-complexity-badge">{card.timeComplexity}</span>
                      </div>
                      <h3 className="dsa-card-name">{card.name}</h3>
                      <p className="dsa-card-desc">{card.description}</p>

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
                        className="dsa-launch-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLaunchLab(card.id);
                        }}
                      >
                        <span>Launch Interactive Lab</span>
                        <ArrowUpRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
