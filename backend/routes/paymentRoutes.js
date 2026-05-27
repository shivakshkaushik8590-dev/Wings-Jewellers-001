const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Initialize Razorpay Instance
let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockKeyId123',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'mockRazorpaySecret456'
  });
} catch (error) {
  console.error('Razorpay initialization failed:', error.message);
}

// @desc    Create Razorpay Order
// @route   POST /api/payment/razorpay/create
// @access  Private
router.post('/razorpay/create', protect, async (req, res, next) => {
  const { amount, orderId } = req.body; // amount in INR, orderId in our system database

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Amount in Razorpay should be in paise (e.g. INR 100 = 10000 paise)
    const amountInPaise = Math.round(Number(amount) * 100);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_order_${orderId.substring(0, 10)}`
    };

    // If using mock Razorpay (no keys or mock environment), bypass actual network request
    if (process.env.RAZORPAY_KEY_ID === 'rzp_test_mockKeyId123' || !process.env.RAZORPAY_KEY_ID) {
      const mockRazorpayOrderId = `rzp_order_mock_${Date.now()}`;
      order.razorpayOrderId = mockRazorpayOrderId;
      await order.save();

      return res.status(200).json({
        success: true,
        message: 'Mock Razorpay order created',
        data: {
          id: mockRazorpayOrderId,
          amount: amountInPaise,
          currency: 'INR',
          key: 'rzp_test_mockKeyId123'
        }
      });
    }

    const razorpayOrder = await razorpay.orders.create(options);
    
    // Save Razorpay Order ID to our local Order model
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.status(200).json({
      success: true,
      data: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/payment/razorpay/verify
// @access  Private
router.post('/razorpay/verify', protect, async (req, res, next) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId
  } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    let isSignatureValid = false;

    // Handle mock signature verification for dev
    if (
      (process.env.RAZORPAY_KEY_ID === 'rzp_test_mockKeyId123' || !process.env.RAZORPAY_KEY_ID) &&
      razorpay_payment_id.startsWith('pay_mock_')
    ) {
      isSignatureValid = true;
    } else {
      // Create HMAC SHA256 signature to verify
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'mockRazorpaySecret456')
        .update(body.toString())
        .digest('hex');

      isSignatureValid = expectedSignature === razorpay_signature;
    }

    if (isSignatureValid) {
      // 1. Update Order status
      order.isPaid = true;
      order.paidAt = Date.now();
      order.orderStatus = 'Processing';
      order.paymentResult = {
        id: razorpay_payment_id,
        status: 'Success',
        update_time: new Date().toISOString(),
        signature: razorpay_signature
      };
      
      order.trackingHistory.push({
        status: 'Processing',
        description: 'Payment verified successfully. Order is being processed.'
      });

      await order.save();

      // 2. Reduce inventory counts for product purchases
      for (const item of order.orderItems) {
        if (item.product) {
          const product = await Product.findById(item.product);
          if (product) {
            product.inventory = Math.max(0, product.inventory - item.quantity);
            await product.save();
          }
        }
      }

      res.status(200).json({
        success: true,
        message: 'Payment verification successful and inventory updated',
        data: order
      });
    } else {
      res.status(400);
      throw new Error('Invalid Razorpay signature. Payment validation failed.');
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
