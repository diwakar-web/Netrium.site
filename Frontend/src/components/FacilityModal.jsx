import { useState, useEffect } from 'react'
import { X, Play, RotateCcw, Cpu, Network, Server, Smartphone, Layers, CheckCircle2, AlertTriangle, ArrowRight, Zap, Binary } from 'lucide-react'

export default function FacilityModal({ facilityId, onClose }) {
  const [activeTab, setActiveTab] = useState(facilityId || 'dsa-algo')

  // Sync tab if prop changes
  useEffect(() => {
    if (facilityId) setActiveTab(facilityId)
  }, [facilityId])

  // ================= 0. Data Structures & Algorithms State =================
  const [dsaAlgorithm, setDsaAlgorithm] = useState('bubble')
  const [sortStep, setSortStep] = useState(0)
  const [isPlayingDsa, setIsPlayingDsa] = useState(false)
  const [arrayBars, setArrayBars] = useState([45, 12, 88, 32, 67, 21, 94, 50])

  const sortStepsData = [
    { bars: [45, 12, 88, 32, 67, 21, 94, 50], active: [0, 1], msg: 'Comparing 45 and 12 → Swap needed' },
    { bars: [12, 45, 88, 32, 67, 21, 94, 50], active: [1, 2], msg: 'Comparing 45 and 88 → In order' },
    { bars: [12, 45, 32, 88, 67, 21, 94, 50], active: [2, 3], msg: 'Comparing 88 and 32 → Swap needed' },
    { bars: [12, 32, 45, 67, 88, 21, 94, 50], active: [3, 4], msg: 'Comparing 88 and 67 → Swap needed' },
    { bars: [12, 32, 45, 67, 21, 88, 94, 50], active: [4, 5], msg: 'Comparing 88 and 21 → Swap needed' },
    { bars: [12, 32, 45, 21, 67, 88, 50, 94], active: [6, 7], msg: 'Comparing 94 and 50 → Swap needed' },
    { bars: [12, 21, 32, 45, 50, 67, 88, 94], active: [], msg: 'SORT COMPLETE! Array fully ordered [12, 21, 32, 45, 50, 67, 88, 94]' }
  ]

  useEffect(() => {
    let timer
    if (isPlayingDsa) {
      timer = setInterval(() => {
        setSortStep((prev) => {
          if (prev >= sortStepsData.length - 1) {
            setIsPlayingDsa(false)
            return prev
          }
          return prev + 1
        })
      }, 700)
    }
    return () => clearInterval(timer)
  }, [isPlayingDsa, sortStepsData.length])

  // ================= 1. OS Scheduling State =================
  const [osAlgorithm, setOsAlgorithm] = useState('rr')
  const [osStep, setOsStep] = useState(0)
  const [isPlayingOs, setIsPlayingOs] = useState(false)

  const processes = [
    { id: 'P1', burst: 5, color: '#00ff66' },
    { id: 'P2', burst: 3, color: '#f43f5e' },
    { id: 'P3', burst: 4, color: '#38bdf8' },
    { id: 'P4', burst: 2, color: '#fb923c' }
  ]

  const ganttSequences = {
    rr: ['P1', 'P2', 'P3', 'P4', 'P1', 'P2', 'P3', 'P1', 'P3'],
    fcfs: ['P1', 'P1', 'P1', 'P1', 'P1', 'P2', 'P2', 'P2', 'P3', 'P3', 'P3', 'P3', 'P4', 'P4'],
    sjf: ['P4', 'P4', 'P2', 'P2', 'P2', 'P3', 'P3', 'P3', 'P3', 'P1', 'P1', 'P1', 'P1', 'P1']
  }

  const currentGantt = ganttSequences[osAlgorithm] || ganttSequences.rr

  useEffect(() => {
    let timer
    if (isPlayingOs) {
      timer = setInterval(() => {
        setOsStep((prev) => {
          if (prev >= currentGantt.length - 1) {
            setIsPlayingOs(false)
            return prev
          }
          return prev + 1
        })
      }, 700)
    }
    return () => clearInterval(timer)
  }, [isPlayingOs, currentGantt.length])

  // ================= 2. Packet Tracer State =================
  const [packetHop, setPacketHop] = useState(0)
  const [packetLog, setPacketLog] = useState([])
  const [isSendingPacket, setIsSendingPacket] = useState(false)

  const routers = [
    { id: 0, name: 'Client Node (192.168.1.10)', type: 'Host' },
    { id: 1, name: 'Edge Router (10.0.1.1)', type: 'Router' },
    { id: 2, name: 'Core ISP Backbone (172.16.4.1)', type: 'Gateway' },
    { id: 3, name: 'Destination Server (203.0.113.80)', type: 'Server' }
  ]

  const sendPacket = () => {
    setIsSendingPacket(true)
    setPacketHop(0)
    setPacketLog([{ time: '0ms', text: 'SYN packet generated on eth0, TTL=64' }])

    const hops = [
      { hop: 1, time: '14ms', text: 'Routed via Edge Switch (10.0.1.1) • ARP cache resolved' },
      { hop: 2, time: '38ms', text: 'BGP path chosen: AS64512 -> AS64513 • MTU 1500' },
      { hop: 3, time: '52ms', text: 'Delivered to TCP port 443 • SYN-ACK received!' }
    ]

    hops.forEach((h, index) => {
      setTimeout(() => {
        setPacketHop(h.hop)
        setPacketLog((prev) => [...prev, { time: h.time, text: h.text }])
        if (index === hops.length - 1) setIsSendingPacket(false)
      }, (index + 1) * 900)
    })
  }

  // ================= 3. Distributed Consensus (Raft) =================
  const [raftNodes, setRaftNodes] = useState([
    { id: 1, role: 'Leader', term: 4, logs: ['SET x=10', 'SET y=20', 'APPEND log_3'], ping: 12 },
    { id: 2, role: 'Follower', term: 4, logs: ['SET x=10', 'SET y=20', 'APPEND log_3'], ping: 24 },
    { id: 3, role: 'Follower', term: 4, logs: ['SET x=10', 'SET y=20', 'APPEND log_3'], ping: 31 }
  ])
  const [raftStatusMsg, setRaftStatusMsg] = useState('Cluster healthy • Node 1 emitting 50ms heartbeats')

  const triggerElection = () => {
    setRaftStatusMsg('Simulating Leader Network Partition on Node 1...')
    setRaftNodes([
      { id: 1, role: 'Isolated (Offline)', term: 4, logs: ['SET x=10', 'SET y=20'], ping: 0 },
      { id: 2, role: 'Candidate -> Leader', term: 5, logs: ['SET x=10', 'SET y=20', 'NEW TERM 5'], ping: 18 },
      { id: 3, role: 'Follower (Voted Node 2)', term: 5, logs: ['SET x=10', 'SET y=20', 'NEW TERM 5'], ping: 29 }
    ])

    setTimeout(() => {
      setRaftStatusMsg('Quorum reached! Node 2 elected as new Term 5 Leader with majority 2/3 votes.')
    }, 1800)
  }

  const appendRaftLog = () => {
    const newEntry = `TX_${Math.floor(Math.random() * 9000 + 1000)}`
    setRaftNodes((prev) =>
      prev.map((n) => ({
        ...n,
        logs: n.role.includes('Isolated') ? n.logs : [...n.logs, newEntry]
      }))
    )
    setRaftStatusMsg(`Replicating entry "${newEntry}" across cluster consensus quorum...`)
  }

  // ================= 4. Virtual Memory & Paging =================
  const [pageFrames, setPageFrames] = useState(['Page 2', 'Page 0', 'Page 1', 'Page 7'])
  const [tlbHits, setTlbHits] = useState(14)
  const [pageFaults, setPageFaults] = useState(3)
  const [memAccessLog, setMemAccessLog] = useState('Ready for virtual address translation.')

  const accessPage = (pageNum) => {
    const pageStr = `Page ${pageNum}`
    if (pageFrames.includes(pageStr)) {
      setTlbHits((h) => h + 1)
      setMemAccessLog(`TLB HIT! Virtual Address translated: ${pageStr} present in Frame ${pageFrames.indexOf(pageStr)}.`)
    } else {
      setPageFaults((f) => f + 1)
      const newFrames = [...pageFrames.slice(1), pageStr]
      setPageFrames(newFrames)
      setMemAccessLog(`PAGE FAULT! Evicted ${pageFrames[0]} -> Loaded ${pageStr} into Frame 3.`)
    }
  }

  // ================= 5. Multi-Device Mesh =================
  const [pairedDevices, setPairedDevices] = useState([
    { name: 'MacBook Pro (Host Node)', ip: '192.168.1.104', status: 'Connected', latency: '2ms' },
    { name: 'iPhone 15 Pro (Client A)', ip: '192.168.1.118', status: 'Synchronized', latency: '8ms' },
    { name: 'iPad Air (Observer Node)', ip: '192.168.1.142', status: 'Synchronized', latency: '12ms' }
  ])
  const [broadcastCount, setBroadcastCount] = useState(128)

  const broadcastState = () => {
    setBroadcastCount((c) => c + 1)
    setPairedDevices((prev) =>
      prev.map((d) => ({
        ...d,
        latency: `${Math.floor(Math.random() * 8 + 2)}ms`
      }))
    )
  }

  const currentSortStep = sortStepsData[sortStep] || sortStepsData[0]

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-badge">
              <Zap size={14} color="#00ff66" />
              <span>Interactive Experiment Laboratory</span>
            </div>
            <h2>Netrium Algorithm & Systems Engine</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Facility Tab Selector */}
        <div className="modal-tab-bar">
          <button 
            className={`modal-tab ${activeTab.includes('dsa') ? 'active' : ''}`}
            onClick={() => setActiveTab('dsa-algo')}
          >
            <Binary size={16} />
            <span>DSA & Algorithms</span>
          </button>
          <button 
            className={`modal-tab ${activeTab.includes('os') ? 'active' : ''}`}
            onClick={() => setActiveTab('os-kernel')}
          >
            <Cpu size={16} />
            <span>OS Scheduling</span>
          </button>
          <button 
            className={`modal-tab ${activeTab.includes('packet') || activeTab.includes('net') ? 'active' : ''}`}
            onClick={() => setActiveTab('packet-trace')}
          >
            <Network size={16} />
            <span>Packet Tracer</span>
          </button>
          <button 
            className={`modal-tab ${activeTab.includes('dist') || activeTab.includes('raft') ? 'active' : ''}`}
            onClick={() => setActiveTab('dist-consensus')}
          >
            <Server size={16} />
            <span>Raft Consensus</span>
          </button>
          <button 
            className={`modal-tab ${activeTab.includes('mesh') || activeTab.includes('multi') ? 'active' : ''}`}
            onClick={() => setActiveTab('multi-mesh')}
          >
            <Smartphone size={16} />
            <span>Multi-Device Mesh</span>
          </button>
          <button 
            className={`modal-tab ${activeTab.includes('virt') || activeTab.includes('mem') ? 'active' : ''}`}
            onClick={() => setActiveTab('virt-memory')}
          >
            <Layers size={16} />
            <span>Virtual Memory</span>
          </button>
        </div>

        {/* Modal Dynamic Body */}
        <div className="modal-body">
          {/* TAB 0: Data Structures & Algorithms */}
          {activeTab.includes('dsa') && (
            <div className="sim-panel">
              <div className="sim-top-bar">
                <div className="sim-controls">
                  <label>DSA Visualizer:</label>
                  <div className="algo-btn-group">
                    <button 
                      className={`algo-btn ${dsaAlgorithm === 'bubble' ? 'active' : ''}`} 
                      onClick={() => { setDsaAlgorithm('bubble'); setSortStep(0); setIsPlayingDsa(false); }}
                    >
                      Bubble / Quick Sort
                    </button>
                    <button 
                      className={`algo-btn ${dsaAlgorithm === 'bst' ? 'active' : ''}`} 
                      onClick={() => { setDsaAlgorithm('bst'); setSortStep(0); setIsPlayingDsa(false); }}
                    >
                      Binary Search Tree
                    </button>
                  </div>
                </div>
                <div className="sim-action-buttons">
                  <button 
                    className="sim-play-btn"
                    onClick={() => setIsPlayingDsa(!isPlayingDsa)}
                  >
                    <Play size={14} />
                    <span>{isPlayingDsa ? 'Pause' : 'Run Visualizer'}</span>
                  </button>
                  <button 
                    className="sim-reset-btn"
                    onClick={() => { setSortStep(0); setIsPlayingDsa(false); }}
                    title="Reset simulation"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>

              {/* Sorting Bar Visualizer */}
              <div className="gantt-chart-container">
                <div className="gantt-title">Array Sorting & Comparison Steps</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: '140px', gap: '12px', padding: '16px 0' }}>
                  {currentSortStep.bars.map((val, idx) => {
                    const isComparing = currentSortStep.active.includes(idx)
                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <span style={{ fontSize: '11px', color: isComparing ? '#00ff66' : '#94a3b8', fontWeight: 'bold', marginBottom: '4px' }}>
                          {val}
                        </span>
                        <div 
                          style={{ 
                            width: '100%', 
                            height: `${val * 1.1}px`, 
                            backgroundColor: isComparing ? '#00ff66' : 'rgba(255, 255, 255, 0.15)',
                            borderRadius: '4px 4px 0 0',
                            transition: 'all 0.3s ease',
                            border: isComparing ? '1px solid #00ff66' : '1px solid rgba(255, 255, 255, 0.1)'
                          }} 
                        />
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="mem-status-message">
                <code>&gt; Step {sortStep + 1}/{sortStepsData.length}: {currentSortStep.msg}</code>
              </div>
            </div>
          )}

          {/* TAB 1: OS Kernel CPU Scheduling */}
          {activeTab.includes('os') && (
            <div className="sim-panel">
              <div className="sim-top-bar">
                <div className="sim-controls">
                  <label>Algorithm:</label>
                  <div className="algo-btn-group">
                    <button 
                      className={`algo-btn ${osAlgorithm === 'rr' ? 'active' : ''}`} 
                      onClick={() => { setOsAlgorithm('rr'); setOsStep(0); setIsPlayingOs(false); }}
                    >
                      Round Robin (Q=2)
                    </button>
                    <button 
                      className={`algo-btn ${osAlgorithm === 'fcfs' ? 'active' : ''}`} 
                      onClick={() => { setOsAlgorithm('fcfs'); setOsStep(0); setIsPlayingOs(false); }}
                    >
                      FCFS
                    </button>
                    <button 
                      className={`algo-btn ${osAlgorithm === 'sjf' ? 'active' : ''}`} 
                      onClick={() => { setOsAlgorithm('sjf'); setOsStep(0); setIsPlayingOs(false); }}
                    >
                      SJF (Shortest First)
                    </button>
                  </div>
                </div>
                <div className="sim-action-buttons">
                  <button 
                    className="sim-play-btn"
                    onClick={() => setIsPlayingOs(!isPlayingOs)}
                  >
                    <Play size={14} />
                    <span>{isPlayingOs ? 'Pause' : 'Run Timeline'}</span>
                  </button>
                  <button 
                    className="sim-reset-btn"
                    onClick={() => { setOsStep(0); setIsPlayingOs(false); }}
                    title="Reset simulation"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>

              {/* Ready Queue & Processes */}
              <div className="processes-status-row">
                {processes.map((p) => (
                  <div key={p.id} className="process-card">
                    <div className="proc-header">
                      <span className="proc-id" style={{ color: p.color }}>{p.id}</span>
                      <span className="proc-burst">Burst: {p.burst}ms</span>
                    </div>
                    <div className="proc-status">
                      {currentGantt[osStep] === p.id ? (
                        <span className="status-running">● CPU RUNNING</span>
                      ) : (
                        <span className="status-ready">Ready Queue</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Dynamic Gantt Chart Timeline */}
              <div className="gantt-chart-container">
                <div className="gantt-title">CPU Execution Timeline (Gantt Chart)</div>
                <div className="gantt-slots">
                  {currentGantt.slice(0, osStep + 1).map((pId, idx) => {
                    const proc = processes.find((p) => p.id === pId)
                    return (
                      <div 
                        key={idx} 
                        className="gantt-block"
                        style={{ backgroundColor: `${proc?.color || '#00ff66'}33`, borderColor: proc?.color }}
                      >
                        <span className="gantt-pid" style={{ color: proc?.color }}>{pId}</span>
                        <span className="gantt-time">{idx * 2}ms</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Packet Route Tracer */}
          {(activeTab.includes('packet') || activeTab.includes('net')) && (
            <div className="sim-panel">
              <div className="sim-top-bar">
                <p className="sim-tagline">Simulate TCP/IP 3-Way Handshake & BGP Hop Latencies</p>
                <button 
                  className="sim-play-btn"
                  onClick={sendPacket}
                  disabled={isSendingPacket}
                >
                  <Play size={14} />
                  <span>{isSendingPacket ? 'Transmitting Packet...' : 'Send Test Packet'}</span>
                </button>
              </div>

              {/* Topology Nodes */}
              <div className="packet-topology">
                {routers.map((r, idx) => (
                  <div key={r.id} className="topo-node-wrapper">
                    <div className={`topo-node ${packetHop === idx ? 'active-hop' : ''}`}>
                      <div className="node-icon-box">
                        <Network size={20} color={packetHop === idx ? '#00ff66' : '#94a3b8'} />
                      </div>
                      <div className="node-name">{r.name}</div>
                      <div className="node-role-badge">{r.type}</div>
                    </div>
                    {idx < routers.length - 1 && (
                      <div className={`topo-link ${packetHop > idx ? 'link-active' : ''}`}>
                        <ArrowRight size={18} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Packet Log Terminal */}
              <div className="packet-terminal">
                <div className="term-header">
                  <span>PACKET INSPECTION LOG</span>
                  <span>MTU: 1500 BYTES</span>
                </div>
                <div className="term-body">
                  {packetLog.map((log, i) => (
                    <div key={i} className="term-line">
                      <span className="term-time">[{log.time}]</span>
                      <span className="term-text">{log.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Raft Consensus */}
          {(activeTab.includes('dist') || activeTab.includes('raft')) && (
            <div className="sim-panel">
              <div className="sim-top-bar">
                <div className="sim-status-banner">
                  <span className="status-dot-green"></span>
                  <span>{raftStatusMsg}</span>
                </div>
                <div className="sim-action-buttons">
                  <button className="sim-btn-outline" onClick={triggerElection}>
                    <AlertTriangle size={14} />
                    <span>Partition Leader</span>
                  </button>
                  <button className="sim-play-btn" onClick={appendRaftLog}>
                    <Play size={14} />
                    <span>Append Raft Log</span>
                  </button>
                </div>
              </div>

              {/* 3 Node Cluster */}
              <div className="raft-nodes-grid">
                {raftNodes.map((node) => (
                  <div key={node.id} className={`raft-card ${node.role.includes('Leader') ? 'is-leader' : ''}`}>
                    <div className="raft-card-top">
                      <span className="node-title">Node {node.id}</span>
                      <span className={`role-pill ${node.role.includes('Leader') ? 'role-leader' : 'role-follower'}`}>
                        {node.role}
                      </span>
                    </div>
                    <div className="raft-meta">
                      <span>Term: {node.term}</span>
                      <span>Heartbeat: {node.ping > 0 ? `${node.ping}ms` : 'OFFLINE'}</span>
                    </div>
                    <div className="raft-logs-box">
                      <div className="logs-header">Replicated Log Entries:</div>
                      {node.logs.map((lg, i) => (
                        <div key={i} className="log-item">
                          <span>idx {i}:</span> <code>{lg}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Multi-Device Mesh */}
          {(activeTab.includes('mesh') || activeTab.includes('multi')) && (
            <div className="sim-panel">
              <div className="sim-top-bar">
                <p className="sim-tagline">Real-time WebSocket Synchronization Cluster ({pairedDevices.length} Connected)</p>
                <button className="sim-play-btn" onClick={broadcastState}>
                  <Zap size={14} />
                  <span>Broadcast Sync Ping</span>
                </button>
              </div>

              <div className="mesh-devices-list">
                {pairedDevices.map((d, i) => (
                  <div key={i} className="mesh-device-item">
                    <div className="mesh-device-left">
                      <div className="device-avatar">
                        <Smartphone size={18} />
                      </div>
                      <div>
                        <h4>{d.name}</h4>
                        <span className="device-ip">{d.ip}</span>
                      </div>
                    </div>
                    <div className="mesh-device-right">
                      <span className="latency-badge">{d.latency}</span>
                      <span className="status-synced">
                        <CheckCircle2 size={14} color="#00ff66" />
                        {d.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mesh-footer-info">
                <span>Total State Sync Packets: <strong>{broadcastCount}</strong></span>
                <span>Transport: <strong>WebSocket + WebRTC DataChannel</strong></span>
              </div>
            </div>
          )}

          {/* TAB 5: Virtual Memory & Paging */}
          {(activeTab.includes('virt') || activeTab.includes('mem')) && (
            <div className="sim-panel">
              <div className="sim-top-bar">
                <div className="sim-stats-inline">
                  <span className="stat-pill">TLB Hits: <strong>{tlbHits}</strong></span>
                  <span className="stat-pill">Page Faults: <strong>{pageFaults}</strong></span>
                </div>
                <div className="access-buttons-row">
                  <label>Access Page:</label>
                  {[0, 1, 2, 3, 4, 5, 7].map((num) => (
                    <button 
                      key={num} 
                      className="page-access-btn"
                      onClick={() => accessPage(num)}
                    >
                      P{num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mem-frames-grid">
                {pageFrames.map((pg, frameIdx) => (
                  <div key={frameIdx} className="frame-card">
                    <div className="frame-number">Physical Frame {frameIdx}</div>
                    <div className="frame-content">{pg}</div>
                    <div className="frame-validity">Valid Bit: 1</div>
                  </div>
                ))}
              </div>

              <div className="mem-status-message">
                <code>&gt; {memAccessLog}</code>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
