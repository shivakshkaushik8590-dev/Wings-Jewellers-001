const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { Cashfree } = require('cashfree-pg');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// --------------------------------------------------
// 1. DUAL PAYMENT GATEWAY INITIALIZATION
// --------------------------------------------------

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

// Initialize Cashfree Instance
try {
  Cashfree.XClientId = process.env.CASHFREE_APP_ID || 'cf_test_mockAppId123';
  Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY || 'mockCashfreeSecret456';
  Cashfree.XEnvironment = process.env.CASHFREE_ENV === 'production'
    ? Cashfree.Environment.PRODUCTION
    : Cashfree.Environment.SANDBOX;
} catch (error) {
  console.error('Cashfree configuration failed:', error.message);
}

const isCashfreeMockMode = () => {
  const appId = process.env.CASHFREE_APP_ID;
  return !appId || appId === 'cf_test_mockAppId123' || appId.startsWith('cf_test_mock');
};

const isRazorpayMockMode = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  return !keyId || keyId === 'rzp_test_mockKeyId123' || keyId.startsWith('rzp_test_mock');
};

// --------------------------------------------------
// 2. RAZORPAY GATEWAY ENDPOINTS
// --------------------------------------------------

// @desc    Create Razorpay Order
// @route   POST /api/payment/razorpay/create
// @access  Private
router.post('/razorpay/create', protect, async (req, res, next) => {
  const { amount, orderId } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    const amountInPaise = Math.round(Number(amount) * 100);

    // Mock Razorpay Order Creation
    if (isRazorpayMockMode()) {
      const mockRazorpayOrderId = `rzp_order_mock_${Date.now()}`;
      order.cashfreeOrderId = mockRazorpayOrderId; // store general gateway order id
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

    // Call Real Razorpay SDK
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_order_${orderId.substring(0, 10)}`
    };

    const razorpayOrder = await razorpay.orders.create(options);
    
    order.cashfreeOrderId = razorpayOrder.id; // store general gateway order id
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
    if (isRazorpayMockMode() && razorpay_payment_id.startsWith('pay_mock_')) {
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
      order.paymentMethod = 'Razorpay';
      order.paymentResult = {
        cfPaymentId: razorpay_payment_id,
        paymentStatus: 'PAID',
        paymentMessage: 'Razorpay Payment Signature Verified Successfully',
        paymentTime: new Date().toISOString()
      };
      
      order.trackingHistory.push({
        status: 'Processing',
        description: 'Payment verified successfully via Razorpay. Order is being processed.'
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

// --------------------------------------------------
// 3. CASHFREE GATEWAY ENDPOINTS
// --------------------------------------------------

// @desc    Create Cashfree Payment Session
// @route   POST /api/payment/cashfree/create
// @access  Private
router.post('/cashfree/create', protect, async (req, res, next) => {
  const { amount, orderId } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    const uniqueOrderId = `CF_ORDER_${orderId}_${Date.now()}`;

    // Handle Mock Mode
    if (isCashfreeMockMode()) {
      const mockPaymentSessionId = `cf_sess_mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      order.cashfreeOrderId = uniqueOrderId;
      order.paymentSessionId = mockPaymentSessionId;
      await order.save();

      return res.status(200).json({
        success: true,
        message: 'Mock Cashfree payment session created',
        data: {
          cf_order_id: uniqueOrderId,
          payment_session_id: mockPaymentSessionId,
          order_amount: Number(amount),
          order_currency: 'INR'
        }
      });
    }

    // Call Cashfree API using SDK
    const request = {
      order_id: uniqueOrderId,
      order_amount: Number(amount),
      order_currency: 'INR',
      customer_details: {
        customer_id: req.user._id.toString(),
        customer_email: req.user.email,
        customer_phone: order.shippingAddress.phone || '9999999999'
      },
      order_meta: {
        return_url: req.body.returnUrl || 'https://localhost:3000/payment-status?order_id={order_id}'
      }
    };

    const response = await Cashfree.PGCreateOrder("2023-08-01", request);
    
    if (response && response.data) {
      const cfOrder = response.data;
      
      order.cashfreeOrderId = cfOrder.cf_order_id || uniqueOrderId;
      order.paymentSessionId = cfOrder.payment_session_id;
      await order.save();

      res.status(200).json({
        success: true,
        data: cfOrder
      });
    } else {
      res.status(500);
      throw new Error('Failed to create payment order on Cashfree');
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Verify Cashfree Payment Status
// @route   POST /api/payment/cashfree/verify
// @access  Private
router.post('/cashfree/verify', protect, async (req, res, next) => {
  const { cf_order_id, orderId, mock_payment_id } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    let isPaymentPaid = false;
    let paymentDetails = {};

    // Handle Mock Verification
    if (isCashfreeMockMode()) {
      if (mock_payment_id && mock_payment_id.startsWith('pay_cf_mock_')) {
        isPaymentPaid = true;
        paymentDetails = {
          cfPaymentId: mock_payment_id,
          paymentStatus: 'PAID',
          paymentMessage: 'Mock Cashfree Payment Verified Successfully',
          paymentTime: new Date().toISOString()
        };
      } else {
        res.status(400);
        throw new Error('Mock payment ID must start with pay_cf_mock_');
      }
    } else {
      // Secure Backend-to-Backend validation via Cashfree API fetch
      const cfOrderIdToQuery = cf_order_id || order.cashfreeOrderId;
      if (!cfOrderIdToQuery) {
        res.status(400);
        throw new Error('Missing Cashfree order ID');
      }

      const response = await Cashfree.PGFetchOrder("2023-08-01", cfOrderIdToQuery);

      if (response && response.data) {
        const cfOrderDetails = response.data;
        if (cfOrderDetails.order_status === 'PAID') {
          isPaymentPaid = true;
          paymentDetails = {
            cfPaymentId: cfOrderDetails.cf_order_id,
            paymentStatus: cfOrderDetails.order_status,
            paymentMessage: 'Cashfree PG Payment Successful',
            paymentTime: cfOrderDetails.created_at || new Date().toISOString()
          };
        } else {
          res.status(400);
          throw new Error(`Order status is: ${cfOrderDetails.order_status}. Payment not completed.`);
        }
      } else {
        res.status(500);
        throw new Error('Failed to retrieve verification from Cashfree servers');
      }
    }

    if (isPaymentPaid) {
      // 1. Update Order status
      order.isPaid = true;
      order.paidAt = Date.now();
      order.orderStatus = 'Processing';
      order.paymentMethod = 'Cashfree';
      order.paymentResult = paymentDetails;
      
      order.trackingHistory.push({
        status: 'Processing',
        description: 'Payment verified successfully via Cashfree. Order is being processed.'
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
      throw new Error('Payment verification failed.');
    }
  } catch (error) {
    next(error);
  }
});

// --------------------------------------------------
// 4. RAZORPAY WEBHOOK
// @route   POST /api/payment/webhook/razorpay
// @access  Public (Razorpay servers — verified by signature)
// --------------------------------------------------

// IMPORTANT: This route needs raw body for signature verification.
// Ensure express.raw({ type: 'application/json' }) is applied BEFORE
// express.json() in server.js for this specific path.
router.post('/webhook/razorpay', express.raw({ type: 'application/json' }), async (req, res, next) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'razorpay_webhook_secret_dev';

  try {
    // 1. Verify Razorpay webhook signature
    const razorpaySignature = req.headers['x-razorpay-signature'];
    if (!razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Missing webhook signature header' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(req.body) // raw Buffer body
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      console.warn('[Razorpay Webhook] Invalid signature — potential spoofed request');
      return res.status(400).json({ success: false, message: 'Webhook signature verification failed' });
    }

    // 2. Parse and handle the event
    const event = JSON.parse(req.body.toString());
    const eventType = event.event;

    console.log(`[Razorpay Webhook] Event received: ${eventType}`);

    if (eventType === 'payment.captured') {
      const paymentEntity = event.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;

      // Find the matching order by cashfreeOrderId (reused for general gateway order ID)
      const order = await Order.findOne({ cashfreeOrderId: razorpayOrderId });

      if (order && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.orderStatus = 'Processing';
        order.paymentMethod = 'Razorpay';
        order.paymentResult = {
          cfPaymentId: paymentEntity.id,
          paymentStatus: 'PAID',
          paymentMessage: 'Razorpay webhook: payment.captured event received',
          paymentTime: new Date(paymentEntity.created_at * 1000).toISOString()
        };

        order.trackingHistory.push({
          status: 'Processing',
          description: 'Payment confirmed via Razorpay webhook. Order is being processed.'
        });

        await order.save();

        // Decrement inventory for all ordered items
        for (const item of order.orderItems) {
          if (item.product) {
            const product = await Product.findById(item.product);
            if (product) {
              product.inventory = Math.max(0, product.inventory - item.quantity);
              await product.save();
            }
          }
        }

        console.log(`[Razorpay Webhook] Order ${order._id} marked as PAID`);
      }
    } else if (eventType === 'payment.failed') {
      const paymentEntity = event.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const order = await Order.findOne({ cashfreeOrderId: razorpayOrderId });

      if (order) {
        order.trackingHistory.push({
          status: order.orderStatus,
          description: `Razorpay webhook: payment.failed — ${paymentEntity.error_description || 'Unknown error'}`
        });
        await order.save();
        console.warn(`[Razorpay Webhook] Payment failed for order ${order._id}`);
      }
    } else if (eventType === 'refund.processed') {
      console.log('[Razorpay Webhook] Refund processed event received');
    }

    // Always respond 200 OK quickly to Razorpay
    res.status(200).json({ success: true, message: 'Webhook received' });
  } catch (error) {
    console.error('[Razorpay Webhook] Error:', error.message);
    // Still return 200 to avoid Razorpay retrying
    res.status(200).json({ success: true, message: 'Webhook received with errors' });
  }
});

// --------------------------------------------------
// 5. CASHFREE WEBHOOK
// @route   POST /api/payment/webhook/cashfree
// @access  Public (Cashfree servers — verified by signature)
// --------------------------------------------------
router.post('/webhook/cashfree', express.raw({ type: 'application/json' }), async (req, res, next) => {
  const webhookSecret = process.env.CASHFREE_WEBHOOK_SECRET || 'cashfree_webhook_secret_dev';

  try {
    // 1. Verify Cashfree webhook signature
    // Cashfree uses: HMAC-SHA256(timestamp + raw_body, secret)
    const cfSignature = req.headers['x-webhook-signature'];
    const cfTimestamp = req.headers['x-webhook-timestamp'];

    if (!cfSignature || !cfTimestamp) {
      return res.status(400).json({ success: false, message: 'Missing Cashfree webhook headers' });
    }

    const rawBody = req.body.toString();
    const signaturePayload = cfTimestamp + rawBody;

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(signaturePayload)
      .digest('base64');

    if (expectedSignature !== cfSignature) {
      console.warn('[Cashfree Webhook] Invalid signature — potential spoofed request');
      return res.status(400).json({ success: false, message: 'Webhook signature verification failed' });
    }

    // 2. Parse and handle the event
    const event = JSON.parse(rawBody);
    const eventType = event.type;
    const data = event.data;

    console.log(`[Cashfree Webhook] Event received: ${eventType}`);

    if (eventType === 'PAYMENT_SUCCESS_WEBHOOK') {
      const cfOrderId = data.order?.order_id;
      const order = await Order.findOne({ cashfreeOrderId: cfOrderId });

      if (order && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.orderStatus = 'Processing';
        order.paymentMethod = 'Cashfree';
        order.paymentResult = {
          cfPaymentId: data.payment?.cf_payment_id?.toString() || cfOrderId,
          paymentStatus: 'PAID',
          paymentMessage: 'Cashfree webhook: PAYMENT_SUCCESS_WEBHOOK received',
          paymentTime: data.payment?.payment_time || new Date().toISOString()
        };

        order.trackingHistory.push({
          status: 'Processing',
          description: 'Payment confirmed via Cashfree webhook. Order is being processed.'
        });

        await order.save();

        // Decrement inventory
        for (const item of order.orderItems) {
          if (item.product) {
            const product = await Product.findById(item.product);
            if (product) {
              product.inventory = Math.max(0, product.inventory - item.quantity);
              await product.save();
            }
          }
        }

        console.log(`[Cashfree Webhook] Order ${order._id} marked as PAID`);
      }
    } else if (eventType === 'PAYMENT_FAILED_WEBHOOK') {
      const cfOrderId = data.order?.order_id;
      const order = await Order.findOne({ cashfreeOrderId: cfOrderId });

      if (order) {
        order.trackingHistory.push({
          status: order.orderStatus,
          description: `Cashfree webhook: PAYMENT_FAILED — ${data.payment?.payment_message || 'Payment declined'}`
        });
        await order.save();
        console.warn(`[Cashfree Webhook] Payment failed for order ${order._id}`);
      }
    } else if (eventType === 'REFUND_STATUS_WEBHOOK') {
      console.log('[Cashfree Webhook] Refund status event received');
    }

    res.status(200).json({ success: true, message: 'Webhook received' });
  } catch (error) {
    console.error('[Cashfree Webhook] Error:', error.message);
    res.status(200).json({ success: true, message: 'Webhook received with errors' });
  }
});

module.exports = router;
