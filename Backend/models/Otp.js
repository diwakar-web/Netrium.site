import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    otp: {
      type: String,
      required: true
    },
    // MongoDB TTL Index: documents automatically removed 300 seconds (5 minutes) after createdAt
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300
    },
    expiresAt: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index for fast lookup of email + otp
otpSchema.index({ email: 1, otp: 1 });

const Otp = mongoose.model('Otp', otpSchema);

export default Otp;
