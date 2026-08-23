import { useState } from 'react'
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
import Footer from './components/Footer'
import FacilityModal from './components/FacilityModal'
import AuthModal from './components/AuthModal'
import './App.css'

export default function App() {
  const [activeFacility, setActiveFacility] = useState(null)
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' })

  const handleOpenFacility = (facilityId) => {
    setActiveFacility(facilityId)
  }

  const handleCloseFacility = () => {
    setActiveFacility(null)
  }

  const handleOpenAuth = (mode = 'login') => {
    setAuthModal({ isOpen: true, mode })
  }

  const handleCloseAuth = () => {
    setAuthModal({ isOpen: false, mode: 'login' })
  }

  return (
    <div className="netrium-page-wrapper">
      {/* React Bits Raymarched GradientWaves Background */}
      <GradientWaves
        horizonColor="#000000ff"
        waveColor="#c6c6c6ff" //keep it like this only
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

      {/* EXACT 100VH HERO OUTER CONTAINER */}
      <div className="hero-stage-outer-wrapper">
        <Navbar
          onOpenAuth={handleOpenAuth}
          onOpenFacility={handleOpenFacility}
        />

        <ExplorationRibbon />

        <main className="netrium-hero-stage">
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
      </div>

      {/* INTRO SECTION: "What Is NetRIUM?" */}
      <AboutNetrium />

      {/* OFFERINGS SECTION: "What We Offer" 12 Square Cards Grid */}
      <WhatWeOffer onOpenFacility={handleOpenFacility} />

      {/* COMPACT FOOTER */}
      <Footer onOpenFacility={handleOpenFacility} />

      {/* INTERACTIVE SIMULATION MODAL */}
      {activeFacility && (
        <FacilityModal
          facilityId={activeFacility}
          onClose={handleCloseFacility}
        />
      )}

      {/* AUTHENTICATION MODAL */}
      {authModal.isOpen && (
        <AuthModal
          mode={authModal.mode}
          onClose={handleCloseAuth}
          onSwitchMode={(mode) => setAuthModal({ isOpen: true, mode })}
        />
      )}
    </div>
  )
}
