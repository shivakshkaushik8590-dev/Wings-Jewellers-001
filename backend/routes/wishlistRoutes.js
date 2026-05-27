const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist', 'name price images isCustomizable');
    res.json({ success: true, data: user.wishlist });
  } catch (error) {
    next(error);
  }
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
router.post('/', protect, async (req, res, next) => {
  const { productId } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ success: false, message: 'Product already in wishlist' });
    }

    user.wishlist.push(productId);
    await user.save();

    res.json({ success: true, message: 'Product added to wishlist', data: user.wishlist });
  } catch (error) {
    next(error);
  }
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
router.delete('/:productId', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.productId);
    await user.save();

    res.json({ success: true, message: 'Product removed from wishlist', data: user.wishlist });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
