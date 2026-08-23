import { Sparkles, Terminal } from 'lucide-react'
import darkLogo from '../assets/DarkLogo.png'

export default function HeroCenter({ onLaunchQuickDemo }) {
  return (
    <div className="hero-center-container">
      {/* Step 1: Center Brand Logo Image (Appears after 1.0s alone) */}
      <div className="hero-logo-wrapper">
        <img src={darkLogo} alt="Netrium Logo" className="hero-center-logo-img" />
      </div>

      {/* Step 2: Main Title Badges (Appears after 1.75s with other elements) */}
      <h1 className="hero-main-title">
        <span className="title-row title-row-2 hero-sub-single-line">
          <span className="text-normal">Turn</span>
          <span className="pill-badge pill-white pill-sm">
            <span className="pill-text">Complex</span>  
          </span>
          <span className="text-normal">Concepts Into</span>
          <span className="pill-badge pill-accent pill-sm">
            <span className="pill-text">Interactive Systems.</span>
          </span>
        </span>
      </h1>

      {/* Subheading */}
      <div className="hero-subheading-wrap">
        <p className="hero-subheading">
          Simulate. Visualize. Master.
        </p>
      </div>

      {/* Interactive Quick-Action Pill */}
      <div className="hero-interactive-trigger">
        <button 
          className="btn-hero-explore"
          onClick={() => onLaunchQuickDemo('dist-raft')}
          title="Open interactive Raft consensus visualizer"
        >
          <Sparkles size={14} className="sparkle-icon" />
          <span>Interactive Visualizer Playground</span>
          <Terminal size={14} className="terminal-icon" />
        </button>
      </div>
    </div>
  )
}
