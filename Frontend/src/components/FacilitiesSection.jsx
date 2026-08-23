import { Server, Network, Layers, GitFork, Binary, ArrowUpRight } from 'lucide-react'

export default function FacilitiesSection({ onSelectFacility, activeFacilityId }) {
  const facilities = [
    {
      id: 'dsa-algo',
      label: 'Data Structures & Algorithms',
      icon: Binary,
      color: '#00ff66',
      description: 'Trees, Graphs, Sorting & Dynamic Programming Visualizer'
    },
    {
      id: 'packet-trace',
      label: 'Content Delivery Network',
      icon: Server,
      color: '#00f0ff',
      description: 'Edge caching, POP server nodes & real-time latency simulation'
    },
    {
      id: 'multi-mesh',
      label: 'Network Topologies',
      icon: Network,
      color: '#00ff9d',
      description: 'Star, Mesh, Ring & Bus packet flow and fault tolerance visualizer'
    },
    {
      id: 'virt-memory',
      label: 'Page Replacement Algo',
      icon: Layers,
      color: '#ff007f',
      description: 'FIFO, LRU, LFU & Clock virtual memory page table translation'
    },
    {
      id: 'os-kernel',
      label: 'Routing Algo',
      icon: GitFork,
      color: '#fb923c',
      description: 'Dijkstra, Bellman-Ford, OSPF & BGP shortest path routing engines'
    }
  ]

  return (
    <div className="facilities-container">
      <h2 className="facilities-heading">The facilities we provide :</h2>

      <div className="facilities-grid">
        {facilities.map((fac) => {
          const isActive = activeFacilityId === fac.id
          return (
            <button
              key={fac.id}
              className={`facility-pill ${isActive ? 'active' : ''}`}
              onClick={() => onSelectFacility(fac.id)}
              aria-label={`Open facility: ${fac.label}`}
              title={fac.description}
            >
              <span className="pill-dot" style={{ backgroundColor: fac.color }}></span>
              <span className="pill-label">{fac.label}</span>
              <ArrowUpRight size={13} className="pill-arrow" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
