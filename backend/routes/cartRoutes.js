const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product', 'name price images isCustomizable');
    res.json({ success: true, data: user.cart });
  } catch (error) {
    next(error);
  }
});

// @desc    Add item to cart (with optional customization details)
// @route   POST /api/cart
// @access  Private
router.post('/', protect, async (req, res, next) => {
  const { productId, quantity, customization } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Check if item with same product and exact customization already exists
    const existingIndex = user.cart.findIndex(item => {
      if (item.product.toString() !== productId) return false;
      
      // If one has customization and other doesn't
      if ((item.customization && !customization) || (!item.customization && customization)) return false;
      
      // Compare customization attributes
      if (item.customization && customization) {
        return JSON.stringify(item.customization) === JSON.stringify(customization);
      }
      
      return true;
    });

    if (existingIndex > -1) {
      user.cart[existingIndex].quantity += Number(quantity || 1);
    } else {
      user.cart.push({
        product: productId,
        quantity: Number(quantity || 1),
        customization
      });
    }

    await user.save();
    
    const updatedUser = await User.findById(req.user._id).populate('cart.product', 'name price images isCustomizable');
    res.json({ success: true, message: 'Item added to cart', data: updatedUser.cart });
  } catch (error) {
    next(error);
  }
});

// @desc    Update cart item quantity or customization
// @route   PUT /api/cart
// @access  Private
router.put('/', protect, async (req, res, next) => {
  const { productId, quantity, customization, targetCustomization } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Find the cart item with match product and optionally match target customization
    const itemIndex = user.cart.findIndex(item => {
      if (item.product.toString() !== productId) return false;
      if (targetCustomization) {
        return JSON.stringify(item.customization) === JSON.stringify(targetCustomization);
      }
      return true;
    });

    if (itemIndex === -1) {
      res.status(404);
      throw new Error('Cart item not found');
    }

    if (quantity !== undefined) {
      user.cart[itemIndex].quantity = Number(quantity);
    }
    
    if (customization !== undefined) {
      user.cart[itemIndex].customization = customization;
    }

    await user.save();
    
    const updatedUser = await User.findById(req.user._id).populate('cart.product', 'name price images isCustomizable');
    res.json({ success: true, message: 'Cart updated', data: updatedUser.cart });
  } catch (error) {
    next(error);
  }
});

// @desc    Remove an item from cart
// @route   POST /api/cart/remove
// @access  Private
router.post('/remove', protect, async (req, res, next) => {
  const { productId, customization } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.cart = user.cart.filter(item => {
      if (item.product.toString() !== productId) return true;
      if (customization) {
        return JSON.stringify(item.customization) !== JSON.stringify(customization);
      }
      return false; // Remove all matching product if no specific customization filter is passed
    });

    await user.save();

    const updatedUser = await User.findById(req.user._id).populate('cart.product', 'name price images isCustomizable');
    res.json({ success: true, message: 'Item removed from cart', data: updatedUser.cart });
  } catch (error) {
    next(error);
  }
});

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
router.delete('/', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.cart = [];
    await user.save();

    res.json({ success: true, message: 'Cart cleared', data: [] });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
