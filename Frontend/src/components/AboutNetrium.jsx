import React from 'react'
import MagnetLines from './MagnetLines'
import Dismissible from './Dismissible'
import './AboutNetrium.css'

export default function AboutNetrium() {
  return (
    <section className="about-netrium-section" id="about-netrium">
      <div className="about-netrium-container">
        {/* Left Column: Text & Content */}
        <div className="about-left-col">
          <Dismissible as="div" style={{ width: '100%' }}>
            <h2 className="about-heading">
              What Is <span className="highlight-netrium">NetRIUM</span>?
            </h2>
          </Dismissible>

          <Dismissible as="div" style={{ width: '100%' }}>
            <p className="about-description">
              Netrium is a real-time interactive learning laboratory that brings complex concepts from Operating Systems, Computer Networks, Distributed Systems, and Data Structures & Algorithms to life. Through dynamic visualizations, simulations, and multi-device experimentation, users can build, observe, and interact with algorithms and systems as they work in real time.
            </p>
          </Dismissible>
        </div>

        {/* Right Column: Clean MagnetLines aligned to rightmost side */}
        <div className="about-right-col">
          <Dismissible as="div" className="magnet-lines-stage">
            <MagnetLines
              rows={8}
              columns={8}
              containerSize="360px"
              lineColor="#00bf63"
              lineWidth="3px"
              lineHeight="24px"
              baseAngle={-10}
            />
          </Dismissible>
        </div>
      </div>
    </section>
  )
}
