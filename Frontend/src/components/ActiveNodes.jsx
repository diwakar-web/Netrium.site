import Dismissible from './Dismissible'
import avatar1 from '../assets/avatar1.jpg'
import avatar2 from '../assets/avatar2.jpg'
import avatar3 from '../assets/avatar3.jpg'
import avatar4 from '../assets/avatar4.jpg'

export default function ActiveNodes() {
  return (
    <Dismissible 
      inline 
      as="div" 
      className="active-nodes-container" 
      title="Trusted by hundreds of users across universities and research labs"
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
          <strong>Trusted by</strong>
        </div>
        <p className="active-nodes-subtitle">hundreds of users</p>
      </div>
    </Dismissible>
  )
}

