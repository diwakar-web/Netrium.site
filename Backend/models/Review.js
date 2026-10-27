import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      default: 'Systems Researcher',
      trim: true
    },
    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5
    },
    tag: {
      type: String,
      default: 'OPERATING SYSTEMS',
      trim: true
    },
    comment: {
      type: String,
      required: true,
      trim: true
    },
    isApproved: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

export default Review;
