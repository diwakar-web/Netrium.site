import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, User as UserIcon, FlaskConical, LogOut, ChevronDown } from 'lucide-react';
import StaggeredMenu from './StaggeredMenu';
import Dismissible from './Dismissible';
import { useAuth } from '../context/AuthContext';
import darkLogo from '../assets/DarkLogo.png';
import './Navbar.css';

export default function Navbar({ onOpenFacility }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const staggeredMenuItems = [
    { label: 'Data Structures & Algorithms', ariaLabel: 'Data Structures and Algorithms Visualizer', link: '#dsa', facilityId: 'dsa-algo' },
    { label: 'Content Delivery Network', ariaLabel: 'Content Delivery Network Lab', link: '#cdn', facilityId: 'packet-trace' },
    { label: 'Network Topologies', ariaLabel: 'Network Topologies Visualizer', link: '#topologies', facilityId: 'multi-mesh' },
    { label: 'Page Replacement Algo', ariaLabel: 'Page Replacement Algorithms', link: '#paging', facilityId: 'virt-memory' },
    { label: 'Routing Algo', ariaLabel: 'Routing Algorithms Simulator', link: '#routing', facilityId: 'os-kernel' }
  ];

  const socialItems = [
    { label: 'GitHub', link: 'https://github.com' },
    { label: 'Discord', link: 'https://discord.com' },
    { label: 'LinkedIn', link: 'https://linkedin.com' },
    { label: 'X (Twitter)', link: 'https://x.com' }
  ];

  return (
    <>
      <header className="netrium-navbar">
        {/* Top Left: Dismissible Dark Logo Image */}
        <div className="navbar-left">
          <Dismissible inline as="div" className="navbar-logo-wrapper">
            <a 
              href="/" 
              onClick={(e) => {
                e.preventDefault();
                navigate('/');
              }} 
              className="navbar-logo-link" 
              aria-label="Netrium Home"
            >
              <img src={darkLogo} alt="Netrium Logo" className="navbar-logo-img" />
            </a>
          </Dismissible>
        </div>

        {/* Right side: Dismissible Menu & Login / User Buttons */}
        <div className="navbar-right-actions">
          <Dismissible inline as="div" className="staggered-menu-nav-container">
            <StaggeredMenu
              position="right"
              isFixed={false}
              items={staggeredMenuItems}
              socialItems={socialItems}
              displaySocials={true}
              displayItemNumbering={true}
              menuButtonColor="#ffffff"
              openMenuButtonColor="#00bf63"
              changeMenuColorOnOpen={true}
              colors={['#00bf63', '#022c22', '#000000']}
              accentColor="#00bf63"
              onSelectItem={(facilityId) => {
                if (facilityId === 'multi-mesh') {
                  navigate('/topologies');
                } else if (onOpenFacility) {
                  onOpenFacility(facilityId);
                }
              }}
            />
          </Dismissible>

          {/* Login Button (Visible when logged out) vs User Menu (Visible when logged in) */}
          <Dismissible inline as="div">
            {!isAuthenticated ? (
              <button 
                className="btn-nav-login"
                onClick={() => navigate('/login')}
                aria-label="Login to Netrium"
              >
                <LogIn size={15} />
                <span>Login</span>
              </button>
            ) : (
              <div className="nav-user-dropdown-container" ref={dropdownRef}>
                <button
                  className="btn-nav-user"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-label="Open User Menu"
                >
                  <div className="nav-user-avatar">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} />
                    ) : (
                      <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                    )}
                    <span className="online-indicator" />
                  </div>
                  <span className="nav-user-name">{user?.name ? user.name.split(' ')[0] : 'Researcher'}</span>
                  <ChevronDown size={14} className={`dropdown-chevron ${dropdownOpen ? 'open' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="nav-user-dropdown-menu">
                    <div className="dropdown-user-header">
                      <div className="dropdown-user-name">{user?.name || 'Researcher'}</div>
                      <div className="dropdown-user-email">{user?.email}</div>
                    </div>

                    <div className="dropdown-divider" />

                    <button
                      className="dropdown-menu-item profile-item"
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate('/profile');
                      }}
                    >
                      <UserIcon size={16} />
                      <span>My Profile</span>
                    </button>

                    <button
                      className="dropdown-menu-item labs-item"
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate('/my-labs');
                      }}
                    >
                      <FlaskConical size={16} />
                      <span>My Labs</span>
                    </button>

                    <button
                      className="dropdown-menu-item logout-item"
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </Dismissible>
        </div>
      </header>
    </>
  );
}
