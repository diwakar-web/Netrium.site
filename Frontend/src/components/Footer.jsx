import PixelSwap from './PixelSwap'
import darkLogo from '../assets/DarkLogo.png'
import lightLogo from '../assets/Light Logo.png'
import './Footer.css'

export default function Footer({ id, onOpenFacility }) {
  const renderFooterContent = (isSwapped = false) => (
    <div className={`footer-swap-container ${isSwapped ? 'banner-second' : 'banner-first'}`}>
      {/* Main Footer Grid Columns */}
      <div className="footer-main-grid">
        {/* Left Column: Brand Logo & Mission Statement */}
        <div className="footer-brand-col">
          <a href="#" className="footer-logo-link" aria-label="Netrium Home">
            {/* Default: DarkLogo, Swapped/Hover: LightLogo */}
            <img 
              src={isSwapped ? lightLogo : darkLogo} 
              alt="Netrium Logo" 
              className="footer-logo-img" 
            />
          </a>
          <p className={`footer-desc ${isSwapped ? 'blue-sub' : ''}`}>
            A real-time interactive laboratory for understanding Operating Systems, Computer Networks, and Distributed Systems through algorithm visualization and multi-device experimentation.
          </p>
        </div>

        {/* Middle Column: Home & Facilities Links */}
        <div className="footer-links-col">
          <h4 className={`footer-col-title ${isSwapped ? 'blue-text' : ''}`}>Home & Facilities</h4>
          <ul className="footer-links-list">
            <li>
              <button className={`footer-link-btn ${isSwapped ? 'blue-link' : ''}`} onClick={() => onOpenFacility && onOpenFacility('dsa-algo')}>
                Data Structures & Algorithms
              </button>
            </li>
            <li>
              <button className={`footer-link-btn ${isSwapped ? 'blue-link' : ''}`} onClick={() => onOpenFacility && onOpenFacility('packet-trace')}>
                Content Delivery Network
              </button>
            </li>
            <li>
              <button className={`footer-link-btn ${isSwapped ? 'blue-link' : ''}`} onClick={() => onOpenFacility && onOpenFacility('multi-mesh')}>
                Network Topologies
              </button>
            </li>
            <li>
              <button className={`footer-link-btn ${isSwapped ? 'blue-link' : ''}`} onClick={() => onOpenFacility && onOpenFacility('virt-memory')}>
                Page Replacement Algo
              </button>
            </li>
            <li>
              <button className={`footer-link-btn ${isSwapped ? 'blue-link' : ''}`} onClick={() => onOpenFacility && onOpenFacility('os-kernel')}>
                Routing Algo
              </button>
            </li>
          </ul>
        </div>

        {/* Right Column: Social Links */}
        <div className="footer-links-col">
          <h4 className={`footer-col-title ${isSwapped ? 'blue-text' : ''}`}>Connect & Socials</h4>
          <ul className="footer-links-list">
            <li>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className={`footer-link-a ${isSwapped ? 'blue-link' : ''}`}>
                GitHub Repository
              </a>
            </li>
            <li>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className={`footer-link-a ${isSwapped ? 'blue-link' : ''}`}>
                Discord Community
              </a>
            </li>
            <li>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={`footer-link-a ${isSwapped ? 'blue-link' : ''}`}>
                LinkedIn Network
              </a>
            </li>
            <li>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className={`footer-link-a ${isSwapped ? 'blue-link' : ''}`}>
                X (Twitter)
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar & Copyright Line */}
      <div className={`footer-bottom-bar ${isSwapped ? 'blue-border' : ''}`}>
        <span className={isSwapped ? 'blue-sub' : ''}>© 2026 Netrium.site — All rights reserved.</span>
        <span className={`footer-credits ${isSwapped ? 'blue-sub' : ''}`}>Powered by React + OGL + GSAP + React Bits</span>
      </div>
    </div>
  )

  return (
    <footer id={id || "netrium-footer"} className="netrium-footer-wrapper">
      <PixelSwap
        firstContent={renderFooterContent(false)}
        secondContent={renderFooterContent(true)}
        pixelSize={64}
        gap={0}
        pixelRadius={0}
        pixelSpin={0}
        pixelScale={0.35}
        duration={1400}
        pixelDuration={450}
        pattern="random"
        randomness={0}
        fade={true}
        trigger="hover"
        style={{ width: '100vw', minHeight: '270px' }}
      />
    </footer>
  )
}
