import mongoose from 'mongoose';
import User from '../models/User.js';
import Otp from '../models/Otp.js';

// In-memory fallback cache in case MongoDB Atlas IP is not yet whitelisted
const memoryOtps = new Map();
const memoryUsers = new Map();

export const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Save OTP to MongoDB (and memory fallback)
 */
export const saveOtpRecord = async (email, otp, expiresAt) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Save to memory cache (with automatic 5-minute cleanup)
  memoryOtps.set(normalizedEmail, {
    email: normalizedEmail,
    otp,
    expiresAt,
    createdAt: new Date()
  });

  setTimeout(() => {
    const existing = memoryOtps.get(normalizedEmail);
    if (existing && existing.otp === otp) {
      memoryOtps.delete(normalizedEmail);
    }
  }, 5 * 60 * 1000); // 5 minutes

  // If MongoDB is connected, save in MongoDB with TTL index
  if (isDbConnected()) {
    try {
      await Otp.deleteMany({ email: normalizedEmail });
      await Otp.create({
        email: normalizedEmail,
        otp,
        createdAt: new Date(),
        expiresAt
      });
    } catch (err) {
      console.warn('[MongoDB Otp Save Notice]', err.message);
    }
  }
};

/**
 * Verify and retrieve OTP
 */
export const getOtpRecord = async (email, otp) => {
  const normalizedEmail = email.toLowerCase().trim();
  const cleanOtp = otp.toString().trim();

  if (isDbConnected()) {
    try {
      const doc = await Otp.findOne({ email: normalizedEmail, otp: cleanOtp });
      if (doc) return doc;
    } catch (err) {
      console.warn('[MongoDB Otp Lookup Notice]', err.message);
    }
  }

  // Fallback to memory
  const mem = memoryOtps.get(normalizedEmail);
  if (mem && mem.otp === cleanOtp) {
    return mem;
  }

  return null;
};

/**
 * Clear OTP
 */
export const removeOtpRecord = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();
  memoryOtps.delete(normalizedEmail);

  if (isDbConnected()) {
    try {
      await Otp.deleteMany({ email: normalizedEmail });
    } catch (err) {
      console.warn('[MongoDB Otp Delete Notice]', err.message);
    }
  }
};

/**
 * Find user by email
 */
export const getUserByEmail = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();

  if (isDbConnected()) {
    try {
      const doc = await User.findOne({ email: normalizedEmail });
      if (doc) return doc;
    } catch (err) {
      console.warn('[MongoDB User Lookup Notice]', err.message);
    }
  }

  return memoryUsers.get(normalizedEmail) || null;
};

/**
 * Find user by ID
 */
export const getUserById = async (id) => {
  if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
    try {
      const doc = await User.findById(id).select('-password');
      if (doc) return doc;
    } catch (err) {
      console.warn('[MongoDB User Lookup By ID Notice]', err.message);
    }
  }

  for (const user of memoryUsers.values()) {
    if (user._id?.toString() === id?.toString() || user.id === id) {
      return user;
    }
  }
  return null;
};

/**
 * Create new user or return existing unified user
 */
export const createNewUser = async (userData) => {
  const normalizedEmail = userData.email.toLowerCase().trim();

  // Enforce single user per email address
  const existing = await getUserByEmail(normalizedEmail);
  if (existing) {
    if (userData.password && !existing.password) {
      await updateUserPassword(normalizedEmail, userData.password);
    }
    if (userData.firebaseUid && !existing.firebaseUid) {
      await updateUserProfile(existing._id || existing.id, { firebaseUid: userData.firebaseUid });
    }
    if (userData.avatar && !existing.avatar) {
      await updateUserProfile(existing._id || existing.id, { avatar: userData.avatar });
    }
    await updateLastLogin(existing);
    return await getUserByEmail(normalizedEmail);
  }

  let userDoc = null;
  if (isDbConnected()) {
    try {
      userDoc = await User.create(userData);
    } catch (err) {
      console.warn('[MongoDB User Creation Notice]', err.message);
      // In case of duplicate key race condition, retrieve existing
      userDoc = await User.findOne({ email: normalizedEmail });
    }
  }

  if (!userDoc) {
    userDoc = {
      _id: new mongoose.Types.ObjectId(),
      ...userData,
      email: normalizedEmail,
      createdAt: new Date(),
      lastLogin: new Date()
    };
  }

  memoryUsers.set(normalizedEmail, userDoc);
  return userDoc;
};

/**
 * Update user last login
 */
export const updateLastLogin = async (user) => {
  user.lastLogin = new Date();
  if (isDbConnected() && typeof user.save === 'function') {
    try {
      await user.save();
    } catch (err) {
      console.warn('[MongoDB User Save Notice]', err.message);
    }
  }
  if (user.email) {
    memoryUsers.set(user.email.toLowerCase().trim(), user);
  }
};

/**
 * Update user profile details
 */
export const updateUserProfile = async (id, updateData) => {
  if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
    try {
      const updatedDoc = await User.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select('-password');
      if (updatedDoc) {
        if (updatedDoc.email) {
          memoryUsers.set(updatedDoc.email.toLowerCase().trim(), updatedDoc);
        }
        return updatedDoc;
      }
    } catch (err) {
      console.warn('[MongoDB User Update Notice]', err.message);
    }
  }

  // Fallback to memory
  for (const [email, user] of memoryUsers.entries()) {
    if (user._id?.toString() === id?.toString() || user.id === id) {
      const updated = { ...user, ...updateData };
      memoryUsers.set(email, updated);
      return updated;
    }
  }
  return null;
};

/**
 * Update user password
 */
export const updateUserPassword = async (email, hashedPassword) => {
  const normalizedEmail = email.toLowerCase().trim();
  if (isDbConnected()) {
    try {
      const updated = await User.findOneAndUpdate(
        { email: normalizedEmail },
        { $set: { password: hashedPassword } },
        { new: true }
      );
      if (updated) {
        memoryUsers.set(normalizedEmail, updated);
        return updated;
      }
    } catch (err) {
      console.warn('[MongoDB Password Update Notice]', err.message);
    }
  }

  const mem = memoryUsers.get(normalizedEmail);
  if (mem) {
    mem.password = hashedPassword;
    memoryUsers.set(normalizedEmail, mem);
    return mem;
  }
  return null;
};


