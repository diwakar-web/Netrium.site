import { User as UserIcon } from 'lucide-react'
import StaggeredMenu from './StaggeredMenu'
import darkLogo from '../assets/DarkLogo.png'

export default function Navbar({ onOpenAuth, onOpenFacility }) {
  const staggeredMenuItems = [
    { label: 'Data Structures & Algorithms', ariaLabel: 'Data Structures and Algorithms Visualizer', link: '#dsa', facilityId: 'dsa-algo' },
    { label: 'Content Delivery Network', ariaLabel: 'Content Delivery Network Lab', link: '#cdn', facilityId: 'packet-trace' },
    { label: 'Network Topologies', ariaLabel: 'Network Topologies Visualizer', link: '#topologies', facilityId: 'multi-mesh' },
    { label: 'Page Replacement Algo', ariaLabel: 'Page Replacement Algorithms', link: '#paging', facilityId: 'virt-memory' },
    { label: 'Routing Algo', ariaLabel: 'Routing Algorithms Simulator', link: '#routing', facilityId: 'os-kernel' }
  ]

  const socialItems = [
    { label: 'GitHub', link: 'https://github.com' },
    { label: 'Discord', link: 'https://discord.com' },
    { label: 'LinkedIn', link: 'https://linkedin.com' },
    { label: 'X (Twitter)', link: 'https://x.com' }
  ]

  return (
    <header className="netrium-navbar">
      {/* Top Left: Dark Logo Image from Assets */}
      <div className="navbar-left">
        <a href="#" className="navbar-logo-link" aria-label="Netrium Home">
          <img src={darkLogo} alt="Netrium Logo" className="navbar-logo-img" />
        </a>
      </div>

      {/* Right side: ONLY 2 Buttons (Staggered Menu & Account) */}
      <div className="navbar-right-actions">
        {/* Button 1: Staggered Menu anchored to the left of Account button */}
        <div className="staggered-menu-nav-container">
          <StaggeredMenu
            position="right"
            isFixed={false}
            items={staggeredMenuItems}
            socialItems={socialItems}
            displaySocials={true}
            displayItemNumbering={true}
            menuButtonColor="#ffffff"
            openMenuButtonColor="#00ff66"
            changeMenuColorOnOpen={true}
            colors={['#1e293b', '#0f172a', '#030712']}
            accentColor="#00ff66"
            onSelectItem={(facilityId) => {
              onOpenFacility && onOpenFacility(facilityId)
            }}
          />
        </div>

        {/* Button 2: Account */}
        <button 
          className="btn-nav-account"
          onClick={() => onOpenAuth('login')}
          aria-label="Open Account"
        >
          <UserIcon size={16} />
          <span>Account</span>
        </button>
      </div>
    </header>
  )
}
