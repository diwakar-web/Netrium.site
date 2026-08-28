import { Server, Network, Layers, GitFork, Binary, ArrowUpRight } from 'lucide-react'
import Dismissible from './Dismissible'

export default function FacilitiesSection({ onSelectFacility, activeFacilityId }) {
  const facilities = [
    {
      id: 'dsa-algo',
      label: 'Data Structures & Algorithms',
      icon: Binary,
      description: 'Trees, Graphs, Sorting & Dynamic Programming Visualizer'
    },
    {
      id: 'packet-trace',
      label: 'Content Delivery Network',
      icon: Server,
      description: 'Edge caching, POP server nodes & real-time latency simulation'
    },
    {
      id: 'multi-mesh',
      label: 'Network Topologies',
      icon: Network,
      description: 'Star, Mesh, Ring & Bus packet flow and fault tolerance visualizer'
    },
    {
      id: 'virt-memory',
      label: 'Page Replacement Algo',
      icon: Layers,
      description: 'FIFO, LRU, LFU & Clock virtual memory page table translation'
    },
    {
      id: 'os-kernel',
      label: 'Routing Algo',
      icon: GitFork,
      description: 'Dijkstra, Bellman-Ford, OSPF & BGP shortest path routing engines'
    }
  ]

  return (
    <div className="facilities-container">
      <Dismissible as="h2" className="facilities-heading">
        The facilities we provide :
      </Dismissible>

      <div className="facilities-grid">
        {facilities.map((fac) => {
          const isActive = activeFacilityId === fac.id
          return (
            <Dismissible inline as="div" key={fac.id}>
              <button
                className={`facility-pill ${isActive ? 'active' : ''}`}
                onClick={() => onSelectFacility(fac.id)}
                aria-label={`Open facility: ${fac.label}`}
                title={fac.description}
              >
                <span className="pill-label">{fac.label}</span>
                <ArrowUpRight size={13} className="pill-arrow" />
              </button>
            </Dismissible>
          )
        })}
      </div>
    </div>
  )
}
