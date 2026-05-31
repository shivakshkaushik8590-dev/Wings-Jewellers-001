const express = require('express');
const Order   = require('../models/Order');
const Product = require('../models/Product');
const User    = require('../models/User');
const Review  = require('../models/Review');
const Coupon  = require('../models/Coupon');
const { protect, admin } = require('../middleware/authMiddleware');
const { validateCoupon } = require('../middleware/validationMiddleware');

const router = express.Router();

// All routes require authentication + admin role
router.use(protect, admin);

// ================================================================
// DASHBOARD ANALYTICS
// GET /api/admin/dashboard
// ================================================================
router.get('/dashboard', async (req, res, next) => {
  try {
    const [
      ordersCount,
      productsCount,
      usersCount,
      reviewsCount
    ] = await Promise.all([
      Order.countDocuments({}),
      Product.countDocuments({}),
      User.countDocuments({ role: 'user' }),
      Review.countDocuments({ isApproved: false })
    ]);

    // Revenue metrics (paid orders only)
    const paidOrders  = await Order.find({ isPaid: true }).select('totalPrice createdAt');
    const totalSales  = paidOrders.reduce((acc, o) => acc + o.totalPrice, 0);

    // Monthly revenue breakdown (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlySalesRaw = await Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id:      { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue:  { $sum: '$totalPrice' },
          orders:   { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    const monthlySales = monthlySalesRaw.map(m => ({
      month:   `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
      revenue: Math.round(m.revenue * 100) / 100,
      orders:  m.orders
    }));

    // Order status distribution
    const statusCounts = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ]);
    const ordersByStatus = {};
    statusCounts.forEach(s => { ordersByStatus[s._id] = s.count; });

    // Recent orders (last 10)
    const recentOrders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('user orderStatus totalPrice isPaid createdAt');

    // Low inventory products (below threshold=5)
    const lowStock = await Product.find({ inventory: { $lt: 5 } })
      .select('name inventory')
      .limit(10);

    // Pending reviews
    const pendingReviews = await Review.find({ isApproved: false })
      .populate('product', 'name')
      .populate('user', 'name')
      .limit(10);

    res.json({
      success: true,
      data: {
        stats: {
          totalSales:    Math.round(totalSales * 100) / 100,
          ordersCount,
          productsCount,
          usersCount,
          pendingReviewsCount: reviewsCount
        },
        ordersByStatus,
        monthlySales,
        recentOrders,
        lowStock,
        pendingReviews
      }
    });
  } catch (error) {
    next(error);
  }
});

// ================================================================
// ORDER MANAGEMENT
// ================================================================

// GET /api/admin/orders — List all orders (with filters & pagination)
router.get('/orders', async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (status) filter.orderStatus = status;

    const total  = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('user', 'name email')
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

// PUT /api/admin/orders/:id/status — Update order tracking status
router.put('/orders/:id/status', async (req, res, next) => {
  const { status, description } = req.body;

  const VALID_STATUSES = [
    'Placed', 'Processing', 'Crafting', 'Shipped', 'Delivered',
    'Cancelled', 'Returned', 'Refunded'
  ];

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
    });
  }

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
    if (status === 'Cancelled') {
      order.cancelledAt = Date.now();
      if (req.body.reason) order.cancelReason = req.body.reason;
    }
    if (status === 'Returned') {
      order.returnedAt = Date.now();
      if (req.body.reason) order.returnReason = req.body.reason;
    }

    order.trackingHistory.push({
      status,
      description: description || `Order status updated to '${status}' by admin.`
    });

    const updatedOrder = await order.save();
    res.json({
      success: true,
      message: `Order status updated to '${status}'`,
      data:    updatedOrder
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/orders/:id — Soft-delete (cancelled) or hard-delete an order
router.delete('/orders/:id', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    await Order.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Order removed from system' });
  } catch (error) {
    next(error);
  }
});

// ================================================================
// PRODUCT MANAGEMENT
// ================================================================

// GET /api/admin/products — All products (with inventory info)
router.get('/products', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search)   filter.name     = { $regex: search, $options: 'i' };

    const total    = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      count:   products.length,
      total,
      page:    Number(page),
      pages:   Math.ceil(total / limit),
      data:    products
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/products — Create product
router.post('/products', async (req, res, next) => {
  try {
    const { name, description, price, category, inventory, images, isCustomizable } = req.body;
    const product = await Product.create({
      name, description, price, category,
      inventory: inventory || 10,
      images:    images    || [],
      isCustomizable: isCustomizable || false
    });
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/products/:id — Update product
router.put('/products/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    const fields = ['name', 'description', 'price', 'category', 'inventory', 'images', 'isCustomizable'];
    fields.forEach(f => { if (req.body[f] !== undefined) product[f] = req.body[f]; });
    const updated = await product.save();
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/products/:id — Remove product
router.delete('/products/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    await Product.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/products/:id/replenish — Replenish inventory
router.put('/products/:id/replenish', async (req, res, next) => {
  try {
    const { quantity = 50 } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { inventory: quantity } },
      { new: true }
    );
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }
    res.json({ success: true, message: `Added ${quantity} units`, data: product });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/replenish-all — Bulk replenish all low stock
router.put('/replenish-all', async (req, res, next) => {
  try {
    const threshold     = Number(req.query.threshold) || 5;
    const replenishTo   = Number(req.body.replenishTo) || 50;
    const lowStockItems = await Product.find({ inventory: { $lt: threshold } });

    await Promise.all(
      lowStockItems.map(p => {
        p.inventory = replenishTo;
        return p.save();
      })
    );

    res.json({
      success:     true,
      message:     `Replenished ${lowStockItems.length} products to ${replenishTo} units each`,
      replenished: lowStockItems.map(p => ({ _id: p._id, name: p.name }))
    });
  } catch (error) {
    next(error);
  }
});

// ================================================================
// USER MANAGEMENT
// ================================================================

// GET /api/admin/users — All users with pagination
router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const filter = {};
    if (role)   filter.role = role;
    if (search) filter.$or  = [
      { name:  { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      count:   users.length,
      total,
      page:    Number(page),
      pages:   Math.ceil(total / limit),
      data:    users
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/users/:id — Get a specific user
router.get('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshToken');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    const orders = await Order.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .select('orderStatus totalPrice createdAt');
    res.json({ success: true, data: { user, orders } });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/users/:id/role — Promote / demote user role
router.put('/users/:id/role', async (req, res, next) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Role must be "user" or "admin"' });
  }
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, select: '-password -refreshToken' }
    );
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    res.json({ success: true, message: `User role updated to '${role}'`, data: user });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/users/:id — Remove user account
router.delete('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    await User.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'User account removed' });
  } catch (error) {
    next(error);
  }
});

// ================================================================
// REVIEWS MODERATION
// ================================================================

// GET /api/admin/reviews — All pending reviews
router.get('/reviews', async (req, res, next) => {
  try {
    const { approved = 'false', page = 1, limit = 20 } = req.query;
    const filter = { isApproved: approved === 'true' };
    const total   = await Review.countDocuments(filter);
    const reviews = await Review.find(filter)
      .populate('product', 'name')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, count: reviews.length, total, data: reviews });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/reviews/:id/approve — Approve a review
router.put('/reviews/:id/approve', async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }

    // Recalculate product average rating
    const Product = require('../models/Product');
    const allApproved = await Review.find({ product: review.product, isApproved: true });
    if (allApproved.length > 0) {
      const avg = allApproved.reduce((s, r) => s + r.rating, 0) / allApproved.length;
      await Product.findByIdAndUpdate(review.product, {
        'ratings.average': Math.round(avg * 10) / 10,
        'ratings.count':   allApproved.length
      });
    }

    res.json({ success: true, message: 'Review approved and published', data: review });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/reviews/:id — Remove a review
router.delete('/reviews/:id', async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }
    await Review.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Review removed' });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/reviews/approve-all — Bulk approve all pending
router.put('/reviews/approve-all', async (req, res, next) => {
  try {
    const result = await Review.updateMany({ isApproved: false }, { isApproved: true });
    res.json({
      success: true,
      message: `${result.modifiedCount} reviews approved`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    next(error);
  }
});

// ================================================================
// INVENTORY ALERTS
// ================================================================

// GET /api/admin/inventory-alerts — Products below threshold
router.get('/inventory-alerts', async (req, res, next) => {
  const threshold = Number(req.query.threshold) || 5;
  try {
    const products = await Product.find({ inventory: { $lt: threshold } })
      .populate('category', 'name')
      .sort({ inventory: 1 });

    res.json({ success: true, count: products.length, threshold, data: products });
  } catch (error) {
    next(error);
  }
});

// ================================================================
// COUPON MANAGEMENT
// ================================================================

// GET /api/admin/coupons
router.get('/coupons', async (req, res, next) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json({ success: true, count: coupons.length, data: coupons });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/coupons — Create coupon
router.post('/coupons', validateCoupon, async (req, res, next) => {
  const { code, discountType, discountValue, minPurchase, expiryDate } = req.body;
  try {
    const exists = await Coupon.findOne({ code: code.toUpperCase() });
    if (exists) {
      res.status(400);
      throw new Error('Coupon code already exists');
    }
    const coupon = await Coupon.create({
      code:          code.toUpperCase(),
      discountType,
      discountValue,
      minPurchase:   minPurchase || 0,
      expiryDate
    });
    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/coupons/:id — Toggle active/inactive
router.put('/coupons/:id', async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      res.status(404);
      throw new Error('Coupon not found');
    }
    const fields = ['discountType', 'discountValue', 'minPurchase', 'expiryDate', 'isActive'];
    fields.forEach(f => { if (req.body[f] !== undefined) coupon[f] = req.body[f]; });
    const updated = await coupon.save();
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/coupons/:id — Remove coupon
router.delete('/coupons/:id', async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      res.status(404);
      throw new Error('Coupon not found');
    }
    await Coupon.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    next(error);
  }
});

// ================================================================
// ANALYTICS
// ================================================================

// GET /api/admin/analytics/revenue — Revenue summary
router.get('/analytics/revenue', async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    const daysMap = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
    const days    = daysMap[period] || 30;
    const since   = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const data = await Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            year:  { $year:  '$createdAt' },
            month: { $month: '$createdAt' },
            day:   { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$totalPrice' },
          orders:  { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    const formatted = data.map(d => ({
      date:    `${d._id.year}-${String(d._id.month).padStart(2,'0')}-${String(d._id.day).padStart(2,'0')}`,
      revenue: Math.round(d.revenue * 100) / 100,
      orders:  d.orders
    }));

    res.json({ success: true, period, data: formatted });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/analytics/top-products — Best-selling products
router.get('/analytics/top-products', async (req, res, next) => {
  try {
    const top = await Order.aggregate([
      { $unwind: '$orderItems' },
      { $match: { 'orderItems.product': { $ne: null } } },
      {
        $group: {
          _id:      '$orderItems.product',
          name:     { $first: '$orderItems.name' },
          totalQty: { $sum: '$orderItems.quantity' },
          revenue:  { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } }
        }
      },
      { $sort: { totalQty: -1 } },
      { $limit: 10 }
    ]);
    res.json({ success: true, data: top });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
