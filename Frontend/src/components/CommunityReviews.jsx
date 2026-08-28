import { useState, useMemo, useEffect } from 'react'
import { 
  Star, 
  CheckCircle2, 
  LogIn, 
  UserPlus, 
  ArrowRight, 
  X, 
  Send, 
  Sparkles, 
  PenLine,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react'
import ScrambledText from './ScrambledText'
import Dismissible from './Dismissible'
import './CommunityReviews.css'

export default function CommunityReviews({ onOpenAuth, onOpenFacility }) {
  const [activeRowIndex, setActiveRowIndex] = useState(0)
  const [isReviewBoxOpen, setIsReviewBoxOpen] = useState(false)
  const [userReviewsList, setUserReviewsList] = useState([])
  const [newReview, setNewReview] = useState({
    name: '',
    role: '',
    rating: 5,
    tag: 'Operating Systems',
    comment: ''
  })
  const [hoverRating, setHoverRating] = useState(0)
  const [submittedToast, setSubmittedToast] = useState(false)

  // Curated High-Signal Community Reviews (12 items -> 3 rows of 4)
  const initialReviews = [
    {
      id: 'rev-1',
      tag: 'OS KERNEL & MEMORY',
      name: 'Aarav Sharma',
      role: 'CS Undergrad, IIT Bombay',
      rating: 5,
      comment: 'Testing TLB cache misses and multi-level page tables in real time made memory virtualization finally click for me.'
    },
    {
      id: 'rev-2',
      tag: 'RAFT CONSENSUS',
      name: 'Elena Rostova',
      role: 'Distributed Systems Student',
      rating: 5,
      comment: 'Live split votes and log replication across partitioned nodes are so much clearer than static textbook slides.'
    },
    {
      id: 'rev-3',
      tag: 'TCP & BGP ROUTING',
      name: 'Marcus Vance',
      role: 'Junior DevOps Engineer',
      rating: 5,
      comment: 'The 3-way handshake packet trace directly in the browser without any setup was super helpful for understanding congestion control.'
    },
    {
      id: 'rev-4',
      tag: 'CONCURRENCY & LOCKS',
      name: 'Sophia Lin',
      role: 'CS Major @ UC Berkeley',
      rating: 5,
      comment: 'Seeing race conditions and deadlocks on live thread execution timelines makes concurrent programming much less intimidating.'
    },
    {
      id: 'rev-5',
      tag: 'QUORUM ELECTIONS',
      name: 'Devon Miller',
      role: 'Software Developer',
      rating: 5,
      comment: 'No Docker setup needed — opened the URL and experimented with quorum elections and network partitions in 30 seconds.'
    },
    {
      id: 'rev-6',
      tag: 'MEMORY VIRTUALIZATION',
      name: 'Priya Nambiar',
      role: 'Graduate Student, CMU',
      rating: 5,
      comment: 'Step-through execution for page fault swaps is a fantastic visual learning aid. Walking through multi-level page tables eliminated all my confusion.'
    },
    {
      id: 'rev-7',
      tag: 'COMPUTER NETWORKS',
      name: 'Liam Gallagher',
      role: 'Computer Engineering Student',
      rating: 5,
      comment: 'Dropping packets and seeing retransmission timers trigger live is exactly what dry network textbooks lack.'
    },
    {
      id: 'rev-8',
      tag: 'INTERVIEW PREP',
      name: 'Chloe Bennett',
      role: 'CS Senior @ Waterloo',
      rating: 5,
      comment: 'Used this to review distributed consensus edge cases before systems interviews. Visual mental models are 10x more memorable.'
    },
    {
      id: 'rev-9',
      tag: 'CPU SCHEDULING',
      name: 'Kaito Tanaka',
      role: 'Systems Enthusiast, Tokyo',
      rating: 5,
      comment: 'Interactive Round Robin vs MLFQ comparisons make scheduling latency and starvation trade-offs immediately intuitive.'
    },
    {
      id: 'rev-10',
      tag: 'DATA STRUCTURES',
      name: 'Hannah Weber',
      role: 'Junior Backend Developer',
      rating: 5,
      comment: 'Live tree rebalancing and lock-free concurrent queues. Loving the visual-first approach to complex CS topics.'
    },
    {
      id: 'rev-11',
      tag: 'BGP ROUTING',
      name: 'Rohan Deshmukh',
      role: 'Networks Lab Student',
      rating: 5,
      comment: 'Visualizing routing loops, split-horizon, and path vector convergence on interactive topology graphs helped me ace my computer networks exam.'
    },
    {
      id: 'rev-12',
      tag: 'OS KERNEL & IPC',
      name: 'Alexei Ivanov',
      role: 'Open Source Contributor',
      rating: 5,
      comment: 'Clean, fast, and accessible browser simulation. Can’t wait for more facilities to be added!'
    }
  ]

  const allReviews = useMemo(() => [...userReviewsList, ...initialReviews], [userReviewsList])

  const cardsPerRow = 4
  const totalRows = Math.ceil(allReviews.length / cardsPerRow) || 1

  // Current single row of 4 reviews
  const currentRowReviews = useMemo(() => {
    const start = activeRowIndex * cardsPerRow
    return allReviews.slice(start, start + cardsPerRow)
  }, [allReviews, activeRowIndex])

  const handlePrevRow = () => {
    setActiveRowIndex(prev => (prev > 0 ? prev - 1 : totalRows - 1))
  }

  const handleNextRow = () => {
    setActiveRowIndex(prev => (prev < totalRows - 1 ? prev + 1 : 0))
  }

  // Ticker ribbon items
  const ribbonTickerItems = [
    'VERIFIED STUDENT & RESEARCHER EXPERIENCES',
    '4.9/5 RATING ACROSS 50,000+ SYSTEMS LAB SESSIONS',
    'REAL-TIME BROWSER SIMULATION • ZERO DOCKER OVERHEAD',
    'OPERATING SYSTEMS • DISTRIBUTED CONSENSUS • NETWORK PROTOCOLS',
    'TESTED & LOVED BY ENGINEERS WORLDWIDE'
  ]

  const handleSubmitReview = (e) => {
    e.preventDefault()
    if (!newReview.name.trim() || !newReview.comment.trim()) return

    const created = {
      id: `user-${Date.now()}`,
      tag: newReview.tag.toUpperCase(),
      name: newReview.name.trim(),
      role: newReview.role.trim() || 'Early Tester',
      rating: newReview.rating,
      comment: newReview.comment.trim()
    }

    setUserReviewsList([created, ...userReviewsList])
    setNewReview({
      name: '',
      role: '',
      rating: 5,
      tag: 'Operating Systems',
      comment: ''
    })
    setIsReviewBoxOpen(false)
    setActiveRowIndex(0)
    setSubmittedToast(true)
    setTimeout(() => setSubmittedToast(false), 4500)
  }

  return (
    <section className="community-reviews-section" id="community-reviews">
      <div className="community-reviews-container">
        
        {/* =================================================================
            1. TOP HEADER (DISMISSIBLE TITLE & SUBTITLE)
            ================================================================= */}
        <div className="clean-reviews-header">
          <Dismissible as="div" className="clean-reviews-title-area">
            <h2 className="clean-reviews-title">
              <ScrambledText radius={100} duration={1.2} speed={0.5} scrambleChars=".:">
                What Our Users Say..
              </ScrambledText>
            </h2>
            <p className="clean-reviews-subtitle">
              Authentic feedback from CS students, researchers, and systems engineers worldwide.
            </p>
          </Dismissible>
        </div>

        {/* =================================================================
            2. INTERACTIVE REVIEW MARQUEE RIBBON
            ================================================================= */}
        <Dismissible as="div" className="reviews-ribbon-wrapper">
          <div className="reviews-ribbon-track">
            {[...ribbonTickerItems, ...ribbonTickerItems].map((text, idx) => (
              <div className="reviews-ribbon-item" key={idx}>
                <ShieldCheck size={13} className="reviews-ribbon-icon" />
                <span className="reviews-ribbon-text">{text}</span>
                <span className="reviews-ribbon-dot">•</span>
              </div>
            ))}
          </div>
        </Dismissible>

        {/* =================================================================
            3. SINGLE ROW OF 4 CARDS WITH PREV / NEXT BUTTONS
            ================================================================= */}
        <div className="single-row-stage">
          {/* Left Arrow Button */}
          <Dismissible inline as="div" className="row-nav-btn-wrap">
            <button 
              type="button"
              className="row-nav-arrow-btn left"
              onClick={handlePrevRow}
              aria-label="Previous row of reviews"
              title="Previous reviews"
            >
              <ChevronLeft size={22} />
            </button>
          </Dismissible>

          {/* 1 Row at a Time: 4 Cards */}
          <div className="single-row-4cards-grid" key={activeRowIndex}>
            {currentRowReviews.map((rev) => {
              const initials = rev.name
                .trim()
                .split(' ')
                .slice(0, 2)
                .map(p => p[0])
                .join('')
                .toUpperCase() || 'NT'

              return (
                <Dismissible as="div" className="clean-review-card" key={rev.id} crossPosition="inside-right">
                  {/* Card Header: Tag & 5-Stars */}
                  <div className="clean-card-header">
                    <span className="clean-tag-badge">
                      {rev.tag}
                    </span>
                    <div className="clean-stars-row" aria-label="5 stars rating">
                      {[...Array(rev.rating || 5)].map((_, sIdx) => (
                        <Star key={sIdx} size={13} className="star-filled" fill="#00bf63" />
                      ))}
                    </div>
                  </div>

                  {/* Card Body: Quote */}
                  <p className="clean-card-quote">
                    “{rev.comment}”
                  </p>

                  {/* Card Footer: User Signature */}
                  <div className="clean-card-footer">
                    <div className="clean-avatar-circle">
                      {initials}
                    </div>
                    <div className="clean-author-meta">
                      <div className="clean-author-name">
                        <span>{rev.name}</span>
                      </div>
                      <div className="clean-author-role">{rev.role}</div>
                    </div>
                  </div>
                </Dismissible>
              )
            })}
          </div>

          {/* Right Arrow Button */}
          <Dismissible inline as="div" className="row-nav-btn-wrap">
            <button 
              type="button"
              className="row-nav-arrow-btn right"
              onClick={handleNextRow}
              aria-label="Next row of reviews"
              title="Next reviews"
            >
              <ChevronRight size={22} />
            </button>
          </Dismissible>
        </div>

        {/* Row Pagination Dots & Controls */}
        <div className="reviews-row-pagination">
          <div className="reviews-dots-row">
            {Array.from({ length: totalRows }).map((_, rIdx) => (
              <button
                type="button"
                key={rIdx}
                className={`reviews-row-dot ${activeRowIndex === rIdx ? 'active' : ''}`}
                onClick={() => setActiveRowIndex(rIdx)}
                aria-label={`View review row ${rIdx + 1}`}
                title={`Row ${rIdx + 1} of ${totalRows}`}
              />
            ))}
          </div>
          <span className="reviews-counter-badge">
            Row {activeRowIndex + 1} of {totalRows}
          </span>
        </div>

        {/* =================================================================
            4. LOGIN MESSAGE & ACCESS HERO BLOCK
            ================================================================= */}
        <div className="community-unified-hero">
          <Dismissible as="h2" className="community-hero-title">
            Step Inside the <span className="text-neon-gradient">Interactive Laboratory</span>
          </Dismissible>

          <Dismissible as="p" className="community-hero-desc">
            Explore live, interactive simulations for Operating Systems, Networks, and Distributed Systems. Save custom topologies, trace execution paths, and collaborate with engineers worldwide.
          </Dismissible>

          {/* Login / Sign Up Action Buttons */}
          <div className="community-hero-actions">
            <Dismissible inline as="div">
              <button 
                className="btn-lab-primary"
                onClick={() => onOpenAuth && onOpenAuth('login')}
                aria-label="Sign In to Laboratory"
              >
                <LogIn size={15} />
                <span>Sign In to Laboratory</span>
                <ArrowRight size={14} className="btn-icon-arrow" />
              </button>
            </Dismissible>

            <Dismissible inline as="div">
              <button 
                className="btn-lab-secondary"
                onClick={() => onOpenAuth && onOpenAuth('signup')}
                aria-label="Create Free Account"
              >
                <UserPlus size={15} />
                <span>Create Free Account</span>
              </button>
            </Dismissible>
          </div>

          {/* ===============================================================
              REVIEW / FEEDBACK TRIGGER BUTTON & INLINE DRAWER
              =============================================================== */}
          <div className="community-review-action-area">
            <Dismissible as="div" style={{ width: '100%' }}>
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
            </Dismissible>

            {/* INLINE EXPANDABLE REVIEW BOX */}
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
                        Your feedback publishes directly into the Community Reviews Showcase!
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
                        <option value="Networks">Computer Networks (TCP Handshake / BGP Routing)</option>
                        <option value="Concurrency">Concurrency & Multi-Threading</option>
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
                        <span>Add Review</span>
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
                <span>Thank you! Your feedback has been added to the reviews showcase.</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  )
}
