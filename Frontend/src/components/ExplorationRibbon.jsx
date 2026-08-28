import { useState } from 'react'
import { X } from 'lucide-react'
import './ExplorationRibbon.css'

export default function ExplorationRibbon() {
  const [isDismissed, setIsDismissed] = useState(false)

  const tickerItems = [
    'SIMULATE OPERATING SYSTEMS & DISTRIBUTED NETWORKS IN REAL-TIME',
    'VISUALIZE RAFT CONSENSUS, PACKET ROUTING & MEMORY ALGORITHMS',
    'EXPERIMENT WITH INTERACTIVE MULTI-DEVICE SIMULATION PLAYGROUNDS',
    'MASTER COMPLEX COMPUTER ARCHITECTURE CONCEPTS INSTANTLY',
    'JOIN 52.5K+ RESEARCHERS & ENGINEERS EXPLORING NETRIUM LABORATORY',
  ]

  if (isDismissed) {
    return <div className="exploration-ribbon-ghost-space" />
  }

  return (
    <div className="exploration-ribbon-wrapper" title="Interactive Exploration Banner ,  Pause on Hover">
      <button 
        type="button"
        className="ribbon-dismiss-cross-btn"
        onClick={() => setIsDismissed(true)}
        title="Dismiss banner temporarily"
        aria-label="Dismiss banner"
      >
        <X size={11} />
      </button>
      <div className="ribbon-track">
        {[...tickerItems, ...tickerItems].map((text, idx) => (
          <div className="ribbon-item" key={idx}>
            <span className="ribbon-text">{text}</span>
            <span className="ribbon-dot">•</span>
          </div>
        ))}
      </div>
    </div>
  )
}
