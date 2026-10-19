import jwt from 'jsonwebtoken';
import { getUserById } from '../services/authStore.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'netrium_super_secret_cyber_jwt_key_2026_x89f';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate dedicated JWT token for authenticated user
 */
export const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id || user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'researcher',
      authProvider: user.authProvider || 'local'
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Verify dedicated JWT token middleware
 */
export const verifyJwt = async (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Dedicated JWT token required.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session. User belonging to this JWT no longer exists.'
      });
    }

    req.user = user;
    req.jwtClaims = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.name === 'TokenExpiredError' 
        ? 'Dedicated JWT token has expired. Please log in again.' 
        : 'Invalid dedicated JWT token signature.'
    });
  }
};
