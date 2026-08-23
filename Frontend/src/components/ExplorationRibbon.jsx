import React from 'react'
import './ExplorationRibbon.css'

export default function ExplorationRibbon() {
  const tickerItems = [
    'SIMULATE OPERATING SYSTEMS & DISTRIBUTED NETWORKS IN REAL-TIME',
    'VISUALIZE RAFT CONSENSUS, PACKET ROUTING & MEMORY ALGORITHMS',
    'EXPERIMENT WITH INTERACTIVE MULTI-DEVICE SIMULATION PLAYGROUNDS',
    'MASTER COMPLEX COMPUTER ARCHITECTURE CONCEPTS INSTANTLY',
    'JOIN 52.5K+ RESEARCHERS & ENGINEERS EXPLORING NETRIUM LABORATORY',
  ]

  return (
    <div className="exploration-ribbon-wrapper" title="Interactive Exploration Banner — Pause on Hover">
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
