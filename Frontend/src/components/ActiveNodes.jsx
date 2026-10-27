import { useState, useEffect } from 'react'
import Dismissible from './Dismissible'
import avatar1 from '../assets/avatar1.jpg'
import avatar2 from '../assets/avatar2.jpg'
import avatar3 from '../assets/avatar3.jpg'
import avatar4 from '../assets/avatar4.jpg'

export default function ActiveNodes() {
  const [nodeCount, setNodeCount] = useState(() => {
    const cached = localStorage.getItem('netrium_lab_users_count')
    return cached ? parseInt(cached, 10) : 850
  })

  // Increment counter by 1 on every site loading via database API
  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
    fetch(`${backendUrl}/api/stats/visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && typeof data.count === 'number') {
          setNodeCount(data.count)
          localStorage.setItem('netrium_lab_users_count', String(data.count))
        }
      })
      .catch((err) => {
        console.warn('[ActiveNodes] Stat visit increment fallback:', err)
        setNodeCount((prev) => {
          const next = prev + 1
          localStorage.setItem('netrium_lab_users_count', String(next))
          return next
        })
      })
  }, [])

  return (
    <Dismissible 
      inline 
      as="div" 
      className="active-nodes-container" 
      title="Active real-time simulation nodes connected across universities and research labs"
    >
      {/* 4 Overlapping Avatars */}
      <div className="avatar-stack">
        <div className="avatar-item" style={{ zIndex: 4 }}>
          <img src={avatar1} alt="Researcher Avatar 1" />
          <span className="avatar-status-dot"></span>
        </div>
        <div className="avatar-item" style={{ zIndex: 3 }}>
          <img src={avatar2} alt="Engineer Avatar 2" />
        </div>
        <div className="avatar-item" style={{ zIndex: 2 }}>
          <img src={avatar3} alt="Student Avatar 3" />
        </div>
        <div className="avatar-item" style={{ zIndex: 1 }}>
          <img src={avatar4} alt="Professor Avatar 4" />
        </div>
      </div>

      {/* || Divider between pics and text */}
      <span className="avatar-divider">||</span>

      {/* Stats Text */}
      <div className="active-nodes-info">
        <div className="active-nodes-count">
          <span className="live-dot animate-pulse-live"></span>
          <strong>{nodeCount}</strong>
          <span>have used</span>
        </div>
        <p className="active-nodes-subtitle">our laboratory</p>
      </div>
    </Dismissible>
  )
}
