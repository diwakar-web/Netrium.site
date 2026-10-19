import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import GradientWaves from './components/GradientWaves'
import Navbar from './components/Navbar'
import ExplorationRibbon from './components/ExplorationRibbon'
import ActiveNodes from './components/ActiveNodes'
import WhyNetrium from './components/WhyNetrium'
import HeroCenter from './components/HeroCenter'
import FacilitiesSection from './components/FacilitiesSection'
import UserReviews from './components/UserReviews'
import AboutNetrium from './components/AboutNetrium'
import WhatWeOffer from './components/WhatWeOffer'
import OurVision from './components/OurVision'
import CommunityReviews from './components/CommunityReviews'
import Footer from './components/Footer'
import FacilityModal from './components/FacilityModal'
import AuthPage from './pages/AuthPage'
import ProfilePage from './pages/ProfilePage'
import MyLabsPage from './pages/MyLabsPage'
import TopologiesPage from './pages/TopologiesPage'
import TopologyLabPage from './pages/TopologyLabPage'
import './App.css'

function LandingHome() {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeFacility, setActiveFacility] = useState(null)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    if (location.state?.profileSaved) {
      setToastMessage('Profile changes saved successfully! Your credentials have been updated in the database.')
      const timer = setTimeout(() => setToastMessage(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [location.state])

  const handleOpenFacility = (facilityId) => {
    setActiveFacility(facilityId)
  }

  const handleCloseFacility = () => {
    setActiveFacility(null)
  }

  const handleOpenAuth = (mode = 'login') => {
    navigate('/login', { state: { mode } })
  }

  return (
    <div className="netrium-page-wrapper">
      {/* Floating Success Toast on Profile Save */}
      {toastMessage && (
        <div className="netrium-floating-toast">
          <div className="toast-inner">
            <CheckCircle2 size={16} className="toast-icon" />
            <span>{toastMessage}</span>
          </div>
          <button type="button" className="toast-close-btn" onClick={() => setToastMessage('')} aria-label="Close notification">
            &times;
          </button>
        </div>
      )}
      {/* React Bits Raymarched GradientWaves Background */}
      <GradientWaves
        horizonColor="#000000ff"
        waveColor="#c6c6c6ff"
        crestColor="#ffffff"
        speed={0.4}
        amplitude={2.8}
        waveScale={0.6}
        waveRatio={0.9}
        swell={30}
        turbulence={18}
        tilt={1.11}
        zoom={1.0}
        height={5.0}
        fogDepth={22}
        detail="medium"
        brightness={1.2}
        opacity={0.95}
        mouseInteraction={true}
        parallaxStrength={0.5}
        grain={true}
        grainIntensity={0.04}
      />

      {/* FIXED TOP HEADER (Shows Login button redirecting to /login, or user dropdown with JWT option) */}
      <Navbar
        onOpenFacility={handleOpenFacility}
      />

      {/* HERO STAGE CONTAINER */}
      <main className="netrium-hero-stage">
        {/* MOVING EXPLORATION RIBBON */}
        <ExplorationRibbon />

        {/* UPPER GRID ROW: Active Nodes (Left) & Why Netrium (Right) */}
        <section className="hero-upper-row">
          <div className="upper-left-col">
            <ActiveNodes />
          </div>

          <div className="upper-right-col">
            <WhyNetrium onLearnMore={() => handleOpenFacility('os-kernel')} />
          </div>
        </section>

        {/* CENTERPIECE: Netrium Brand & Display Badges */}
        <section className="hero-center-row">
          <HeroCenter onLaunchQuickDemo={handleOpenFacility} />
        </section>

        {/* BOTTOM GRID ROW: 5 Facilities (Left) & User Reviews (Right) */}
        <section className="hero-bottom-row">
          <div className="bottom-left-col">
            <FacilitiesSection onSelectFacility={handleOpenFacility} activeFacilityId={activeFacility} />
          </div>

          <div className="bottom-right-col">
            <UserReviews onExploreFooter={() => handleOpenFacility('packet-trace')} />
          </div>
        </section>
      </main>

      {/* INTRO SECTION: "What Is NetRIUM?" */}
      <AboutNetrium />

      {/* OFFERINGS SECTION: "What We Offer" 12 Square Cards Grid */}
      <WhatWeOffer onOpenFacility={handleOpenFacility} />

      {/* OUR VISION SECTION: Scroll-expanding Interactive Reality Comparison */}
      <OurVision onOpenFacility={handleOpenFacility} />

      {/* COMMUNITY REVIEWS & LOGIN PERSUASION SECTION */}
      <CommunityReviews 
        onOpenAuth={handleOpenAuth} 
        onOpenFacility={handleOpenFacility} 
      />

      {/* COMPACT FOOTER */}
      <Footer onOpenFacility={handleOpenFacility} />

      {/* INTERACTIVE SIMULATION MODAL */}
      {activeFacility && (
        <FacilityModal
          facilityId={activeFacility}
          onClose={handleCloseFacility}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/signup" element={<AuthPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/my-labs" element={<MyLabsPage />} />
      <Route path="/topologies" element={<TopologiesPage />} />
      <Route path="/topologies/:topologyId" element={<TopologyLabPage />} />
      <Route path="*" element={<LandingHome />} />
    </Routes>
  )
}
