import { useState, useMemo } from 'react'
import { 
  Star, 
  CheckCircle2, 
  LogIn, 
  UserPlus, 
  ArrowRight, 
  ThumbsUp, 
  X, 
  Send, 
  Sparkles, 
  PenLine,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import './CommunityReviews.css'

export default function CommunityReviews({ onOpenAuth, onOpenFacility }) {
  const [isReviewBoxOpen, setIsReviewBoxOpen] = useState(false)
  const [userReviewsList, setUserReviewsList] = useState([])
  const [newReview, setNewReview] = useState({
    name: '',
    role: '',
    gender: 'male',
    rating: 5,
    tag: 'Operating Systems',
    comment: ''
  })
  const [hoverRating, setHoverRating] = useState(0)
  const [likedReviews, setLikedReviews] = useState({})
  const [submittedToast, setSubmittedToast] = useState(false)

  // Curated High-Signal Reviews
  const initialReviews = [
    {
      id: 'rev-1',
      name: 'Aarav Sharma',
      gender: 'male',
      role: 'CS Undergrad, IIT Bombay',
      rating: 5,
      tag: 'OS Kernel & Memory',
      comment: 'Testing TLB cache misses and multi-level page tables in real time made memory virtualization finally click for me.',
      likes: 24,
      verified: true
    },
    {
      id: 'rev-2',
      name: 'Elena Rostova',
      gender: 'female',
      role: 'Distributed Systems Student',
      rating: 5,
      tag: 'Raft Consensus',
      comment: 'Live split votes and log replication across partitioned nodes are so much clearer than static textbook slides.',
      likes: 31,
      verified: true
    },
    {
      id: 'rev-3',
      name: 'Marcus Vance',
      gender: 'male',
      role: 'Junior DevOps Engineer',
      rating: 5,
      tag: 'TCP & BGP Routing',
      comment: 'The 3-way handshake packet trace directly in the browser without any setup was super helpful for understanding congestion.',
      likes: 18,
      verified: true
    },
    {
      id: 'rev-4',
      name: 'Sophia Lin',
      gender: 'female',
      role: 'CS Major @ UC Berkeley',
      rating: 5,
      tag: 'Concurrency & Locks',
      comment: 'Seeing race conditions and deadlocks on live thread execution timelines makes concurrent programming much less intimidating.',
      likes: 29,
      verified: true
    },
    {
      id: 'rev-5',
      name: 'Devon Miller',
      gender: 'male',
      role: 'Software Developer',
      rating: 5,
      tag: 'Distributed Systems',
      comment: 'No Docker setup needed — opened the URL and experimented with quorum elections directly in the browser.',
      likes: 37,
      verified: true
    },
    {
      id: 'rev-6',
      name: 'Priya Nambiar',
      gender: 'female',
      role: 'Graduate Student, CMU',
      rating: 5,
      tag: 'Memory Virtualization',
      comment: 'Step-through execution for page fault swaps is a fantastic visual learning aid for low-level systems.',
      likes: 22,
      verified: true
    },
    {
      id: 'rev-7',
      name: 'Liam Gallagher',
      gender: 'male',
      role: 'Computer Engineering Student',
      rating: 5,
      tag: 'Computer Networks',
      comment: 'Dropping packets and seeing retransmission timers trigger live is exactly what dry network textbooks lack.',
      likes: 26,
      verified: true
    },
    {
      id: 'rev-8',
      name: 'Chloe Bennett',
      gender: 'female',
      role: 'CS Senior @ Waterloo',
      rating: 5,
      tag: 'Interview Prep',
      comment: 'Used this to review distributed consensus edge cases before systems interviews. Visual models are invaluable.',
      likes: 45,
      verified: true
    },
    {
      id: 'rev-9',
      name: 'Kaito Tanaka',
      gender: 'male',
      role: 'Systems Enthusiast, Tokyo',
      rating: 5,
      tag: 'CPU Scheduling',
      comment: 'Interactive Round Robin vs MLFQ comparisons make scheduling latency trade-offs immediately intuitive.',
      likes: 19,
      verified: true
    },
    {
      id: 'rev-10',
      name: 'Hannah Weber',
      gender: 'female',
      role: 'Junior Backend Developer',
      rating: 5,
      tag: 'Data Structures',
      comment: 'Live tree rebalancing and lock-free concurrent queues. Loving the visual-first approach to complex CS topics.',
      likes: 33,
      verified: true
    },
    {
      id: 'rev-11',
      name: 'Rohan Deshmukh',
      gender: 'male',
      role: 'Networks Lab Student',
      rating: 5,
      tag: 'BGP Routing',
      comment: 'Visualizing routing loops and convergence on topology graphs helped me ace my computer networks exam.',
      likes: 21,
      verified: true
    },
    {
      id: 'rev-12',
      name: 'Alexei Ivanov',
      gender: 'male',
      role: 'Open Source Contributor',
      rating: 5,
      tag: 'OS Kernel & IPC',
      comment: 'Clean, fast, and accessible browser simulation. Can’t wait for more facilities to be added!',
      likes: 38,
      verified: true
    }
  ]

  const handleLike = (id) => {
    setLikedReviews(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const handleSubmitReview = (e) => {
    e.preventDefault()
    if (!newReview.name.trim() || !newReview.comment.trim()) return

    const created = {
      id: `user-${Date.now()}`,
      name: newReview.name.trim(),
      role: newReview.role.trim() || 'Early Tester',
      gender: newReview.gender || 'male',
      rating: newReview.rating,
      tag: newReview.tag,
      comment: newReview.comment.trim(),
      likes: 1,
      verified: true,
      isNew: true
    }

    setUserReviewsList([created, ...userReviewsList])
    setNewReview({
      name: '',
      role: '',
      gender: 'male',
      rating: 5,
      tag: 'Operating Systems',
      comment: ''
    })
    setIsReviewBoxOpen(false)
    setSubmittedToast(true)
    setTimeout(() => setSubmittedToast(false), 4500)
  }

  // Unified single layer reviews stream
  const combinedReviews = useMemo(() => {
    return [...userReviewsList, ...initialReviews]
  }, [userReviewsList])

  return (
    <section className="community-reviews-section" id="community-reviews">
      <div className="community-reviews-container">
        
        {/* =================================================================
            1. UNIFIED HERO & CALL TO ACTION HEADER
            ================================================================= */}
        <div className="community-unified-hero">
          {/* Subtle Top Badge */}
          <div className="community-pill-badge">
            <span className="pill-dot"></span>
            <span>EARLY TESTER FEEDBACK & ACCESS</span>
          </div>

          <h2 className="community-hero-title">
            Step Inside the <span className="text-neon-gradient">Interactive Laboratory</span>
          </h2>

          <p className="community-hero-desc">
            Explore live, interactive simulations for Operating Systems, Networks, and Distributed Systems. Save custom topologies, trace execution paths, and share your early feedback.
          </p>

          {/* Login / Sign Up Action Buttons */}
          <div className="community-hero-actions">
            <button 
              className="btn-lab-primary"
              onClick={() => onOpenAuth && onOpenAuth('login')}
            >
              <LogIn size={15} />
              <span>Sign In to Laboratory</span>
              <ArrowRight size={14} className="btn-icon-arrow" />
            </button>

            <button 
              className="btn-lab-secondary"
              onClick={() => onOpenAuth && onOpenAuth('signup')}
            >
              <UserPlus size={15} />
              <span>Create Free Account</span>
            </button>
          </div>

          {/* ===============================================================
              REDESIGNED REVIEW BUTTON & INLINE EXPANDABLE BOX (UNDER BUTTON ONLY)
              =============================================================== */}
          <div className="community-review-action-area">
            <button 
              type="button"
              className={`btn-review-trigger ${isReviewBoxOpen ? 'active-open' : ''}`}
              onClick={() => setIsReviewBoxOpen(prev => !prev)}
              aria-expanded={isReviewBoxOpen}
              aria-controls="inline-review-box"
              id="write-review-btn"
            >
              <div className="review-trigger-left">
                <span className="review-trigger-icon-badge">
                  <PenLine size={15} />
                </span>
                <div className="review-trigger-texts">
                  <span className="review-trigger-main">
                    {isReviewBoxOpen ? 'Close Review Form' : 'Write a Simulation Review'}
                  </span>
                  <span className="review-trigger-sub">
                    Tested our tools? Share your feedback with the community
                  </span>
                </div>
              </div>

              <div className="review-trigger-right">
                <span className="review-trigger-pill">
                  {isReviewBoxOpen ? 'Close Box' : 'Write Review'}
                </span>
                <span className="review-trigger-chevron">
                  {isReviewBoxOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              </div>
            </button>

            {/* INLINE EXPANDABLE REVIEW BOX - Directly below the button */}
            <div 
              id="inline-review-box"
              className={`inline-review-drawer ${isReviewBoxOpen ? 'drawer-open' : ''}`}
              aria-hidden={!isReviewBoxOpen}
            >
              <div className="inline-review-box-inner">
                <div className="inline-review-card">
                  <div className="inline-review-header">
                    <div className="inline-review-title-group">
                      <div className="modal-badge">
                        <Sparkles size={13} />
                        <span>COMMUNITY VOICES</span>
                      </div>
                      <h3 className="inline-review-title">Share Your Experience</h3>
                      <p className="inline-review-subtitle">
                        Your review publishes instantly to the live community stream below.
                      </p>
                    </div>
                    <button 
                      type="button" 
                      className="inline-review-close-btn"
                      onClick={() => setIsReviewBoxOpen(false)}
                      aria-label="Close review form"
                      title="Close"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmitReview} className="inline-review-form">
                    {/* Star Rating Picker */}
                    <div className="form-group rating-group">
                      <label>Overall Experience</label>
                      <div className="star-picker">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            className={`star-btn ${star <= (hoverRating || newReview.rating) ? 'filled' : ''}`}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setNewReview({ ...newReview, rating: star })}
                            aria-label={`Rate ${star} stars`}
                          >
                            <Star size={20} />
                          </button>
                        ))}
                        <span className="rating-text">
                          {(hoverRating || newReview.rating) === 5 ? '5/5 Stars (Excellent)' : `${hoverRating || newReview.rating}/5 Stars`}
                        </span>
                      </div>
                    </div>

                    {/* Name & Role Fields */}
                    <div className="form-row-2">
                      <div className="form-group">
                        <label htmlFor="inline-rev-name">Your Name *</label>
                        <input
                          id="inline-rev-name"
                          type="text"
                          required
                          placeholder="e.g. Maya Chen"
                          value={newReview.name}
                          onChange={e => setNewReview({ ...newReview, name: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="inline-rev-role">Role / Institution</label>
                        <input
                          id="inline-rev-role"
                          type="text"
                          placeholder="e.g. CS Student @ MIT"
                          value={newReview.role}
                          onChange={e => setNewReview({ ...newReview, role: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Simulation Concept Tag */}
                    <div className="form-group">
                      <label htmlFor="inline-rev-tag">Tested Facility / Concept</label>
                      <select
                        id="inline-rev-tag"
                        value={newReview.tag}
                        onChange={e => setNewReview({ ...newReview, tag: e.target.value })}
                      >
                        <option value="Operating Systems">Operating Systems (Memory / Locks / Scheduling)</option>
                        <option value="Distributed Systems">Distributed Systems (Raft / Consensus / Partitioning)</option>
                        <option value="Computer Networks">Computer Networks (TCP Handshake / BGP Routing)</option>
                        <option value="Data Structures">Data Structures & Algorithm Core</option>
                        <option value="General Platform">General Laboratory Experience</option>
                      </select>
                    </div>

                    {/* Detailed Review Comment */}
                    <div className="form-group">
                      <label htmlFor="inline-rev-comment">Your Thoughts & Feedback *</label>
                      <textarea
                        id="inline-rev-comment"
                        required
                        rows={3}
                        placeholder="How did the visual simulations help you understand complex concepts?"
                        value={newReview.comment}
                        onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                      />
                    </div>

                    {/* Form Action Buttons */}
                    <div className="inline-form-actions">
                      <button
                        type="button"
                        className="btn-inline-cancel"
                        onClick={() => setIsReviewBoxOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-inline-submit"
                      >
                        <Send size={14} />
                        <span>Post Review</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Success Toast */}
            {submittedToast && (
              <div className="review-toast-success">
                <CheckCircle2 size={15} className="toast-icon" />
                <span>Thank you! Your feedback has been published to the live community feed below.</span>
              </div>
            )}
          </div>
        </div>

        {/* =================================================================
            2. SMOOTH CONTINUOUS MARQUEE STREAM (SINGLE LAYER WITH DUAL END FADING)
            ================================================================= */}
        <div className="reviews-marquee-wrapper">
          {/* Fading Edge Overlays on Both Ends */}
          <div className="marquee-fade-edge marquee-fade-left" aria-hidden="true" />
          <div className="marquee-fade-edge marquee-fade-right" aria-hidden="true" />

          {/* Unified Flowing Stream */}
          <div className="reviews-layer marquee-left">
            <div className="marquee-track">
              {combinedReviews.concat(combinedReviews).map((rev, idx) => (
                <CleanReviewCard 
                  key={`${rev.id}-${idx}`} 
                  review={rev} 
                  isLiked={!!likedReviews[rev.id]} 
                  onLike={() => handleLike(rev.id)} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* =================================================================
            3. PHILOSOPHY STATEMENT
            ================================================================= */}
        <div className="community-quote-banner">
          <div className="quote-banner-inner">
            <p className="quote-text">
              “Great engineers aren’t made by memorizing theory, they’re forged by <span className="quote-green-highlight">observing systems in real time</span>.”
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}

// Minimalist Initials Avatar Component
function UserAvatar({ name, gender = 'male' }) {
  const getInitials = (str) => {
    if (!str) return 'NT'
    const parts = str.trim().split(' ')
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return str.slice(0, 2).toUpperCase()
  }

  const initials = getInitials(name)
  const isFemale = gender === 'female'

  return (
    <div className={`user-clean-avatar ${isFemale ? 'avatar-alt' : 'avatar-main'}`}>
      <span>{initials}</span>
    </div>
  )
}

// Clean, De-Cluttered Review Card Component
function CleanReviewCard({ review, isLiked, onLike }) {
  return (
    <div className={`clean-review-card ${review.isNew ? 'is-new' : ''}`}>
      {/* Top Header: Tag + Minimal Star Indicator */}
      <div className="card-top-row">
        <span className="card-topic-tag">{review.tag}</span>
        <div className="card-stars-mini">
          {[...Array(review.rating || 5)].map((_, i) => (
            <Star key={i} size={11} className="card-star-icon" />
          ))}
        </div>
      </div>

      {/* Quote Comment */}
      <p className="card-quote-text">
        “{review.comment}”
      </p>

      {/* Card Footer: User Signature + Unobtrusive Like button */}
      <div className="card-bottom-row">
        <div className="card-user-info">
          <UserAvatar name={review.name} gender={review.gender} />
          <div className="card-user-details">
            <div className="card-user-name-line">
              <span className="card-user-name">{review.name}</span>
              {review.verified && (
                <CheckCircle2 size={12} className="card-verified-icon" title="Verified Tester" />
              )}
            </div>
            <span className="card-user-role">{review.role}</span>
          </div>
        </div>

        <button 
          className={`card-like-btn ${isLiked ? 'liked' : ''}`}
          onClick={onLike}
          aria-label="Mark review as helpful"
          title="Helpful"
        >
          <ThumbsUp size={12} />
          <span className="like-counter">{review.likes + (isLiked ? 1 : 0)}</span>
        </button>
      </div>
    </div>
  )
}
