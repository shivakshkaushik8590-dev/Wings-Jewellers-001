const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res, next) => {
  const { orderItems, shippingAddress, couponCode } = req.body;

  try {
    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items provided');
    }

    // 1. Calculate pricing details and validate inventory/products
    let itemsPrice = 0;
    const finalOrderItems = [];

    for (const item of orderItems) {
      let price = 0;
      let name = '';

      if (item.product) {
        const dbProduct = await Product.findById(item.product);
        if (!dbProduct) {
          res.status(404);
          throw new Error(`Product not found: ${item.product}`);
        }
        if (dbProduct.inventory < item.quantity) {
          res.status(400);
          throw new Error(`Insufficient stock for product: ${dbProduct.name}`);
        }
        price = dbProduct.price;
        name = dbProduct.name;
      } else {
        // Fully custom items without pre-defined products (customizer bespoke pieces)
        price = item.price;
        name = item.name || 'Bespoke Custom Jewelry';
      }

      itemsPrice += price * item.quantity;
      
      finalOrderItems.push({
        product: item.product,
        name,
        quantity: item.quantity,
        price,
        customization: item.customization
      });
    }

    // Apply Coupon discount if code is passed
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon && coupon.isValid(itemsPrice)) {
        if (coupon.discountType === 'percentage') {
          discountAmount = (itemsPrice * coupon.discountValue) / 100;
        } else {
          discountAmount = coupon.discountValue;
        }
        itemsPrice = Math.max(0, itemsPrice - discountAmount);
      }
    }

    // Tax and Shipping pricing calculations (example defaults)
    const taxPrice = Math.round(itemsPrice * 0.03 * 100) / 100; // 3% tax
    const shippingPrice = itemsPrice > 500 ? 0 : 50; // free shipping over INR 500
    const totalPrice = itemsPrice + taxPrice + shippingPrice;

    // 2. Create the order
    const order = new Order({
      user: req.user._id,
      orderItems: finalOrderItems,
      shippingAddress,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      trackingHistory: [{
        status: 'Pending',
        description: 'Order placed, awaiting payment confirmation.'
      }]
    });

    const createdOrder = await order.save();

    // 3. Clear user's cart
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();

    res.status(201).json({
      success: true,
      data: createdOrder
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
      // Check authorization (Must be owner or admin)
      if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to view this order');
      }

      res.json({ success: true, data: order });
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Get tracking details for an order
// @route   GET /api/orders/:id/track
// @access  Private
router.get('/:id/track', protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to track this order');
      }

      res.json({
        success: true,
        data: {
          orderId: order._id,
          orderStatus: order.orderStatus,
          isPaid: order.isPaid,
          isDelivered: order.isDelivered,
          trackingHistory: order.trackingHistory
        }
      });
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
