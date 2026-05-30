const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { validateRegister } = require('../middleware/validationMiddleware');

const router = express.Router();

// --------------------------------------------------
// TOKEN HELPERS
// --------------------------------------------------

const JWT_SECRET         = process.env.JWT_SECRET         || 'wings_jewellers_jwt_secret_dev_key_12345';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'wings_jewellers_refresh_secret_dev_99999';
const JWT_EXPIRE         = process.env.JWT_EXPIRE          || '15m';    // Short-lived access token
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE  || '30d';   // Long-lived refresh token

/**
 * Generate a short-lived JWT access token (15 min default)
 */
const generateAccessToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

/**
 * Generate a long-lived JWT refresh token (30 days default)
 */
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRE });
};

/**
 * Hash a refresh token with SHA-256 before storing in DB
 * (avoids storing plaintext tokens)
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Set refresh token in secure HTTP-only cookie + store hash in DB
 */
const attachRefreshToken = async (res, user, refreshToken) => {
  // Store hashed refresh token in DB
  user.refreshToken = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  // Set HTTP-only cookie (not accessible via JS)
  res.cookie('wings_refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });
};

// --------------------------------------------------
// 1. REGISTER
// @route   POST /api/auth/register
// @access  Public
// --------------------------------------------------
router.post('/register', validateRegister, async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists with this email');
    }

    const user = await User.create({ name, email, password });

    if (user) {
      const accessToken  = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);
      await attachRefreshToken(res, user, refreshToken);

      res.status(201).json({
        success: true,
        data: {
          _id:         user._id,
          name:        user.name,
          email:       user.email,
          role:        user.role,
          accessToken,
          // refreshToken is in HTTP-only cookie — do NOT send in body
        }
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data provided');
    }
  } catch (error) {
    next(error);
  }
});

// --------------------------------------------------
// 2. LOGIN
// @route   POST /api/auth/login
// @access  Public
// --------------------------------------------------
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password +refreshToken');

    if (user && (await user.matchPassword(password))) {
      const accessToken  = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);
      await attachRefreshToken(res, user, refreshToken);

      res.json({
        success: true,
        data: {
          _id:         user._id,
          name:        user.name,
          email:       user.email,
          role:        user.role,
          accessToken,
        }
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
});

// --------------------------------------------------
// 3. REFRESH ACCESS TOKEN
// @route   POST /api/auth/refresh
// @access  Public (uses HTTP-only cookie)
// --------------------------------------------------
router.post('/refresh', async (req, res, next) => {
  try {
    const incomingRefreshToken = req.cookies?.wings_refresh_token;

    if (!incomingRefreshToken) {
      res.status(401);
      throw new Error('No refresh token provided');
    }

    // Verify the refresh token signature
    let decoded;
    try {
      decoded = jwt.verify(incomingRefreshToken, JWT_REFRESH_SECRET);
    } catch (err) {
      res.status(401);
      throw new Error('Refresh token is invalid or expired. Please log in again.');
    }

    // Find user and check hashed token matches what we stored
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== hashToken(incomingRefreshToken)) {
      res.status(401);
      throw new Error('Refresh token revoked or user not found. Please log in again.');
    }

    // Issue new access token + rotate refresh token (security best practice)
    const newAccessToken  = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    await attachRefreshToken(res, user, newRefreshToken);

    res.json({
      success: true,
      data: { accessToken: newAccessToken }
    });
  } catch (error) {
    next(error);
  }
});

// --------------------------------------------------
// 4. LOGOUT (revoke refresh token)
// @route   POST /api/auth/logout
// @access  Private
// --------------------------------------------------
router.post('/logout', protect, async (req, res, next) => {
  try {
    // Revoke stored refresh token in DB
    const user = await User.findById(req.user._id).select('+refreshToken');
    if (user) {
      user.refreshToken = null;
      await user.save({ validateBeforeSave: false });
    }

    // Clear HTTP-only cookie
    res.clearCookie('wings_refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict'
    });

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

// --------------------------------------------------
// 5. GET USER PROFILE
// @route   GET /api/auth/profile
// @access  Private
// --------------------------------------------------
router.get('/profile', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        success: true,
        data: {
          _id:      user._id,
          name:     user.name,
          email:    user.email,
          role:     user.role,
          cart:     user.cart,
          wishlist: user.wishlist,
          createdAt: user.createdAt
        }
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
});

// --------------------------------------------------
// 6. UPDATE USER PROFILE
// @route   PUT /api/auth/profile
// @access  Private
// --------------------------------------------------
router.put('/profile', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name  = req.body.name  || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      const newAccessToken = generateAccessToken(updatedUser._id);

      res.json({
        success: true,
        data: {
          _id:         updatedUser._id,
          name:        updatedUser.name,
          email:       updatedUser.email,
          role:        updatedUser.role,
          accessToken: newAccessToken
        }
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
