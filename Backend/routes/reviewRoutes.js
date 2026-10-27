import express from 'express';
import Review from '../models/Review.js';

const router = express.Router();

const initialSeedReviews = [
  {
    name: 'Aarav Sharma',
    role: 'Systems Researcher',
    rating: 5,
    tag: 'OS KERNEL & MEMORY',
    comment: "Netrium's Raft consensus visualizer and page table simulators finally made distributed state machines and memory virtualization click for our entire research group."
  },
  {
    name: 'Elena Rostova',
    role: 'Network Engineer',
    rating: 5,
    tag: 'PACKET TRACE & CDN',
    comment: 'Testing multi-device packet drops across my phone and laptop in real-time feels like pure magic.'
  },
  {
    name: 'Marcus Vance',
    role: 'CS Professor',
    rating: 5,
    tag: 'OS SCHEDULING',
    comment: 'The OS scheduling timeline and CPU core visualizer is hands down the best computer systems teaching tool.'
  },
  {
    name: 'Sophia Lin',
    role: 'Distributed Systems Dev',
    rating: 5,
    tag: 'BGP & ROUTING',
    comment: 'Simulating BGP routing anomalies across virtual clusters saved me weeks of manual debugging.'
  },
  {
    name: 'Devon Miller',
    role: 'Kernel Enthusiast',
    rating: 5,
    tag: 'VIRTUAL MEMORY',
    comment: 'From virtual memory paging to mesh networks, Netrium turns abstract CS theory into pure intuition.'
  },
  {
    name: 'Priya Nambiar',
    role: 'Graduate Student, CMU',
    rating: 5,
    tag: 'MEMORY VIRTUALIZATION',
    comment: 'Step-through execution for page fault swaps is a fantastic visual learning aid. Walking through multi-level page tables eliminated all confusion.'
  },
  {
    name: 'Liam Gallagher',
    role: 'Computer Engineering Student',
    rating: 5,
    tag: 'COMPUTER NETWORKS',
    comment: 'Dropping packets and seeing retransmission timers trigger live is exactly what dry network textbooks lack.'
  },
  {
    name: 'Chloe Bennett',
    role: 'CS Senior @ Waterloo',
    rating: 5,
    tag: 'INTERVIEW PREP',
    comment: 'Used this to review distributed consensus edge cases before systems interviews. Visual mental models are 10x more memorable.'
  }
];

/**
 * GET /api/reviews
 * Fetch all reviews from MongoDB database. Auto-seeds if empty.
 */
router.get('/', async (req, res) => {
  try {
    const count = await Review.countDocuments();
    if (count === 0) {
      await Review.insertMany(initialSeedReviews);
      console.log('[Reviews] Seeded initial database reviews successfully.');
    }

    const reviews = await Review.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error('[Get Reviews Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve reviews from database',
      error: error.message
    });
  }
});

/**
 * POST /api/reviews
 * Create a new review in MongoDB database
 */
router.post('/', async (req, res) => {
  try {
    const { name, role, rating, tag, comment } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required to submit a review.'
      });
    }

    if (!comment || typeof comment !== 'string' || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Review comment cannot be empty.'
      });
    }

    const review = await Review.create({
      name: name.trim(),
      role: (role || 'Systems Researcher').trim(),
      rating: Number(rating) ? Math.min(5, Math.max(1, Number(rating))) : 5,
      tag: (tag || 'OPERATING SYSTEMS').trim().toUpperCase(),
      comment: comment.trim(),
      isApproved: true
    });

    console.log(`[Reviews] New review stored in database from: ${review.name}`);

    return res.status(201).json({
      success: true,
      message: 'Review successfully submitted and saved to database!',
      review
    });
  } catch (error) {
    console.error('[Create Review Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save review to database',
      error: error.message
    });
  }
});

export default router;
