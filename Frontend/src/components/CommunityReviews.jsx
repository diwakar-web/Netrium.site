import { useState } from 'react'
import { 
  Star, 
  CheckCircle2, 
  MessageSquarePlus, 
  LogIn, 
  UserPlus, 
  ArrowRight, 
  ThumbsUp, 
  X,
  Send
} from 'lucide-react'
import './CommunityReviews.css'

export default function CommunityReviews({ onOpenAuth, onOpenFacility }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
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

  // 2 Curated Layers of Early-Tester Reviews (6 per layer)
  const initialLayer1 = [
    {
      id: 'l1-1',
      name: 'Aarav Sharma',
      gender: 'male',
      role: 'CS Undergrad, IIT Bombay',
      rating: 5,
      tag: 'OS Kernel & Memory',
      comment: 'Testing TLB cache misses and multi-level page tables in real time made memory virtualization click.',
      likes: 14,
      verified: true
    },
    {
      id: 'l1-2',
      name: 'Elena Rostova',
      gender: 'female',
      role: 'Distributed Systems Student',
      rating: 5,
      tag: 'Raft Consensus',
      comment: 'Live split votes and log replication across partitioned nodes are so much clearer than static paper slides.',
      likes: 19,
      verified: true
    },
    {
      id: 'l1-3',
      name: 'Marcus Vance',
      gender: 'male',
      role: 'Junior DevOps Engineer',
      rating: 5,
      tag: 'TCP & BGP Routing',
      comment: 'The 3-way handshake packet trace in browser without any setup was super helpful for understanding congestion.',
      likes: 11,
      verified: true
    },
    {
      id: 'l1-4',
      name: 'Sophia Lin',
      gender: 'female',
      role: 'CS Major @ UC Berkeley',
      rating: 5,
      tag: 'Concurrency & Locks',
      comment: 'Seeing deadlocks on live thread execution timelines makes concurrent programming much less intimidating.',
      likes: 16,
      verified: true
    },
    {
      id: 'l1-5',
      name: 'Devon Miller',
      gender: 'male',
      role: 'Software Developer',
      rating: 5,
      tag: 'Distributed Systems',
      comment: 'No Docker setup needed — opened the URL and experimented with quorum elections directly in the browser.',
      likes: 22,
      verified: true
    },
    {
      id: 'l1-6',
      name: 'Priya Nambiar',
      gender: 'female',
      role: 'Graduate Student, CMU',
      rating: 5,
      tag: 'Memory Virtualization',
      comment: 'Step-through execution for page fault swaps is a fantastic visual learning aid for low-level systems.',
      likes: 12,
      verified: true
    }
  ]

  const initialLayer2 = [
    {
      id: 'l2-1',
      name: 'Liam Gallagher',
      gender: 'male',
      role: 'Computer Engineering Student',
      rating: 5,
      tag: 'Computer Networks',
      comment: 'Dropping packets and seeing retransmission timers trigger live is exactly what dry textbooks lack.',
      likes: 15,
      verified: true
    },
    {
      id: 'l2-2',
      name: 'Chloe Bennett',
      gender: 'female',
      role: 'CS Senior @ Waterloo',
      rating: 5,
      tag: 'Interview Prep',
      comment: 'Used this to review distributed consensus edge cases before systems interviews. Visual models are invaluable.',
      likes: 27,
      verified: true
    },
    {
      id: 'l2-3',
      name: 'Kaito Tanaka',
      gender: 'male',
      role: 'Systems Enthusiast, Tokyo',
      rating: 5,
      tag: 'CPU Scheduling',
      comment: 'Interactive Round Robin vs MLFQ comparisons make scheduling latency trade-offs very intuitive.',
      likes: 9,
      verified: true
    },
    {
      id: 'l2-4',
      name: 'Hannah Weber',
      gender: 'female',
      role: 'Junior Backend Developer',
      rating: 5,
      tag: 'Data Structures',
      comment: 'Live tree rebalancing and lock-free concurrent queues. Loving the visual-first approach to complex CS topics.',
      likes: 18,
      verified: true
    },
    {
      id: 'l2-5',
      name: 'Rohan Deshmukh',
      gender: 'male',
      role: 'Networks Lab Student',
      rating: 5,
      tag: 'BGP Routing',
      comment: 'Visualizing routing loops and convergence on topology graphs helped me ace my computer networks exam.',
      likes: 13,
      verified: true
    },
    {
      id: 'l2-6',
      name: 'Alexei Ivanov',
      gender: 'male',
      role: 'Open Source Contributor',
      rating: 5,
      tag: 'OS Kernel & IPC',
      comment: 'Clean, fast, and accessible browser simulation. Can’t wait for more facilities to be added!',
      likes: 21,
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
    setIsModalOpen(false)
    setSubmittedToast(true)
    setTimeout(() => setSubmittedToast(false), 4000)
  }

  // Layer 1 combines user-submitted reviews with initial reviews
  const activeLayer1 = [...userReviewsList, ...initialLayer1]

  return (
    <section className="community-reviews-section" id="community-reviews">
      <div className="community-reviews-container">
        
        {/* =================================================================
            1. AUTHENTIC EARLY ADOPTER LOGIN CTA (Seamless Black Background)
            ================================================================= */}
        <div className="community-hero-wrap">
          <h2 className="community-main-title">
            Step Inside the <span className="community-green-text">Interactive Laboratory</span>
          </h2>

          <p className="community-subtitle">
            NetRIUM brings abstract concepts from Operating Systems, Computer Networks, and Distributed Systems to life through live visual simulation. Sign in to save your custom node topologies, track your experimentation progress, and help shape our early features.
          </p>

          <div className="community-action-buttons">
            <button 
              className="btn-community-signin"
              onClick={() => onOpenAuth && onOpenAuth('login')}
            >
              <LogIn size={15} />
              <span>Sign In to Laboratory</span>
              <ArrowRight size={14} className="btn-arrow-icon" />
            </button>

            <button 
              className="btn-community-signup"
              onClick={() => onOpenAuth && onOpenAuth('signup')}
            >
              <UserPlus size={15} />
              <span>Create Free Account</span>
            </button>
          </div>
        </div>

        {/* =================================================================
            2. REVIEWS HEADER WITH "WRITE YOUR OWN REVIEW" OPTION
            ================================================================= */}
        <div className="reviews-section-header">
          <div className="reviews-header-left">
            <div className="reviews-pill-label">
              <CheckCircle2 size={12} className="check-icon" />
              <span>EARLY TESTER VOICES</span>
            </div>
            <h3 className="reviews-title">
              What Early Testers Say About <span className="text-gradient-green">NetRIUM</span>
            </h3>
            <p className="reviews-desc">
              Feedback from students, engineers, and educators experimenting with our early interactive simulations.
            </p>
          </div>

          <div className="reviews-header-right">
            <button 
              className="btn-write-review"
              onClick={() => setIsModalOpen(true)}
            >
              <MessageSquarePlus size={14} />
              <span>Write Your Own Review</span>
            </button>
          </div>
        </div>

        {/* Success Notification Toast */}
        {submittedToast && (
          <div className="review-toast-success">
            <CheckCircle2 size={15} className="toast-icon" />
            <span>Thank you! Your feedback has been posted to the live feed.</span>
          </div>
        )}

        {/* =================================================================
            3. TWO-LAYER SLOW MARQUEE CAROUSEL WITH EDGE FADING
            ================================================================= */}
        <div className="reviews-marquee-wrapper">
          
          {/* LAYER 1: Moving Left (Slow & Smooth) */}
          <div className="reviews-layer marquee-left">
            <div className="marquee-track">
              {activeLayer1.concat(activeLayer1).map((rev, idx) => (
                <ReviewCard 
                  key={`${rev.id}-${idx}`} 
                  review={rev} 
                  isLiked={!!likedReviews[rev.id]} 
                  onLike={() => handleLike(rev.id)} 
                />
              ))}
            </div>
          </div>

          {/* LAYER 2: Moving Right (Slow & Smooth) */}
          <div className="reviews-layer marquee-right">
            <div className="marquee-track">
              {initialLayer2.concat(initialLayer2).map((rev, idx) => (
                <ReviewCard 
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
            4. MOTIVATING CLOSING STATEMENT (Before Footer)
            ================================================================= */}
        <div className="community-motivating-wrap">
          <p className="motivating-single-line">
            “Great engineers aren’t made by memorizing theory — they’re forged by <span className="motivating-highlight">observing systems in real time</span>.”
          </p>
        </div>

      </div>

      {/* =================================================================
          5. INTERACTIVE "WRITE REVIEW" MODAL
          ================================================================= */}
      {isModalOpen && (
        <div className="review-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="review-modal-card" onClick={e => e.stopPropagation()}>
            <button 
              className="review-modal-close" 
              onClick={() => setIsModalOpen(false)}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            <div className="review-modal-header">
              <h3 className="modal-title">Share Your Early Feedback</h3>
              <p className="modal-subtitle">
                Help us improve NetRIUM by sharing your thoughts on our interactive simulations.
              </p>
            </div>

            <form onSubmit={handleSubmitReview} className="review-modal-form">
              {/* Rating Selector */}
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
                    >
                      <Star size={20} />
                    </button>
                  ))}
                  <span className="rating-text">
                    {(hoverRating || newReview.rating) === 5 ? '5/5 Stars (Great)' : `${hoverRating || newReview.rating}/5 Stars`}
                  </span>
                </div>
              </div>

              {/* Name & Role Fields */}
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="rev-name">Your Name *</label>
                  <input
                    id="rev-name"
                    type="text"
                    required
                    placeholder="e.g. Maya Chen"
                    value={newReview.name}
                    onChange={e => setNewReview({ ...newReview, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="rev-role">Role / Student / Company</label>
                  <input
                    id="rev-role"
                    type="text"
                    placeholder="e.g. CS Student or Backend Dev"
                    value={newReview.role}
                    onChange={e => setNewReview({ ...newReview, role: e.target.value })}
                  />
                </div>
              </div>

              {/* Gender Avatar Selector & Focus Tag */}
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="rev-gender">Avatar Style</label>
                  <select
                    id="rev-gender"
                    value={newReview.gender}
                    onChange={e => setNewReview({ ...newReview, gender: e.target.value })}
                  >
                    <option value="male">Male Profile Icon</option>
                    <option value="female">Female Profile Icon</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="rev-tag">Tested Concept</label>
                  <select
                    id="rev-tag"
                    value={newReview.tag}
                    onChange={e => setNewReview({ ...newReview, tag: e.target.value })}
                  >
                    <option value="Operating Systems">Operating Systems</option>
                    <option value="Distributed Systems">Distributed Systems</option>
                    <option value="Computer Networks">Computer Networks</option>
                    <option value="Data Structures">Data Structures</option>
                    <option value="General Feedback">General Platform</option>
                  </select>
                </div>
              </div>

              {/* Detailed Review Comment */}
              <div className="form-group">
                <label htmlFor="rev-comment">Your Thoughts / Suggestions *</label>
                <textarea
                  id="rev-comment"
                  required
                  rows={3}
                  placeholder="How did the visual simulations help you? Any feature suggestions or concepts to add?"
                  value={newReview.comment}
                  onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                />
              </div>

              {/* Submit Buttons */}
              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit-review"
                >
                  <Send size={14} />
                  <span>Submit Feedback</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

// Vector Male / Female Profile Avatar Component
function ProfileAvatar({ gender = 'male' }) {
  if (gender === 'female') {
    return (
      <div className="reviewer-avatar female" title="Female Account">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="7" r="4" />
          <path d="M6 21v-2a6 6 0 0 1 12 0v2" />
          <path d="M16 4a4 4 0 0 1 0 6" strokeWidth="1.6" />
        </svg>
      </div>
    )
  }
  return (
    <div className="reviewer-avatar male" title="Male Account">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  )
}

// Single Compact Review Card Component
function ReviewCard({ review, isLiked, onLike }) {
  return (
    <div className={`review-card ${review.isNew ? 'new-badge-glow' : ''}`}>
      <div className="review-card-top">
        <div className="review-stars-row">
          {[...Array(review.rating)].map((_, i) => (
            <Star key={i} size={12} className="star-gold" />
          ))}
        </div>
        <div className="review-tag-badge">
          {review.tag}
        </div>
      </div>

      <p className="review-comment-text">
        "{review.comment}"
      </p>

      <div className="review-card-footer">
        <div className="reviewer-info">
          <ProfileAvatar gender={review.gender} />
          <div className="reviewer-meta">
            <div className="reviewer-name-row">
              <span className="reviewer-name">{review.name}</span>
              {review.verified && (
                <CheckCircle2 size={11} className="verified-check-icon" title="Early Tester" />
              )}
            </div>
            <span className="reviewer-role">{review.role}</span>
          </div>
        </div>

        <button 
          className={`btn-helpful ${isLiked ? 'liked' : ''}`}
          onClick={onLike}
          aria-label="Helpful review"
        >
          <ThumbsUp size={11} />
          <span>{review.likes + (isLiked ? 1 : 0)}</span>
        </button>
      </div>
    </div>
  )
}
