import React from 'react'
import './AboutNetrium.css'

export default function AboutNetrium() {
  return (
    <section className="about-netrium-section" id="about-netrium">
      <div className="about-netrium-container">
        {/* Header Badge */}
        <div className="about-badge-wrap">
          <span className="about-badge">SYSTEM ARCHITECTURE & LEARNING LAB</span>
        </div>

        {/* Main Heading */}
        <h2 className="about-heading">
          What Is <span className="highlight-netrium">NetRIUM</span>?
        </h2>

        {/* Intro Body Paragraph (Left-Aligned) */}
        <p className="about-description">
          Netrium is a real-time interactive learning laboratory that brings complex concepts from Operating Systems, Computer Networks, Distributed Systems, and Data Structures & Algorithms to life. Through dynamic visualizations, simulations, and multi-device experimentation, users can build, observe, and interact with algorithms and systems as they work in real time.
        </p>
      </div>
    </section>
  )
}
