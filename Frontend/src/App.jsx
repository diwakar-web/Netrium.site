import { useState } from 'react'
import Navbar from './components/Navbar'
import ExplorationRibbon from './components/ExplorationRibbon'
import ActiveNodes from './components/ActiveNodes'
import WhyNetrium from './components/WhyNetrium'
import HeroCenter from './components/HeroCenter'
import FacilitiesSection from './components/FacilitiesSection'
import UserReviews from './components/UserReviews'
import AboutNetrium from './components/AboutNetrium'
import FacilityModal from './components/FacilityModal'
import AuthModal from './components/AuthModal'
import GradientWaves from './components/GradientWaves'
import Footer from './components/Footer'
import './App.css'

function App() {
  const [selectedFacility, setSelectedFacility] = useState(null)
  const [authModalMode, setAuthModalMode] = useState(null)

  const handleOpenAuth = (mode) => {
    setAuthModalMode(mode)
  }

  const handleCloseAuth = () => {
    setAuthModalMode(null)
  }

  const handleOpenFacility = (facilityId) => {
    setSelectedFacility(facilityId)
  }

  const handleCloseFacility = () => {
    setSelectedFacility(null)
  }

  const scrollToFooter = () => {
    const footerEl = document.getElementById('netrium-footer')
    if (footerEl) {
      footerEl.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="netrium-page-wrapper">
      {/* React Bits Raymarched GradientWaves Background with Electric Neon Green, Pitch Black, Crisp White & Gray */}
      <GradientWaves
        horizonColor="#030712"
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

      {/* Main Hero Stage Container */}
      <main className="netrium-hero-stage">
        {/* TOP BAR: Logo Placeholder (Left) & ONLY 2 Buttons: Menu and Account (Right) */}
        <Navbar
          onOpenAuth={handleOpenAuth}
          onOpenFacility={handleOpenFacility}
        />

        {/* MOVING EXPLORATION RIBBON: Green Text on Pitch Black Background */}
        <ExplorationRibbon />

        {/* UPPER GRID ROW: Active Nodes (Left) & Why Netrium + Socials (Right) */}
        <section className="hero-upper-row">
          <div className="upper-left-col">
            <ActiveNodes />
          </div>

          <div className="upper-right-col">
            <WhyNetrium onLearnMore={() => handleOpenFacility('os-kernel')} />
          </div>
        </section>

        {/* CENTERPIECE: Netrium Brand, Bold Highlight Badges & 2-3 word subheading */}
        <section className="hero-center-row">
          <HeroCenter onLaunchQuickDemo={handleOpenFacility} />
        </section>

        {/* BOTTOM GRID ROW: 5 Facilities (Left) & 3-Second User Reviews + Launch CTA (Right) */}
        <section className="hero-bottom-row">
          <div className="bottom-left-col">
            <FacilitiesSection
              onSelectFacility={handleOpenFacility}
              activeFacilityId={selectedFacility}
            />
          </div>

          <div className="bottom-right-col">
            <UserReviews
              onLaunchLab={() => handleOpenFacility('os-kernel')}
            />
            {/* Quick Scroll Indicator to Footer */}
            <button className="btn-scroll-footer" onClick={scrollToFooter} aria-label="Scroll to footer">
              <span>Explore Footer Architecture</span>
              <span className="scroll-down-arrow">↓</span>
            </button>
          </div>
        </section>
      </main>

      {/* INTRO SECTION: What Is NetRIUM? (Black Background) */}
      <AboutNetrium onOpenFacility={handleOpenFacility} />

      {/* FOOTER SECTION: Directly rendered below intro section */}
      <Footer id="netrium-footer" onOpenFacility={handleOpenFacility} />

      {/* Live Interactive Facility Simulation Modal */}
      {selectedFacility && (
        <FacilityModal
          facilityId={selectedFacility}
          onClose={handleCloseFacility}
        />
      )}

      {/* Sign In / Sign Up Modal */}
      {authModalMode && (
        <AuthModal
          initialMode={authModalMode}
          onClose={handleCloseAuth}
        />
      )}
    </div>
  )
}

export default App
