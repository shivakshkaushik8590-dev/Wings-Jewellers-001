const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'wings_jewellers_jwt_secret_dev_key_12345';

// --------------------------------------------------
// PROTECT: Verify JWT access token on every request
// --------------------------------------------------
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify the short-lived access token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Attach user to request (exclude sensitive fields)
      req.user = await User.findById(decoded.id).select('-password -refreshToken');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User account not found. Token may be outdated.'
        });
      }

      next();
    } catch (error) {
      // Distinguish between expired and invalid tokens
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          code: 'TOKEN_EXPIRED',
          message: 'Access token has expired. Please use /api/auth/refresh to get a new one.'
        });
      }
      return res.status(401).json({
        success: false,
        code: 'TOKEN_INVALID',
        message: 'Not authorized — invalid token signature.'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      code: 'NO_TOKEN',
      message: 'Not authorized — no access token provided in Authorization header.'
    });
  }
};

// --------------------------------------------------
// ADMIN: Restrict to admin-role users only
// --------------------------------------------------
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      code: 'FORBIDDEN',
      message: 'Access denied — administrator role is required for this action.'
    });
  }
};

// --------------------------------------------------
// OPTIONAL AUTH: Attach user if token exists, but
// don't block the request if it doesn't (for public
// routes that benefit from knowing who the user is)
// --------------------------------------------------
const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password -refreshToken');
    } catch (e) {
      // Token invalid/expired — continue without user context
      req.user = null;
    }
  }
  next();
};

module.exports = { protect, admin, optionalAuth };
