const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ============================================================
// ORDER STATUS LIFECYCLE
// Placed → Processing → Crafting → Shipped → Delivered
//                                          → Cancelled
//                                          → Returned → Refunded
// ============================================================

const STATUS_FLOW = [
  'Placed',
  'Processing',
  'Crafting',
  'Shipped',
  'Delivered'
];

const STATUS_DESCRIPTIONS = {
  Placed:     'Your order has been placed successfully and is awaiting payment confirmation.',
  Processing: 'Payment confirmed! Our team is preparing your order.',
  Crafting:   'Our master artisans are handcrafting your jewellery with care.',
  Shipped:    'Your order has been dispatched and is on its way to you.',
  Delivered:  'Your order has been delivered. Enjoy your Wings Jewellery!',
  Cancelled:  'This order has been cancelled.',
  Returned:   'Return request received. Your item is on its way back to us.',
  Refunded:   'Refund has been processed to your original payment method.'
};

// ----------------------------------------------------------
// POST /api/orders — Create a new order
// @access Private
// ----------------------------------------------------------
router.post('/', protect, async (req, res, next) => {
  const { orderItems, shippingAddress, couponCode } = req.body;

  try {
    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items provided');
    }

    // 1. Calculate pricing details and validate inventory / products
    let itemsPrice = 0;
    const finalOrderItems = [];

    for (const item of orderItems) {
      let price = 0;
      let name  = '';

      if (item.product) {
        const dbProduct = await Product.findById(item.product);
        if (!dbProduct) {
          res.status(404);
          throw new Error(`Product not found: ${item.product}`);
        }
        if (dbProduct.inventory < item.quantity) {
          res.status(400);
          throw new Error(`Insufficient stock for: ${dbProduct.name}`);
        }
        price = dbProduct.price;
        name  = dbProduct.name;
      } else {
        // Fully bespoke custom pieces not bound to a catalogue product
        price = item.price;
        name  = item.name || 'Bespoke Custom Jewellery';
      }

      itemsPrice += price * item.quantity;

      finalOrderItems.push({
        product:       item.product,
        name,
        quantity:      item.quantity,
        price,
        customization: item.customization
      });
    }

    // 2. Apply coupon discount
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon && coupon.isValid(itemsPrice)) {
        discountAmount = coupon.discountType === 'percentage'
          ? (itemsPrice * coupon.discountValue) / 100
          : coupon.discountValue;
        itemsPrice = Math.max(0, itemsPrice - discountAmount);
      }
    }

    // 3. Tax and shipping
    const taxPrice      = Math.round(itemsPrice * 0.03 * 100) / 100; // 3% GST
    const shippingPrice = itemsPrice > 500 ? 0 : 50;                 // Free above ₹500
    const totalPrice    = itemsPrice + taxPrice + shippingPrice;

    // 4. Create order
    const order = new Order({
      user:         req.user._id,
      orderItems:   finalOrderItems,
      shippingAddress,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      orderStatus:  'Placed',
      trackingHistory: [{
        status:      'Placed',
        description: STATUS_DESCRIPTIONS.Placed
      }]
    });

    const createdOrder = await order.save();

    // 5. Clear user's cart
    const user  = await User.findById(req.user._id);
    user.cart   = [];
    await user.save();

    res.status(201).json({ success: true, data: createdOrder });
  } catch (error) {
    next(error);
  }
});

// ----------------------------------------------------------
// GET /api/orders — Get all orders for logged-in user
// @access Private
// ----------------------------------------------------------
router.get('/', protect, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.orderStatus = status;

    const total  = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      count:   orders.length,
      total,
      page:    Number(page),
      pages:   Math.ceil(total / limit),
      data:    orders
    });
  } catch (error) {
    next(error);
  }
});

// ----------------------------------------------------------
// GET /api/orders/:id — Get single order by ID
// @access Private (owner or admin)
// ----------------------------------------------------------
router.get('/:id', protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

// ----------------------------------------------------------
// GET /api/orders/:id/track — Full tracking timeline
// @access Private (owner or admin)
// ----------------------------------------------------------
router.get('/:id/track', protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to track this order');
    }

    // Build a visual-friendly timeline for the frontend
    const timeline = STATUS_FLOW.map((step, idx) => {
      const historyEntry = order.trackingHistory.find(h => h.status === step);
      const currentIdx   = STATUS_FLOW.indexOf(order.orderStatus);
      let state = 'pending';
      if (historyEntry)                   state = 'completed';
      else if (idx === currentIdx + 1)    state = 'active';

      return {
        step:        idx + 1,
        status:      step,
        label:       step,
        description: historyEntry ? historyEntry.description : STATUS_DESCRIPTIONS[step],
        timestamp:   historyEntry ? historyEntry.timestamp : null,
        state
      };
    });

    res.json({
      success: true,
      data: {
        orderId:        order._id,
        orderStatus:    order.orderStatus,
        isPaid:         order.isPaid,
        isDelivered:    order.isDelivered,
        cancelReason:   order.cancelReason,
        returnReason:   order.returnReason,
        cancelledAt:    order.cancelledAt,
        returnedAt:     order.returnedAt,
        trackingHistory: order.trackingHistory,
        timeline
      }
    });
  } catch (error) {
    next(error);
  }
});

// ----------------------------------------------------------
// POST /api/orders/:id/cancel — Customer requests cancellation
// @access Private (owner only; only Placed or Processing)
// ----------------------------------------------------------
router.post('/:id/cancel', protect, async (req, res, next) => {
  const { reason } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (order.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to cancel this order');
    }

    const cancellableStatuses = ['Placed', 'Processing'];
    if (!cancellableStatuses.includes(order.orderStatus)) {
      res.status(400);
      throw new Error(
        `Cannot cancel an order that is already '${order.orderStatus}'. ` +
        `Please contact our concierge for Crafting/Shipped orders.`
      );
    }

    order.orderStatus = 'Cancelled';
    order.cancelReason = reason || 'Cancelled by customer';
    order.cancelledAt  = new Date();
    order.trackingHistory.push({
      status:      'Cancelled',
      description: reason ? `Cancelled: ${reason}` : 'Order cancelled by customer.'
    });

    const updatedOrder = await order.save();
    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data:    updatedOrder
    });
  } catch (error) {
    next(error);
  }
});

// ----------------------------------------------------------
// POST /api/orders/:id/return — Customer requests return
// @access Private (owner only; only Delivered orders)
// ----------------------------------------------------------
router.post('/:id/return', protect, async (req, res, next) => {
  const { reason } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (order.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to return this order');
    }

    if (order.orderStatus !== 'Delivered') {
      res.status(400);
      throw new Error('Only delivered orders are eligible for return.');
    }

    order.orderStatus = 'Returned';
    order.returnReason = reason || 'Return requested by customer';
    order.returnedAt   = new Date();
    order.trackingHistory.push({
      status:      'Returned',
      description: reason
        ? `Return requested: ${reason}`
        : 'Return request received. Our team will contact you.'
    });

    const updatedOrder = await order.save();
    res.json({
      success: true,
      message: 'Return request submitted. Our concierge will reach out shortly.',
      data:    updatedOrder
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
