import PixelSwap from './PixelSwap'
import Dismissible from './Dismissible'
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
          <Dismissible inline as="div">
            <a href="#" className="footer-logo-link" aria-label="Netrium Home">
              <img
                src={isSwapped ? lightLogo : darkLogo}
                alt="Netrium Logo"
                className="footer-logo-img"
              />
            </a>
          </Dismissible>

          <Dismissible as="div">
            <p className={`footer-desc ${isSwapped ? 'blue-sub' : ''}`}>
              A real-time interactive laboratory for understanding Operating Systems, Computer Networks, and Distributed Systems through algorithm visualization and multi-device experimentation.
            </p>
          </Dismissible>
        </div>

        {/* Middle Column: Home & Facilities Links */}
        <div className="footer-links-col">
          <Dismissible as="h4" className={`footer-col-title ${isSwapped ? 'blue-text' : ''}`}>
            Home & Facilities
          </Dismissible>
          <ul className="footer-links-list">
            <li>
              <Dismissible inline as="div">
                <button className={`footer-link-btn ${isSwapped ? 'blue-link' : ''}`} onClick={() => onOpenFacility && onOpenFacility('dsa-algo')}>
                  Data Structures & Algorithms
                </button>
              </Dismissible>
            </li>
            <li>
              <Dismissible inline as="div">
                <button className={`footer-link-btn ${isSwapped ? 'blue-link' : ''}`} onClick={() => onOpenFacility && onOpenFacility('packet-trace')}>
                  Content Delivery Network
                </button>
              </Dismissible>
            </li>
            <li>
              <Dismissible inline as="div">
                <button className={`footer-link-btn ${isSwapped ? 'blue-link' : ''}`} onClick={() => onOpenFacility && onOpenFacility('multi-mesh')}>
                  Network Topologies
                </button>
              </Dismissible>
            </li>
            <li>
              <Dismissible inline as="div">
                <button className={`footer-link-btn ${isSwapped ? 'blue-link' : ''}`} onClick={() => onOpenFacility && onOpenFacility('virt-memory')}>
                  Page Replacement Algo
                </button>
              </Dismissible>
            </li>
            <li>
              <Dismissible inline as="div">
                <button className={`footer-link-btn ${isSwapped ? 'blue-link' : ''}`} onClick={() => onOpenFacility && onOpenFacility('os-kernel')}>
                  Routing Algo
                </button>
              </Dismissible>
            </li>
          </ul>
        </div>

        {/* Right Column: Social Links */}
        <div className="footer-links-col">
          <Dismissible as="h4" className={`footer-col-title ${isSwapped ? 'blue-text' : ''}`}>
            Connect & Socials
          </Dismissible>
          <ul className="footer-links-list">
            <li>
              <Dismissible inline as="div">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className={`footer-link-a ${isSwapped ? 'blue-link' : ''}`}>
                  GitHub Repository
                </a>
              </Dismissible>
            </li>
            <li>
              <Dismissible inline as="div">
                <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className={`footer-link-a ${isSwapped ? 'blue-link' : ''}`}>
                  Discord Community
                </a>
              </Dismissible>
            </li>
            <li>
              <Dismissible inline as="div">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={`footer-link-a ${isSwapped ? 'blue-link' : ''}`}>
                  LinkedIn Network
                </a>
              </Dismissible>
            </li>
            <li>
              <Dismissible inline as="div">
                <a href="https://x.com" target="_blank" rel="noopener noreferrer" className={`footer-link-a ${isSwapped ? 'blue-link' : ''}`}>
                  X (Twitter)
                </a>
              </Dismissible>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar & Copyright Line */}
      <div className={`footer-bottom-bar ${isSwapped ? 'blue-border' : ''}`}>
        <Dismissible inline as="span" className={isSwapped ? 'blue-sub' : ''}>
          © 2026 Netrium.site ,  All rights reserved.
        </Dismissible>
        <Dismissible inline as="span" className={`footer-credits ${isSwapped ? 'blue-sub' : ''}`}>
          Powered by React + OGL + GSAP + React Bits
        </Dismissible>
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
