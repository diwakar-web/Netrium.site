import { useState, useEffect } from 'react'
import { MessageSquareQuote, X } from 'lucide-react'

export default function UserReviews() {
  const [isDismissed, setIsDismissed] = useState(false)
  const reviews = [
    {
      firstName: 'Aarav',
      review: 'Netrium\'s Raft consensus visualizer finally made distributed state machines click for our entire research group.',
      role: 'Systems Researcher'
    },
    {
      firstName: 'Elena',
      review: 'Testing multi-device packet drops across my phone and laptop in real-time feels like pure magic.',
      role: 'Network Engineer'
    },
    {
      firstName: 'Marcus',
      role: 'CS Professor',
      review: 'The OS scheduling timeline and CPU core visualizer is hands down the best computer systems teaching tool.'
    },
    {
      firstName: 'Sophia',
      role: 'Distributed Systems Dev',
      review: 'Simulating BGP routing anomalies across virtual clusters saved me weeks of manual debugging.'
    },
    {
      firstName: 'Dev',
      role: 'Kernel Enthusiast',
      review: 'From virtual memory paging to mesh networks, Netrium turns abstract CS theory into pure intuition.'
    }
  ]

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [progressKey, setProgressKey] = useState(0)

  // Auto-switch review every 5 seconds (5000ms)
  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length)
      setProgressKey((k) => k + 1)
    }, 5000)

    return () => clearInterval(interval)
  }, [isPaused, reviews.length])

  if (isDismissed) {
    return <div className="reviews-ghost-space" />
  }

  const currentReview = reviews[currentIndex]

  return (
    <div 
      className="reviews-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <button 
        type="button" 
        className="hero-card-dismiss-cross-btn"
        onClick={() => setIsDismissed(true)}
        title="Dismiss card temporarily"
        aria-label="Dismiss user reviews card"
      >
        <X size={11} />
      </button>
      {/* Review Box: First Name + Review in quotation marks, changing every 5s */}
      <div className="review-box" key={currentIndex}>
        <div className="review-header">
          <div className="review-author-info">
            <MessageSquareQuote size={15} className="review-quote-icon" />
            <span className="review-author-name">{currentReview.firstName}</span>
            <span className="review-author-badge">{currentReview.role}</span>
          </div>
          {/* Progress Indicators for 5 Reviews */}
          <div className="review-dots">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                className={`review-dot ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => {
                  setCurrentIndex(idx)
                  setProgressKey((k) => k + 1)
                }}
                aria-label={`Jump to review ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <p className="review-text">
          &ldquo;{currentReview.review}&rdquo;
        </p>

        {/* 5-Second Countdown Progress Bar */}
        <div className="review-timer-bar-track">
          <div 
            key={progressKey} 
            className={`review-timer-bar ${isPaused ? 'paused' : ''}`}
          />
        </div>
      </div>
    </div>
  )
}
