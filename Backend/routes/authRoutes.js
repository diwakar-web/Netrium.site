import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  saveOtpRecord,
  getOtpRecord,
  removeOtpRecord,
  getUserByEmail,
  getUserById,
  createNewUser,
  updateLastLogin,
  updateUserProfile,
  updateUserPassword,
  isDbConnected
} from '../services/authStore.js';
import { sendOtpEmail } from '../utils/mailer.js';
import { generateToken, verifyJwt, JWT_SECRET } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/auth/send-otp
 * @desc    Generate and send 5-minute OTP to email (Registration / First-time account creation ONLY)
 */
router.post('/send-otp', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verify user does not already exist in database
    const existingUser = await getUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in directly.'
      });
    }

    // Generate secure 6-digit numeric OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Expire in exactly 5 minutes (300,000 ms)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save in MongoDB Otp collection with 5-minute TTL
    await saveOtpRecord(normalizedEmail, otpCode, expiresAt);

    // Send email with OTP via nodemailer
    const mailResult = await sendOtpEmail(normalizedEmail, otpCode, name || 'Researcher');

    return res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${normalizedEmail}. Valid for 5 minutes.`,
      expiresInSeconds: 300,
      expiresAt: expiresAt.toISOString(),
      databaseActive: isDbConnected(),
      debugOtp: mailResult.simulated ? otpCode : undefined
    });
  } catch (error) {
    console.error('Error in /send-otp:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate and dispatch OTP: ' + error.message
    });
  }
});

/**
 * @route   POST /api/auth/verify-and-register
 * @desc    Verify OTP from MongoDB and create new user in MongoDB, then issue dedicated JWT
 */
router.post('/verify-and-register', async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    if (!email || !otp || !name || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and 6-digit OTP code are all required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    // Lookup OTP in database
    const otpDoc = await getOtpRecord(normalizedEmail, cleanOtp);

    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP passcode. Please check your code or request a new one.'
      });
    }

    // Verify 5-minute validity window
    if (new Date() > new Date(otpDoc.expiresAt)) {
      await removeOtpRecord(normalizedEmail);
      return res.status(400).json({
        success: false,
        message: 'This OTP has expired (5-minute window passed). Please request a fresh code.'
      });
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Double check user does not already exist with active password
    const userExists = await getUserByEmail(normalizedEmail);
    if (userExists && userExists.password) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please log in directly.'
      });
    }

    // Store verified user in database (createNewUser unifies existing Google/Firebase user)
    const newUser = await createNewUser({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      isVerified: true,
      authProvider: userExists?.authProvider || 'local',
      role: userExists?.role || 'researcher'
    });

    // Delete used OTP
    await removeOtpRecord(normalizedEmail);

    // Issue dedicated JWT token
    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account verified and created successfully in Netrium database.',
      token,
      isNewUser: true,
      user: {
        id: newUser._id || newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isVerified: newUser.isVerified,
        phoneNumber: newUser.phoneNumber || '',
        gender: newUser.gender || '',
        age: newUser.age || '',
        qualifications: newUser.qualifications || '',
        position: newUser.position || '',
        institution: newUser.institution || '',
        avatar: newUser.avatar || null,
        isProfileComplete: false,
        isNewUser: true
      }
    });
  } catch (error) {
    console.error('Error in /verify-and-register:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete registration: ' + error.message
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Direct Email & Password login with dedicated JWT (NO OTP on login, per requirements)
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user in database
    const user = await getUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this email address. Please create an account.'
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'This account was registered using Google. Please sign in with Google or click "Forgot password?" to set a password.'
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please try again.'
      });
    }

    // Update lastLogin timestamp
    await updateLastLogin(user);

    // Issue dedicated JWT token
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Signed in successfully.',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        gender: user.gender || '',
        age: user.age || '',
        qualifications: user.qualifications || '',
        position: user.position || '',
        institution: user.institution || '',
        avatar: user.avatar || null,
        role: user.role,
        isProfileComplete: !!user.isProfileComplete,
        authProvider: user.authProvider
      }
    });
  } catch (error) {
    console.error('Error in /login:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during sign in: ' + error.message
    });
  }
});

/**
 * @route   POST /api/auth/firebase-login
 * @desc    Authenticate with Firebase OAuth (e.g. Google), sync with MongoDB, issue dedicated JWT
 */
router.post('/firebase-login', async (req, res) => {
  try {
    const { email, name, firebaseUid, avatar, authProvider } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Firebase email is required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const provider = authProvider || 'firebase';

    let user = await getUserByEmail(normalizedEmail);
    let isNewUser = false;

    if (!user) {
      // Store new Firebase user into database
      user = await createNewUser({
        name: name || 'Laboratory Member',
        email: normalizedEmail,
        authProvider: provider,
        firebaseUid: firebaseUid || null,
        avatar: avatar || null,
        isVerified: true,
        role: 'researcher',
        isProfileComplete: false
      });
      isNewUser = true;
    } else {
      if (firebaseUid && !user.firebaseUid) user.firebaseUid = firebaseUid;
      if (avatar && !user.avatar) user.avatar = avatar;
      if (authProvider && user.authProvider === 'firebase') user.authProvider = provider;
      await updateLastLogin(user);
    }

    // Issue dedicated JWT token
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Authenticated via Firebase and synced with Netrium database.',
      token,
      isNewUser,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        gender: user.gender || '',
        age: user.age || '',
        qualifications: user.qualifications || '',
        position: user.position || '',
        institution: user.institution || '',
        avatar: user.avatar,
        role: user.role,
        isProfileComplete: !!user.isProfileComplete,
        isNewUser,
        authProvider: user.authProvider
      }
    });
  } catch (error) {
    console.error('Error in /firebase-login:', error);
    return res.status(500).json({
      success: false,
      message: 'Firebase authentication failed: ' + error.message
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get currently authenticated user info from dedicated JWT
 */
router.get('/me', verifyJwt, async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
      jwtClaims: req.jwtClaims
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/auth/profile
 * @desc    Get complete researcher profile for authenticated user
 */
router.get('/profile', verifyJwt, async (req, res) => {
  try {
    const user = await getUserById(req.user._id || req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        gender: user.gender || '',
        age: user.age !== null && user.age !== undefined ? user.age : '',
        qualifications: user.qualifications || '',
        position: user.position || '',
        institution: user.institution || '',
        avatar: user.avatar || null,
        role: user.role || 'researcher',
        isProfileComplete: !!user.isProfileComplete,
        authProvider: user.authProvider || 'local',
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error in GET /api/auth/profile:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update researcher profile for authenticated user
 */
router.put('/profile', verifyJwt, async (req, res) => {
  try {
    const { name, phoneNumber, gender, age, qualifications, position, institution, avatar } = req.body;
    const userId = req.user._id || req.user.id;

    const updateData = {
      name: name && name.trim() ? name.trim() : req.user.name,
      phoneNumber: phoneNumber !== undefined ? phoneNumber.trim() : (req.user.phoneNumber || ''),
      gender: gender !== undefined ? gender.trim() : (req.user.gender || ''),
      age: age !== undefined && age !== '' && !isNaN(Number(age)) ? Number(age) : null,
      qualifications: qualifications !== undefined ? qualifications.trim() : (req.user.qualifications || ''),
      position: position !== undefined ? position.trim() : (req.user.position || ''),
      institution: institution !== undefined ? institution.trim() : (req.user.institution || ''),
      avatar: avatar !== undefined ? avatar : (req.user.avatar || null),
      isProfileComplete: true
    };

    const updatedUser = await updateUserProfile(userId, updateData);
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found in database.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully in Netrium database.',
      user: {
        id: updatedUser._id || updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber || '',
        gender: updatedUser.gender || '',
        age: updatedUser.age !== null && updatedUser.age !== undefined ? updatedUser.age : '',
        qualifications: updatedUser.qualifications || '',
        position: updatedUser.position || '',
        institution: updatedUser.institution || '',
        avatar: updatedUser.avatar || null,
        role: updatedUser.role || 'researcher',
        isProfileComplete: true,
        authProvider: updatedUser.authProvider
      }
    });
  } catch (error) {
    console.error('Error in PUT /api/auth/profile:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile: ' + error.message });
  }
});

/**
 * @route   POST /api/auth/forgot-password/send-otp
 * @desc    Send 6-digit recovery OTP to registered user email
 */
router.post('/forgot-password/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your registered email address.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await getUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account registered with this email address. Please check or sign up.'
      });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    await saveOtpRecord(normalizedEmail, otpCode, expiresAt);

    // Send OTP email
    const mailResult = await sendOtpEmail(normalizedEmail, otpCode, user.name || 'Researcher');

    return res.status(200).json({
      success: true,
      message: `A 6-digit recovery passcode has been dispatched to ${normalizedEmail}. Valid for 5 minutes.`,
      expiresInSeconds: 300,
      debugOtp: mailResult.simulated ? otpCode : undefined
    });
  } catch (error) {
    console.error('Error in /forgot-password/send-otp:', error);
    return res.status(500).json({ success: false, message: 'Failed to send recovery OTP: ' + error.message });
  }
});

/**
 * @route   POST /api/auth/forgot-password/verify-otp
 * @desc    Verify recovery OTP for password reset
 */
router.post('/forgot-password/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and 6-digit passcode are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    const user = await getUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const otpDoc = await getOtpRecord(normalizedEmail, cleanOtp);
    if (!otpDoc) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP passcode. Please try again.' });
    }

    if (new Date() > new Date(otpDoc.expiresAt)) {
      await removeOtpRecord(normalizedEmail);
      return res.status(400).json({ success: false, message: 'Passcode has expired. Please request a new code.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Passcode verified successfully. You can now update your password or continue.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/auth/forgot-password/reset
 * @desc    Reset password after verifying OTP and login user
 */
router.post('/forgot-password/reset', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    const user = await getUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const otpDoc = await getOtpRecord(normalizedEmail, cleanOtp);
    if (!otpDoc) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP passcode.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const updated = await updateUserPassword(normalizedEmail, hashedPassword);
    await removeOtpRecord(normalizedEmail);

    // Issue fresh JWT token so user is authenticated
    const token = generateToken(updated || user);

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully! Welcome back.',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        gender: user.gender || '',
        age: user.age || '',
        qualifications: user.qualifications || '',
        position: user.position || '',
        institution: user.institution || '',
        avatar: user.avatar || null,
        role: user.role || 'researcher',
        isProfileComplete: !!user.isProfileComplete,
        authProvider: user.authProvider
      }
    });
  } catch (error) {
    console.error('Error in /forgot-password/reset:', error);
    return res.status(500).json({ success: false, message: 'Failed to reset password: ' + error.message });
  }
});

/**
 * @route   POST /api/auth/forgot-password/continue
 * @desc    Skip password change and log in directly with verified OTP
 */
router.post('/forgot-password/continue', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    const user = await getUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const otpDoc = await getOtpRecord(normalizedEmail, cleanOtp);
    if (!otpDoc) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP passcode.' });
    }

    await removeOtpRecord(normalizedEmail);
    await updateLastLogin(user);

    // Issue fresh JWT token
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Authenticated successfully. Continuing without password change.',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        gender: user.gender || '',
        age: user.age || '',
        qualifications: user.qualifications || '',
        position: user.position || '',
        institution: user.institution || '',
        avatar: user.avatar || null,
        role: user.role || 'researcher',
        isProfileComplete: !!user.isProfileComplete,
        authProvider: user.authProvider
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/auth/jwt-status
 * @desc    Dedicated JWT inspection endpoint: returns token validity, decoded payload, and expiration
 */
router.get('/jwt-status', async (req, res) => {
  let token = null;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(400).json({
      success: false,
      hasToken: false,
      message: 'No JWT Bearer token provided in Authorization header.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const decodedRaw = jwt.decode(token, { complete: true });

    const nowSeconds = Math.floor(Date.now() / 1000);
    const remainingSeconds = decoded.exp ? Math.max(0, decoded.exp - nowSeconds) : null;

    return res.status(200).json({
      success: true,
      hasToken: true,
      isValid: true,
      tokenPreview: `${token.substring(0, 16)}...${token.substring(token.length - 12)}`,
      header: decodedRaw?.header,
      payload: decoded,
      issuedAt: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : null,
      expiresAt: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : null,
      remainingSeconds,
      formattedRemaining: remainingSeconds ? `${Math.floor(remainingSeconds / 3600)}h ${Math.floor((remainingSeconds % 3600) / 60)}m` : 'N/A'
    });
  } catch (error) {
    const decodedRaw = jwt.decode(token, { complete: true });
    return res.status(200).json({
      success: false,
      hasToken: true,
      isValid: false,
      errorName: error.name,
      errorMessage: error.message,
      payload: decodedRaw?.payload || null
    });
  }
});

export default router;
