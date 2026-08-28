import React, { useState } from 'react'
import { ArrowRight, X } from 'lucide-react'
import ScrollExpand from './ScrollExpand'
import './OurVision.css'

export default function OurVision({ onOpenFacility }) {
  const [dismissedCards, setDismissedCards] = useState({})

  const handleDismissCard = (idx, e) => {
    e.stopPropagation()
    setDismissedCards(prev => ({ ...prev, [idx]: true }))
  }

  const problems = [
    {
      stat: '75%–80% vs 10%–20%',
      title: 'Retention Rate Boost',
      desc: 'Traditional lecture and textbook learning yields an average 10% to 20% information retention rate, whereas interactive visual simulation and hands-on experimentation drive retention up to 75% to 80%.'
    },
    {
      stat: '40% Faster Solving',
      title: 'Debugging & Problem-Solving Speed',
      desc: 'Students who use visual, interactive execution models solve complex data structure and system concurrency problems up to 40% faster than those learning via static pseudocode and text.'
    },
    {
      stat: '50% Less Mapping Overhead',
      title: 'Conceptual Mastery over Memorization',
      desc: 'While 70% of CS students struggle to visualize abstract concepts like thread synchronization or consensus on paper, real-time state visualization reduces visual mapping overhead by over 50%.'
    },
    {
      stat: '100% Zero Setup Time',
      title: 'Time Saved on System Setup',
      desc: "Setting up multi-node distributed environments or kernel labs manually wastes up to 30% of lab time on config errors; Netrium's browser simulation gives students 100% of that time back for experimentation."
    },
    {
      stat: '60%+ Practical Intuition',
      title: 'Bridging Employer Readiness Gap',
      desc: 'While over 60% of tech hiring managers believe graduates lack practical systems intuition, multi-device simulation grants direct insight into edge cases, latency, and race conditions before entering the job market.'
    },
    {
      stat: '50%+ Cognitive Relief',
      title: 'Reduced Cognitive Load & Fast Learning',
      desc: 'Static diagrams force students to spend up to 45% of study time mentally building state transitions; interactive simulation cuts mental overhead by over 50%, enabling mastery in minutes instead of hours.'
    }
  ]

  return (
    <section className="our-vision-section" id="our-vision">
      <ScrollExpand
        title="Our Vision"
        scrollHint="Scroll to Reveal the Reality"
        useWindowScroll={true}
        startWidth={48}
        startHeight={54}
        startRadius={24}
        endRadius={0}
        mediaZoom={1.15}
        scrollDistance={1.2}
        holdDistance={0.25}
        smoothing={0.08}
        overlayScrim={0.02}
        className="vision-scroll-expand"
      >
        <div className="vision-overlay-content">
          {/* Header Section */}
          <div className="vision-header">
            <h2 className="vision-main-title">
              Why We Built <span className="vision-blue-text">NetRIUM</span>
            </h2>
            <p className="vision-subtitle">
              Traditional CS education leaves engineers unprepared for production systems ,  here is what the data reveals:
            </p>
          </div>

          {/* 6 Problem Cards Grid: 3x2 Matrix with Dismiss Buttons */}
          <div className="vision-problems-grid">
            {problems.map((item, idx) => {
              const isDismissed = dismissedCards[idx]
              if (isDismissed) {
                return <div className="vision-card vision-card-ghost-space" key={idx} aria-hidden="true" />
              }

              return (
                <div className="vision-card" key={idx}>
                  <button
                    type="button"
                    className="card-dismiss-cross-btn"
                    onClick={(e) => handleDismissCard(idx, e)}
                    title="Dismiss card temporarily"
                    aria-label="Dismiss card"
                  >
                    <X size={12} />
                  </button>
                  <div className="vision-card-stat">{item.stat}</div>
                  <h3 className="vision-card-title">{item.title}</h3>
                  <p className="vision-card-desc">{item.desc}</p>
                </div>
              )
            })}
          </div>

          {/* Concluding Statement: What Netrium Solves */}
          <div className="vision-solution-banner">
            <div className="solution-inner">
              <div className="solution-text-col">
                <h3 className="solution-title">
                  Real-Time Systems & <span className="solution-title-blue">Interactive Engineering Lab</span>
                </h3>
                <p className="solution-body">
                  NetRIUM is a real-time interactive learning laboratory that brings complex concepts from Operating Systems, Computer Networks, Distributed Systems, and Data Structures & Algorithms to life. Through dynamic visualizations, simulations, and multi-device experimentation, users can build, observe, and interact with algorithms and systems as they work in real time.
                </p>
              </div>

              <div className="solution-actions-col">
                <button
                  className="vision-launch-btn primary-black"
                  onClick={() => onOpenFacility && onOpenFacility('os-kernel')}
                >
                  <span>Launch Interactive Lab</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </ScrollExpand>
    </section>
  )
}
