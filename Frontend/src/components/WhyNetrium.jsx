import { useState } from 'react'
import { ArrowRight, X } from 'lucide-react'
import { GithubIcon, LinkedinIcon, TwitterIcon, DiscordIcon } from './SocialIcons'

export default function WhyNetrium({ onLearnMore }) {
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) {
    return <div className="why-netrium-ghost-space" />
  }

  return (
    <div className="why-netrium-wrapper">
      {/* Frosted Glass Info Card */}
      <div className="why-netrium-card">
        <button 
          type="button" 
          className="hero-card-dismiss-cross-btn"
          onClick={() => setIsDismissed(true)}
          title="Dismiss card temporarily"
          aria-label="Dismiss Why Netrium card"
        >
          <X size={11} />
        </button>
        <h3 className="why-netrium-title">Why Netrium?</h3>
        <p className="why-netrium-desc">
          A real-time interactive laboratory for understanding Operating Systems, Computer Networks, and Distributed Systems through algorithm visualization and multi-device experimentation.
        </p>
        <button 
          className="why-netrium-link" 
          onClick={onLearnMore}
          aria-label="Learn more about Netrium architecture"
        >
          <span>Explore architecture</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Social / Community Icons on Right Column */}
      <div className="social-column">
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="social-btn" 
          aria-label="GitHub Repository"
          title="GitHub Repository"
        >
          <GithubIcon size={16} />
        </a>
        <a 
          href="https://discord.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="social-btn" 
          aria-label="Discord Community"
          title="Discord Community"
        >
          <DiscordIcon size={16} />
        </a>
        <a 
          href="https://linkedin.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="social-btn" 
          aria-label="LinkedIn Profile"
          title="LinkedIn Profile"
        >
          <LinkedinIcon size={16} />
        </a>
        <a 
          href="https://x.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="social-btn" 
          aria-label="X Twitter Feed"
          title="X / Twitter"
        >
          <TwitterIcon size={15} />
        </a>
      </div>
    </div>
  )
}
