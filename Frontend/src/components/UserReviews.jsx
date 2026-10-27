import { useState, useEffect } from 'react'
import { MessageSquareQuote, X } from 'lucide-react'

export default function UserReviews() {
  const [isDismissed, setIsDismissed] = useState(false)
  const [reviews, setReviews] = useState([
    {
      firstName: 'Aarav',
      review: "Netrium's Raft consensus visualizer finally made distributed state machines click for our entire research group.",
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
  ])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [progressKey, setProgressKey] = useState(0)

  // Fetch reviews from MongoDB database
  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
    fetch(`${backendUrl}/api/reviews`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
          const dbReviews = data.reviews.map(r => ({
            id: r._id,
            firstName: r.name ? r.name.trim().split(' ')[0] : 'Researcher',
            review: r.comment,
            role: r.role || 'Systems Researcher'
          }))
          setReviews(dbReviews)
        }
      })
      .catch(err => console.warn('[UserReviews] Failed to load from database, using cached:', err))

    // Real-time listener when a user submits a review in CommunityReviews
    const handleNewReview = (e) => {
      const newRev = e.detail
      if (newRev) {
        setReviews(prev => [
          {
            id: newRev._id || `user-${Date.now()}`,
            firstName: newRev.name ? newRev.name.trim().split(' ')[0] : 'Researcher',
            review: newRev.comment,
            role: newRev.role || 'Systems Researcher'
          },
          ...prev
        ])
        setCurrentIndex(0)
        setProgressKey(k => k + 1)
      }
    }

    window.addEventListener('netrium:review-added', handleNewReview)
    return () => window.removeEventListener('netrium:review-added', handleNewReview)
  }, [])

  // Auto-switch review every 5 seconds (5000ms)
  useEffect(() => {
    if (isPaused || reviews.length === 0) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length)
      setProgressKey((k) => k + 1)
    }, 5000)

    return () => clearInterval(interval)
  }, [isPaused, reviews.length])

  if (isDismissed) {
    return <div className="reviews-ghost-space" />
  }

  const currentReview = reviews[currentIndex] || reviews[0] || { firstName: 'Researcher', role: 'Systems Engineer', review: '' }
  const displayDots = reviews.slice(0, Math.min(8, reviews.length))

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
          {/* Progress Indicators for Reviews */}
          <div className="review-dots">
            {displayDots.map((_, idx) => (
              <button
                key={idx}
                className={`review-dot ${idx === (currentIndex % displayDots.length) ? 'active' : ''}`}
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
