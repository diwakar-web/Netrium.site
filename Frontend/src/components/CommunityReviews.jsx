import { useState, useMemo, useEffect } from 'react'
import { 
  Star, 
  CheckCircle2, 
  MessageSquarePlus, 
  LogIn, 
  UserPlus, 
  ArrowRight, 
  ThumbsUp, 
  X,
  Send,
  Sparkles,
  Layers,
  Cpu,
  Globe,
  GitFork,
  PenLine
} from 'lucide-react'
import './CommunityReviews.css'

const TOPIC_CATEGORIES = [
  { id: 'all', label: 'All Reviews', icon: Layers },
  { id: 'os', label: 'Operating Systems', icon: Cpu },
  { id: 'networks', label: 'Computer Networks', icon: Globe },
  { id: 'distributed', label: 'Distributed Systems', icon: GitFork },
]

export default function CommunityReviews({ onOpenAuth, onOpenFacility }) {
  const [selectedTopic, setSelectedTopic] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userReviewsList, setUserReviewsList] = useState([])
  const [newReview, setNewReview] = useState({
    name: '',
    role: '',
    gender: 'male',
    rating: 5,
    tag: 'Operating Systems',
    category: 'os',
    comment: ''
  })
  const [hoverRating, setHoverRating] = useState(0)
  const [likedReviews, setLikedReviews] = useState({})
  const [submittedToast, setSubmittedToast] = useState(false)

  // Freeze background scrolling when review modal/box is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [isModalOpen])

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen])

  // Curated High-Signal Reviews
  const initialLayer1 = [
    {
      id: 'l1-1',
      name: 'Aarav Sharma',
      gender: 'male',
      role: 'CS Undergrad, IIT Bombay',
      rating: 5,
      category: 'os',
      tag: 'OS Kernel & Memory',
      comment: 'Testing TLB cache misses and multi-level page tables in real time made memory virtualization finally click for me.',
      likes: 24,
      verified: true
    },
    {
      id: 'l1-2',
      name: 'Elena Rostova',
      gender: 'female',
      role: 'Distributed Systems Student',
      rating: 5,
      category: 'distributed',
      tag: 'Raft Consensus',
      comment: 'Live split votes and log replication across partitioned nodes are so much clearer than static textbook slides.',
      likes: 31,
      verified: true
    },
    {
      id: 'l1-3',
      name: 'Marcus Vance',
      gender: 'male',
      role: 'Junior DevOps Engineer',
      rating: 5,
      category: 'networks',
      tag: 'TCP & BGP Routing',
      comment: 'The 3-way handshake packet trace directly in the browser without any setup was super helpful for understanding congestion.',
      likes: 18,
      verified: true
    },
    {
      id: 'l1-4',
      name: 'Sophia Lin',
      gender: 'female',
      role: 'CS Major @ UC Berkeley',
      rating: 5,
      category: 'os',
      tag: 'Concurrency & Locks',
      comment: 'Seeing race conditions and deadlocks on live thread execution timelines makes concurrent programming much less intimidating.',
      likes: 29,
      verified: true
    },
    {
      id: 'l1-5',
      name: 'Devon Miller',
      gender: 'male',
      role: 'Software Developer',
      rating: 5,
      category: 'distributed',
      tag: 'Distributed Systems',
      comment: 'No Docker setup needed — opened the URL and experimented with quorum elections directly in the browser.',
      likes: 37,
      verified: true
    },
    {
      id: 'l1-6',
      name: 'Priya Nambiar',
      gender: 'female',
      role: 'Graduate Student, CMU',
      rating: 5,
      category: 'os',
      tag: 'Memory Virtualization',
      comment: 'Step-through execution for page fault swaps is a fantastic visual learning aid for low-level systems.',
      likes: 22,
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
      category: 'networks',
      tag: 'Computer Networks',
      comment: 'Dropping packets and seeing retransmission timers trigger live is exactly what dry network textbooks lack.',
      likes: 26,
      verified: true
    },
    {
      id: 'l2-2',
      name: 'Chloe Bennett',
      gender: 'female',
      role: 'CS Senior @ Waterloo',
      rating: 5,
      category: 'distributed',
      tag: 'Interview Prep',
      comment: 'Used this to review distributed consensus edge cases before systems interviews. Visual models are invaluable.',
      likes: 45,
      verified: true
    },
    {
      id: 'l2-3',
      name: 'Kaito Tanaka',
      gender: 'male',
      role: 'Systems Enthusiast, Tokyo',
      rating: 5,
      category: 'os',
      tag: 'CPU Scheduling',
      comment: 'Interactive Round Robin vs MLFQ comparisons make scheduling latency trade-offs immediately intuitive.',
      likes: 19,
      verified: true
    },
    {
      id: 'l2-4',
      name: 'Hannah Weber',
      gender: 'female',
      role: 'Junior Backend Developer',
      rating: 5,
      category: 'os',
      tag: 'Data Structures',
      comment: 'Live tree rebalancing and lock-free concurrent queues. Loving the visual-first approach to complex CS topics.',
      likes: 33,
      verified: true
    },
    {
      id: 'l2-5',
      name: 'Rohan Deshmukh',
      gender: 'male',
      role: 'Networks Lab Student',
      rating: 5,
      category: 'networks',
      tag: 'BGP Routing',
      comment: 'Visualizing routing loops and convergence on topology graphs helped me ace my computer networks exam.',
      likes: 21,
      verified: true
    },
    {
      id: 'l2-6',
      name: 'Alexei Ivanov',
      gender: 'male',
      role: 'Open Source Contributor',
      rating: 5,
      category: 'os',
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

    const categoryMap = {
      'Operating Systems': 'os',
      'Distributed Systems': 'distributed',
      'Computer Networks': 'networks',
      'Data Structures': 'os',
      'General Platform': 'os'
    }

    const created = {
      id: `user-${Date.now()}`,
      name: newReview.name.trim(),
      role: newReview.role.trim() || 'Early Tester',
      gender: newReview.gender || 'male',
      rating: newReview.rating,
      category: categoryMap[newReview.tag] || 'os',
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
      category: 'os',
      comment: ''
    })
    setIsModalOpen(false)
    setSubmittedToast(true)
    setTimeout(() => setSubmittedToast(false), 4000)
  }

  // Combined and filtered review lists
  const allReviews = useMemo(() => {
    return [...userReviewsList, ...initialLayer1, ...initialLayer2]
  }, [userReviewsList])

  const filteredLayer1 = useMemo(() => {
    const list = [...userReviewsList, ...initialLayer1]
    if (selectedTopic === 'all') return list
    return list.filter(r => r.category === selectedTopic)
  }, [userReviewsList, selectedTopic])

  const filteredLayer2 = useMemo(() => {
    if (selectedTopic === 'all') return initialLayer2
    return initialLayer2.filter(r => r.category === selectedTopic)
  }, [selectedTopic])

  const isFilteredMode = selectedTopic !== 'all'
  const filteredAll = useMemo(() => {
    if (selectedTopic === 'all') return []
    return allReviews.filter(r => r.category === selectedTopic)
  }, [allReviews, selectedTopic])

  return (
    <section className="community-reviews-section" id="community-reviews">
      <div className="community-reviews-container">
        
        {/* =================================================================
            1. UNIFIED, DE-CLUTTERED HERO & SOCIAL PROOF HEADER
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

          {/* DEDICATED WRITE REVIEW BOX BENEATH LOGIN BUTTONS */}
          <div className="community-write-review-trigger-box">
            <button 
              className="btn-open-review-box"
              onClick={() => setIsModalOpen(true)}
              aria-label="Open review writing box"
            >
              <div className="write-box-left">
                <span className="write-box-icon-wrap">
                  <PenLine size={14} />
                </span>
                <span className="write-box-text">
                  Tested our simulations? <strong>Share your feedback & review</strong>
                </span>
              </div>
              <span className="write-box-action-pill">
                <span>Write Review</span>
                <ArrowRight size={12} />
              </span>
            </button>
          </div>
        </div>

        {/* =================================================================
            2. TOPIC FILTER BAR (Clean Pill Toggles)
            ================================================================= */}
        <div className="community-topic-filter-bar">
          <div className="topic-filter-pills">
            {TOPIC_CATEGORIES.map(cat => {
              const IconComp = cat.icon
              const isActive = selectedTopic === cat.id
              return (
                <button
                  key={cat.id}
                  className={`topic-pill-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedTopic(cat.id)}
                >
                  <IconComp size={13} />
                  <span>{cat.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Success Toast */}
        {submittedToast && (
          <div className="review-toast-success">
            <CheckCircle2 size={15} className="toast-icon" />
            <span>Thank you! Your feedback has been published to the live feed.</span>
          </div>
        )}

        {/* =================================================================
            3. ELEGANT REVIEWS PRESENTATION (Smooth Marquee or Clean Grid)
            ================================================================= */}
        {!isFilteredMode ? (
          <div className="reviews-marquee-wrapper">
            {/* Top Row: Flowing Left */}
            <div className="reviews-layer marquee-left">
              <div className="marquee-track">
                {filteredLayer1.concat(filteredLayer1).map((rev, idx) => (
                  <CleanReviewCard 
                    key={`${rev.id}-${idx}`} 
                    review={rev} 
                    isLiked={!!likedReviews[rev.id]} 
                    onLike={() => handleLike(rev.id)} 
                  />
                ))}
              </div>
            </div>

            {/* Bottom Row: Flowing Right */}
            <div className="reviews-layer marquee-right">
              <div className="marquee-track">
                {filteredLayer2.concat(filteredLayer2).map((rev, idx) => (
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
        ) : (
          <div className="reviews-filtered-grid">
            {filteredAll.map((rev) => (
              <CleanReviewCard 
                key={rev.id} 
                review={rev} 
                isLiked={!!likedReviews[rev.id]} 
                onLike={() => handleLike(rev.id)} 
              />
            ))}
          </div>
        )}

        {/* =================================================================
            4. REFINED PHILOSOPHY STATEMENT
            ================================================================= */}
        <div className="community-quote-banner">
          <div className="quote-banner-inner">
            <p className="quote-text">
              “Great engineers aren’t made by memorizing theory, they’re forged by <span className="quote-green-highlight">observing systems in real time</span>.”
            </p>
          </div>
        </div>

      </div>

      {/* =================================================================
          5. INTERACTIVE "WRITE REVIEW" BOX (MODAL OVERLAY)
             - Locks background scrolling when open
             - Disappears when clicking backdrop outside or 'X' button
          ================================================================= */}
      {isModalOpen && (
        <div 
          className="review-modal-backdrop" 
          onClick={() => setIsModalOpen(false)}
          onWheel={e => e.stopPropagation()}
        >
          <div 
            className="review-modal-card" 
            onClick={e => e.stopPropagation()}
          >
            <button 
              className="review-modal-close" 
              onClick={() => setIsModalOpen(false)}
              aria-label="Close review modal"
              title="Close (Esc)"
            >
              <X size={18} />
            </button>

            <div className="review-modal-header">
              <div className="modal-badge">
                <Sparkles size={13} />
                <span>COMMUNITY VOICES</span>
              </div>
              <h3 className="modal-title">Share Your Experience</h3>
              <p className="modal-subtitle">
                Your feedback directly influences how we expand NetRIUM's interactive simulation facilities.
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
                    {(hoverRating || newReview.rating) === 5 ? '5/5 Stars (Excellent)' : `${hoverRating || newReview.rating}/5 Stars`}
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
                  <label htmlFor="rev-role">Role / Institution</label>
                  <input
                    id="rev-role"
                    type="text"
                    placeholder="e.g. CS Student @ MIT"
                    value={newReview.role}
                    onChange={e => setNewReview({ ...newReview, role: e.target.value })}
                  />
                </div>
              </div>

              {/* Concept Tag */}
              <div className="form-group">
                <label htmlFor="rev-tag">Tested Concept</label>
                <select
                  id="rev-tag"
                  value={newReview.tag}
                  onChange={e => setNewReview({ ...newReview, tag: e.target.value })}
                >
                  <option value="Operating Systems">Operating Systems (Memory / Locks / Scheduling)</option>
                  <option value="Distributed Systems">Distributed Systems (Raft / Consensus / Partitioning)</option>
                  <option value="Computer Networks">Computer Networks (TCP Handshake / BGP Routing)</option>
                  <option value="Data Structures">Data Structures & Algorithms</option>
                  <option value="General Platform">General Platform Experience</option>
                </select>
              </div>

              {/* Detailed Review Comment */}
              <div className="form-group">
                <label htmlFor="rev-comment">Your Thoughts & Feedback *</label>
                <textarea
                  id="rev-comment"
                  required
                  rows={3}
                  placeholder="How did the visual simulations help you understand complex concepts?"
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
                  <span>Post Feedback</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
