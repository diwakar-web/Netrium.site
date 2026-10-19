import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: function() {
        return this.authProvider === 'local';
      }
    },
    isVerified: {
      type: Boolean,
      default: true
    },
    authProvider: {
      type: String,
      enum: ['local', 'google', 'github', 'firebase'],
      default: 'local'
    },
    firebaseUid: {
      type: String,
      default: null
    },
    avatar: {
      type: String,
      default: null
    },
    phoneNumber: {
      type: String,
      default: '',
      trim: true
    },
    gender: {
      type: String,
      default: '',
      trim: true
    },
    age: {
      type: Number,
      default: null
    },
    qualifications: {
      type: String,
      default: '',
      trim: true
    },
    position: {
      type: String,
      default: '',
      trim: true
    },
    institution: {
      type: String,
      default: '',
      trim: true
    },
    isProfileComplete: {
      type: Boolean,
      default: false
    },
    role: {
      type: String,
      default: 'researcher'
    },
    lastLogin: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model('User', userSchema);

export default User;
