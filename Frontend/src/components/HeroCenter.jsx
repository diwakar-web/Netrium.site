import { Sparkles, Terminal } from 'lucide-react'
import Dismissible from './Dismissible'
import darkLogo from '../assets/DarkLogo.png'

export default function HeroCenter({ onLaunchQuickDemo }) {
  return (
    <div className="hero-center-container">
      {/* Step 1: Center Brand Logo Image */}
      <Dismissible as="div" className="hero-logo-wrapper">
        <img src={darkLogo} alt="Netrium Logo" className="hero-center-logo-img" />
      </Dismissible>

      {/* Step 2: Main Title Badges */}
      <Dismissible as="div" style={{ width: '100%' }}>
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
      </Dismissible>

      {/* Subheading */}
      <Dismissible as="div" className="hero-subheading-wrap">
        <p className="hero-subheading">
          Simulate. Visualize. Master.
        </p>
      </Dismissible>

      {/* Interactive Quick-Action Pill */}
      <div className="hero-interactive-trigger">
        <Dismissible inline as="div">
          <button 
            className="btn-hero-explore"
            onClick={() => onLaunchQuickDemo('dist-raft')}
            title="Open interactive Raft consensus visualizer"
          >
            <Sparkles size={14} className="sparkle-icon" />
            <span>Interactive Visualizer Playground</span>
            <Terminal size={14} className="terminal-icon" />
          </button>
        </Dismissible>
      </div>
    </div>
  )
}
