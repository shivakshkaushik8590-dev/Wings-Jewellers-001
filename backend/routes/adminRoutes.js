const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Review = require('../models/Review');
const Coupon = require('../models/Coupon');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
router.get('/dashboard', protect, admin, async (req, res, next) => {
  try {
    const ordersCount = await Order.countDocuments({});
    const productsCount = await Product.countDocuments({});
    const usersCount = await User.countDocuments({});
    
    // Calculate total sales revenue (Paid orders only)
    const paidOrders = await Order.find({ isPaid: true });
    const totalSales = paidOrders.reduce((acc, order) => acc + order.totalPrice, 0);

    // Get list of pending reviews awaiting moderation
    const pendingReviews = await Review.find({ isApproved: false })
      .populate('product', 'name')
      .populate('user', 'name');

    // Recent orders
    const recentOrders = await Order.find({})
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        stats: {
          totalSales: Math.round(totalSales * 100) / 100,
          ordersCount,
          productsCount,
          usersCount
        },
        pendingReviews,
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update order shipping/delivery tracking status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
router.put('/orders/:id/status', protect, admin, async (req, res, next) => {
  const { status, description } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    order.orderStatus = status;

    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    order.trackingHistory.push({
      status,
      description: description || `Order status updated to ${status}`
    });

    const updatedOrder = await order.save();

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: updatedOrder
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get products with low inventory stock
// @route   GET /api/admin/inventory-alerts
// @access  Private/Admin
router.get('/inventory-alerts', protect, admin, async (req, res, next) => {
  const threshold = Number(req.query.threshold) || 5;

  try {
    const products = await Product.find({ inventory: { $lt: threshold } }).populate('category', 'name');
    
    res.json({
      success: true,
      count: products.length,
      threshold,
      data: products
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all coupons
// @route   GET /api/admin/coupons
// @access  Private/Admin
router.get('/coupons', protect, admin, async (req, res, next) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json({ success: true, count: coupons.length, data: coupons });
  } catch (error) {
    next(error);
  }
});

// @desc    Create a new coupon
// @route   POST /api/admin/coupons
// @access  Private/Admin
router.post('/coupons', protect, admin, async (req, res, next) => {
  const { code, discountType, discountValue, minPurchase, expiryDate } = req.body;

  try {
    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });

    if (couponExists) {
      res.status(400);
      throw new Error('Coupon code already exists');
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minPurchase: minPurchase || 0,
      expiryDate
    });

    const createdCoupon = await coupon.save();
    res.status(201).json({ success: true, data: createdCoupon });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete a coupon
// @route   DELETE /api/admin/coupons/:id
// @access  Private/Admin
router.delete('/coupons/:id', protect, admin, async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
      await Coupon.deleteOne({ _id: req.params.id });
      res.json({ success: true, message: 'Coupon deleted successfully' });
    } else {
      res.status(404);
      throw new Error('Coupon not found');
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
