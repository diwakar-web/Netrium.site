import React from 'react'
import { ArrowUpRight } from 'lucide-react'
import ScrambledText from './ScrambledText'
import './WhatWeOffer.css'

// Custom Tech Visual Graphic SVG Component for Default Image Space
function CardGraphic({ type }) {
  switch (type) {
    case 'cpu-scheduling':
      return (
        <svg viewBox="0 0 200 120" className="card-svg-graphic" fill="none">
          <rect x="20" y="25" width="160" height="70" rx="8" fill="#000000" stroke="rgba(0, 191, 99, 0.4)" strokeWidth="1.5" />
          <rect x="35" y="40" width="35" height="18" rx="4" fill="#00bf63" opacity="0.85" />
          <rect x="75" y="40" width="50" height="18" rx="4" fill="#3b82f6" opacity="0.85" />
          <rect x="130" y="40" width="35" height="18" rx="4" fill="#8b5cf6" opacity="0.85" />
          <rect x="35" y="65" width="60" height="18" rx="4" fill="#10b981" opacity="0.85" />
          <rect x="100" y="65" width="65" height="18" rx="4" fill="#00bf63" opacity="0.85" />
          <circle cx="35" cy="49" r="2" fill="#fff" />
          <circle cx="75" cy="49" r="2" fill="#fff" />
          <circle cx="130" cy="49" r="2" fill="#fff" />
        </svg>
      )
    case 'memory-paging':
      return (
        <svg viewBox="0 0 200 120" className="card-svg-graphic" fill="none">
          <rect x="20" y="20" width="70" height="80" rx="6" fill="#000000" stroke="rgba(255,255,255,0.15)" />
          <rect x="110" y="20" width="70" height="80" rx="6" fill="#000000" stroke="rgba(0, 191, 99, 0.4)" />
          <rect x="26" y="28" width="58" height="14" rx="3" fill="rgba(0, 191, 99, 0.2)" stroke="#00bf63" />
          <rect x="26" y="46" width="58" height="14" rx="3" fill="rgba(255, 255, 255, 0.05)" />
          <rect x="26" y="64" width="58" height="14" rx="3" fill="rgba(255, 255, 255, 0.05)" />
          <rect x="116" y="28" width="58" height="14" rx="3" fill="rgba(255, 255, 255, 0.05)" />
          <rect x="116" y="46" width="58" height="14" rx="3" fill="rgba(0, 191, 99, 0.8)" />
          <rect x="116" y="64" width="58" height="14" rx="3" fill="rgba(255, 255, 255, 0.05)" />
          <path d="M84 35 C96 35, 100 53, 116 53" stroke="#00bf63" strokeWidth="2" strokeDasharray="3 3" />
        </svg>
      )
    case 'packet-routing':
      return (
        <svg viewBox="0 0 200 120" className="card-svg-graphic" fill="none">
          <circle cx="40" cy="60" r="14" fill="#000000" stroke="#00bf63" strokeWidth="2" />
          <circle cx="100" cy="30" r="14" fill="#000000" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
          <circle cx="100" cy="90" r="14" fill="#000000" stroke="#00bf63" strokeWidth="2" />
          <circle cx="160" cy="60" r="14" fill="#000000" stroke="#00bf63" strokeWidth="2" />
          <line x1="53" y1="52" x2="87" y2="37" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
          <line x1="53" y1="68" x2="87" y2="83" stroke="#00bf63" strokeWidth="2" />
          <line x1="113" y1="83" x2="147" y2="68" stroke="#00bf63" strokeWidth="2" />
          <line x1="113" y1="37" x2="147" y2="52" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
          <circle cx="70" cy="75" r="4" fill="#00bf63" />
          <circle cx="130" cy="75" r="4" fill="#00bf63" />
        </svg>
      )
    case 'raft-consensus':
      return (
        <svg viewBox="0 0 200 120" className="card-svg-graphic" fill="none">
          <circle cx="100" cy="40" r="18" fill="rgba(0, 191, 99, 0.15)" stroke="#00bf63" strokeWidth="2" />
          <path d="M93 30 L100 24 L107 30 L104 36 L96 36 Z" fill="#00bf63" />
          <circle cx="50" cy="90" r="14" fill="#000000" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
          <circle cx="150" cy="90" r="14" fill="#000000" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
          <path d="M62 82 Q80 58 84 52" stroke="#00bf63" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M138 82 Q120 58 116 52" stroke="#00bf63" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>
      )
    case 'graph-traversal':
      return (
        <svg viewBox="0 0 200 120" className="card-svg-graphic" fill="none">
          <circle cx="35" cy="60" r="12" fill="#00bf63" />
          <circle cx="85" cy="35" r="12" fill="#000000" stroke="#00bf63" strokeWidth="2" />
          <circle cx="85" cy="85" r="12" fill="#000000" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
          <circle cx="140" cy="35" r="12" fill="#000000" stroke="#00bf63" strokeWidth="2" />
          <circle cx="165" cy="85" r="12" fill="#000000" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
          <line x1="46" y1="54" x2="74" y2="41" stroke="#00bf63" strokeWidth="2.5" />
          <line x1="46" y1="66" x2="74" y2="79" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
          <line x1="97" y1="35" x2="128" y2="35" stroke="#00bf63" strokeWidth="2.5" />
          <line x1="97" y1="85" x2="153" y2="85" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
          <line x1="145" y1="46" x2="160" y2="74" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
        </svg>
      )
    case 'mesh-sync':
      return (
        <svg viewBox="0 0 200 120" className="card-svg-graphic" fill="none">
          <rect x="30" y="35" width="60" height="40" rx="4" fill="#000000" stroke="#00bf63" strokeWidth="1.5" />
          <rect x="25" y="75" width="70" height="6" rx="2" fill="#00bf63" />
          <rect x="135" y="30" width="30" height="55" rx="5" fill="#000000" stroke="#00bf63" strokeWidth="1.5" />
          <circle cx="150" cy="78" r="2.5" fill="#00bf63" />
          <path d="M95 50 Q112 40 130 50" stroke="#00bf63" strokeWidth="2" strokeDasharray="3 3" />
          <path d="M130 62 Q112 72 95 62" stroke="#00bf63" strokeWidth="2" strokeDasharray="3 3" />
        </svg>
      )
    case 'cdn-caching':
      return (
        <svg viewBox="0 0 200 120" className="card-svg-graphic" fill="none">
          <path d="M85 35 C85 28, 115 28, 115 35 C125 35, 125 50, 115 50 L85 50 C75 50, 75 35, 85 35 Z" fill="#000000" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <rect x="25" y="80" width="40" height="22" rx="4" fill="#000000" stroke="#00bf63" strokeWidth="1.5" />
          <rect x="80" y="80" width="40" height="22" rx="4" fill="#000000" stroke="#00bf63" strokeWidth="1.5" />
          <rect x="135" y="80" width="40" height="22" rx="4" fill="#000000" stroke="#00bf63" strokeWidth="1.5" />
          <line x1="90" y1="52" x2="45" y2="78" stroke="#00bf63" strokeWidth="1.5" />
          <line x1="100" y1="52" x2="100" y2="78" stroke="#00bf63" strokeWidth="1.5" />
          <line x1="110" y1="52" x2="155" y2="78" stroke="#00bf63" strokeWidth="1.5" />
        </svg>
      )
    case 'bankers-algo':
      return (
        <svg viewBox="0 0 200 120" className="card-svg-graphic" fill="none">
          <rect x="25" y="25" width="150" height="70" rx="6" fill="#000000" stroke="rgba(0, 191, 99, 0.4)" strokeWidth="1.5" />
          <line x1="25" y1="48" x2="175" y2="48" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <line x1="25" y1="71" x2="175" y2="71" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <line x1="75" y1="25" x2="75" y2="95" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <line x1="125" y1="25" x2="125" y2="95" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <circle cx="50" cy="36.5" r="4" fill="#00bf63" />
          <circle cx="100" cy="60" r="4" fill="#00bf63" />
          <circle cx="150" cy="83" r="4" fill="#00bf63" />
        </svg>
      )
    case 'avl-tree':
      return (
        <svg viewBox="0 0 200 120" className="card-svg-graphic" fill="none">
          <circle cx="100" cy="25" r="12" fill="#000000" stroke="#00bf63" strokeWidth="2" />
          <circle cx="60" cy="60" r="12" fill="#000000" stroke="#00bf63" strokeWidth="2" />
          <circle cx="140" cy="60" r="12" fill="#000000" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
          <circle cx="35" cy="95" r="10" fill="#000000" stroke="#00bf63" strokeWidth="1.5" />
          <circle cx="85" cy="95" r="10" fill="#000000" stroke="#00bf63" strokeWidth="1.5" />
          <line x1="91" y1="33" x2="69" y2="52" stroke="#00bf63" strokeWidth="1.5" />
          <line x1="109" y1="33" x2="131" y2="52" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
          <line x1="53" y1="69" x2="42" y2="86" stroke="#00bf63" strokeWidth="1.5" />
          <line x1="67" y1="69" x2="78" y2="86" stroke="#00bf63" strokeWidth="1.5" />
        </svg>
      )
    case 'tcp-handshake':
      return (
        <svg viewBox="0 0 200 120" className="card-svg-graphic" fill="none">
          <line x1="45" y1="20" x2="45" y2="100" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
          <line x1="155" y1="20" x2="155" y2="100" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
          <path d="M45 35 L155 50" stroke="#00bf63" strokeWidth="2" strokeDasharray="3 3" />
          <path d="M155 60 L45 75" stroke="#3b82f6" strokeWidth="2" strokeDasharray="3 3" />
          <path d="M45 85 L155 95" stroke="#00bf63" strokeWidth="2" strokeDasharray="3 3" />
          <polygon points="155,50 148,46 149,52" fill="#00bf63" />
          <polygon points="45,75 52,71 51,77" fill="#3b82f6" />
          <polygon points="155,95 148,91 149,97" fill="#00bf63" />
        </svg>
      )
    case 'topologies':
      return (
        <svg viewBox="0 0 200 120" className="card-svg-graphic" fill="none">
          <polygon points="100,22 155,55 135,100 65,100 45,55" fill="none" stroke="#00bf63" strokeWidth="1.5" />
          <circle cx="100" cy="22" r="8" fill="#000000" stroke="#00bf63" strokeWidth="2" />
          <circle cx="155" cy="55" r="8" fill="#000000" stroke="#00bf63" strokeWidth="2" />
          <circle cx="135" cy="100" r="8" fill="#000000" stroke="#00bf63" strokeWidth="2" />
          <circle cx="65" cy="100" r="8" fill="#000000" stroke="#00bf63" strokeWidth="2" />
          <circle cx="45" cy="55" r="8" fill="#000000" stroke="#00bf63" strokeWidth="2" />
        </svg>
      )
    case 'system-calls':
      return (
        <svg viewBox="0 0 200 120" className="card-svg-graphic" fill="none">
          <rect x="25" y="20" width="150" height="35" rx="5" fill="#000000" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
          <rect x="25" y="65" width="150" height="35" rx="5" fill="rgba(0, 191, 99, 0.1)" stroke="#00bf63" strokeWidth="1.5" />
          <text x="35" y="42" fill="#94a3b8" fontSize="10" fontFamily="sans-serif" fontWeight="bold">USER SPACE</text>
          <text x="35" y="87" fill="#00bf63" fontSize="10" fontFamily="sans-serif" fontWeight="bold">KERNEL SPACE</text>
          <path d="M140 40 L140 75" stroke="#00bf63" strokeWidth="2" strokeDasharray="3 3" />
          <polygon points="140,75 136,68 144,68" fill="#00bf63" />
        </svg>
      )
    default:
      return null
  }
}

export default function WhatWeOffer({ onOpenFacility }) {
  const sections = [
    {
      category: 'OPERATING SYSTEMS & KERNEL ENGINE',
      facilityId: 'os-kernel',
      cards: [
        {
          id: 'os-kernel',
          badge: 'OS KERNEL',
          title: 'CPU Scheduling & Gantt Timeline',
          desc: 'Simulate Preemptive Round-Robin, FCFS, and Priority scheduling with live Gantt chart execution ticks and context switch metrics.',
          imgSvg: 'cpu-scheduling'
        },
        {
          id: 'virt-memory',
          badge: 'MEMORY PAGING',
          title: 'Virtual Memory & Page Tables',
          desc: 'Observe FIFO, LRU, and Clock page replacement algorithms, page fault triggers, and virtual-to-physical address translation.',
          imgSvg: 'memory-paging'
        },
        {
          id: 'os-kernel',
          badge: 'OS KERNEL',
          title: 'Deadlock Detection & Banker’s Algo',
          desc: 'Detect resource allocation graph cycles, test safe state vectors, and prevent process deadlock states live.',
          imgSvg: 'bankers-algo'
        }
      ]
    },
    {
      category: 'COMPUTER NETWORKS & TOPOLOGY',
      facilityId: 'net-routing',
      cards: [
        {
          id: 'net-routing',
          badge: 'NETWORKING',
          title: 'BGP & OSPF Packet Routing',
          desc: 'Trace multi-hop packet routing across autonomous systems with live hop latency telemetry and BGP route convergence.',
          imgSvg: 'packet-routing'
        },
        {
          id: 'packet-trace',
          badge: 'CDN ENGINE',
          title: 'CDN Edge Server Caching',
          desc: 'Simulate edge POP cache hits, TTL cache invalidation, and origin fallback latencies across global edge servers.',
          imgSvg: 'cdn-caching'
        },
        {
          id: 'multi-mesh',
          badge: 'TOPOLOGIES',
          title: 'Star, Mesh, Ring & Bus Topologies',
          desc: 'Test network packet collision rates, ring token passing, and single-point-of-failure resiliency across 4 topologies.',
          imgSvg: 'topologies'
        }
      ]
    },
    {
      category: 'DISTRIBUTED SYSTEMS & MESH SYNC',
      facilityId: 'dist-raft',
      cards: [
        {
          id: 'dist-raft',
          badge: 'DISTRIBUTED SYS',
          title: 'Raft Consensus & Heartbeats',
          desc: 'Visualize leader election, term numbering, log entry replication, and network partition recovery across distributed nodes.',
          imgSvg: 'raft-consensus'
        },
        {
          id: 'multi-mesh',
          badge: 'MULTI-DEVICE',
          title: 'Multi-Device Mesh Sync',
          desc: 'Synchronize simulation states in real time across physical smartphones, tablets, and laptops using WebSocket mesh relay.',
          imgSvg: 'mesh-sync'
        },
        {
          id: 'virt-memory',
          badge: 'OS KERNEL',
          title: 'System Calls & Inter-Process Comm',
          desc: 'Trace kernel trap interrupts, shared memory pipes, message queues, and POSIX semaphore synchronization.',
          imgSvg: 'system-calls'
        }
      ]
    },
    {
      category: 'DATA STRUCTURES & ALGORITHM CORE',
      facilityId: 'dsa-algo',
      cards: [
        {
          id: 'dsa-algo',
          badge: 'ALGORITHMS',
          title: 'Graph Traversals & Pathfinding',
          desc: 'Step through Dijkstra, A* search, BFS, and DFS graph traversal states with live node discovery stack inspection.',
          imgSvg: 'graph-traversal'
        },
        {
          id: 'dsa-algo',
          badge: 'DATA STRUCTURES',
          title: 'Balanced Binary Search Trees',
          desc: 'Observe AVL tree left/right rotations, Red-Black tree recoloring, and height-balancing step-by-step.',
          imgSvg: 'avl-tree'
        },
        {
          id: 'net-routing',
          badge: 'NETWORKING',
          title: 'TCP/IP Handshake & Congestion',
          desc: 'Analyze SYN-ACK 3-way handshakes, Tahoe/Reno congestion window expansion, and sliding window packet ACKs.',
          imgSvg: 'tcp-handshake'
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

        {/* Category Rows */}
        <div className="offer-category-rows">
          {sections.map((section, sIdx) => (
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
                <div className="row-category-line"></div>
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
                      onClick={() => onOpenFacility && onOpenFacility(item.id)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="card-top-bar">
                        <span className="card-category-badge">{item.badge}</span>
                        <h4 className="card-title">{item.title}</h4>
                      </div>

                      <div className="card-image-wrapper">
                        <CardGraphic type={item.imgSvg} />
                      </div>

                      <div className="card-hover-text-overlay">
                        <p className="hover-desc-text">{item.desc}</p>
                        <div className="card-launch-btn">
                          <span>Launch Visualizer</span>
                          <ArrowUpRight size={14} className="launch-icon" />
                        </div>
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
          ))}
        </div>
      </div>
    </section>
  )
}
