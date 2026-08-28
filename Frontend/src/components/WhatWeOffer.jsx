import React from 'react'
import { Binary, Server, Network, Layers, GitFork, ArrowUpRight } from 'lucide-react'
import ScrambledText from './ScrambledText'
import './WhatWeOffer.css'

export default function WhatWeOffer({ onOpenFacility }) {
  const sections = [
    {
      category: 'DATA STRUCTURES & ALGORITHMS',
      facilityId: 'dsa-algo',
      icon: Binary,
      iconLabel: 'DSA Icon',
      cards: [
        {
          id: 'dsa-1',
          tag: 'Step Execution',
          title: 'Execution & Traversal',
          text: 'Visualize algorithms and data structures through interactive, step-by-step execution.'
        },
        {
          id: 'dsa-2',
          tag: 'Real-Time State',
          title: 'Trees, Graphs & Sorting',
          text: 'Explore sorting, searching, trees, graphs, and more with real-time visualizations.'
        },
        {
          id: 'dsa-3',
          tag: 'Logic Engine',
          title: 'Dynamic State Engine',
          text: 'Experiment with algorithms and see their logic unfold dynamically.'
        }
      ]
    },
    {
      category: 'CONTENT DELIVERY NETWORK',
      facilityId: 'packet-trace',
      icon: Server,
      iconLabel: 'CDN Server Icon',
      cards: [
        {
          id: 'cdn-1',
          tag: 'Edge Topology',
          title: 'Edge Node Infrastructure',
          text: 'Connect devices as clients, servers, and edge nodes to simulate a live CDN.'
        },
        {
          id: 'cdn-2',
          tag: 'Cache Routing',
          title: 'Caching & Request Flow',
          text: 'Visualize caching, requests, routing, and content delivery across connected devices.'
        },
        {
          id: 'cdn-3',
          tag: 'Latency Optimization',
          title: 'High-Speed Distribution',
          text: 'Experience how distributed nodes deliver content faster and more efficiently.'
        }
      ]
    },
    {
      category: 'NETWORK TOPOLOGIES',
      facilityId: 'multi-mesh',
      icon: Network,
      iconLabel: 'Topology Network Icon',
      cards: [
        {
          id: 'top-1',
          tag: 'Topology Architecture',
          title: 'Architectural Layouts',
          text: 'Build and visualize Star, Ring, Mesh, Tree, and custom network topologies.'
        },
        {
          id: 'top-2',
          tag: 'Live Communication',
          title: 'Multi-Device Telemetry',
          text: 'Connect multiple devices and watch network communication happen in real time.'
        },
        {
          id: 'top-3',
          tag: 'Node Experimentation',
          title: 'Interactive Topology Lab',
          text: 'Design networks, connect nodes, and experiment with different topologies interactively.'
        }
      ]
    },
    {
      category: 'PAGE REPLACEMENT ALGO',
      facilityId: 'virt-memory',
      icon: Layers,
      iconLabel: 'Memory Paging Icon',
      cards: [
        {
          id: 'pr-1',
          tag: 'Memory Virtualization',
          title: 'Paging Algorithm Engine',
          text: 'Simulate FIFO, LRU, and Optimal algorithms with live memory visualization.'
        },
        {
          id: 'pr-2',
          tag: 'Fault Analysis',
          title: 'Fault & Hit Tracing',
          text: 'Watch page hits, faults, and replacements unfold step by step.'
        },
        {
          id: 'pr-3',
          tag: 'Strategy Benchmarking',
          title: 'Strategy Benchmarking',
          text: 'Compare page replacement strategies using custom reference strings.'
        }
      ]
    },
    {
      category: 'ROUTING ALGO',
      facilityId: 'os-kernel',
      icon: GitFork,
      iconLabel: 'Routing Protocol Icon',
      cards: [
        {
          id: 'route-1',
          tag: 'Path Optimization',
          title: 'Optimal Pathfinding',
          text: 'Visualize packets finding optimal paths across connected network nodes.'
        },
        {
          id: 'route-2',
          tag: 'Packet Telemetry',
          title: 'Real-Time Packet Flow',
          text: 'Experiment with routing algorithms and watch packet movement in real time.'
        },
        {
          id: 'route-3',
          tag: 'Multi-Metric Routing',
          title: 'Multi-Metric Comparison',
          text: 'Compare routes based on distance, hops, latency, and network conditions'
        }
      ]
    }
  ]

  return (
    <section className="what-we-offer-section" id="what-we-offer">
      <div className="what-we-offer-container">
        {/* Section Badge */}
        <div className="offer-badge-wrap">
          <span className="offer-badge">LABORATORY CAPABILITIES</span>
        </div>

        {/* Main Heading with ScrambledText Component */}
        <h2 className="offer-heading">
          <ScrambledText radius={100} duration={1.2} speed={0.5} scrambleChars=".:">
            What We Offer
          </ScrambledText>
        </h2>

        <p className="offer-subheading">
          Explore our suite of interactive visualizers, real-time simulators, and multi-device laboratory environments.
        </p>

        {/* Category Rows: 3 Cards Per Field Structure */}
        <div className="offer-category-rows">
          {sections.map((section, sIdx) => {
            const IconComponent = section.icon

            return (
              <div className="offer-row-group" key={sIdx}>
                {/* Row Header on Top Left with ScrambledText */}
                <div className="row-header-wrap">
                  <h3 className="row-category-title">
                    <ScrambledText
                      radius={100}
                      duration={1.2}
                      speed={0.5}
                      scrambleChars=".:"
                    >
                      {section.category}
                    </ScrambledText>
                  </h3>
                  <div className="row-category-line" />
                </div>

                {/* 3 Square Cards Grid with Alternating Green & White Borders */}
                <div className="row-cards-grid">
                  {section.cards.map((item, idx) => {
                    const isGreen = (sIdx + idx) % 2 === 0
                    const borderClass = isGreen ? 'border-green' : 'border-white'

                    return (
                      <div 
                        className={`offering-rect-card ${borderClass}`} 
                        key={idx}
                        aria-label={`${section.category} - ${item.title}`}
                      >
                        {/* Ambient Radial Hover Aura */}
                        <div className="card-ambient-glow" aria-hidden="true" />

                        {/* Card Top Row: Index Number */}
                        <div className="card-header-row">
                          <span className="card-index-num">0{idx + 1}</span>
                        </div>

                        {/* Card Body: Title + Big Readable Designer Statement */}
                        <div className="card-body-content">
                          <h4 className="card-title">{item.title}</h4>
                          <p className="card-main-statement">
                            {item.text}
                          </p>
                        </div>

                        {/* Card Footer: Capability Tag + Status Pulse Dot */}
                        <div className="card-footer-row">
                          <span className="card-capability-tag">{item.tag}</span>
                          <span className="card-status-dot" aria-hidden="true" />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Row Footer Button: Flat Green "Build & Simulate" */}
                <div className="row-footer-btn-wrap">
                  <button 
                    className="btn-lets-understand"
                    onClick={() => onOpenFacility && onOpenFacility(section.facilityId)}
                    aria-label={`Build & Simulate ${section.category}`}
                  >
                    <span>Build & Simulate</span>
                    <ArrowUpRight size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
