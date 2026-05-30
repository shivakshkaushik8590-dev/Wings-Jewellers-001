const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
const TryOnSession = require('../models/TryOnSession');
const LoyaltyCard = require('../models/LoyaltyCard');
const { protect } = require('../middleware/authMiddleware');

// ==========================================
// 1. AI Product Recommendations
// ==========================================
router.get('/recommendations/ai', protect, async (req, res, next) => {
  try {
    // Mock AI recommendation logic based on user history
    // In production, this would call an ML service or use tags similarity
    res.json({
      success: true,
      message: 'AI Recommendations generated',
      data: [
        { id: 'rec_1', name: 'Diamond Solitaire Ring', confidenceScore: 0.95 },
        { id: 'rec_2', name: 'Gold Chain Necklace', confidenceScore: 0.88 },
        { id: 'rec_3', name: 'Platinum Bands', confidenceScore: 0.76 }
      ]
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 2. Live Chat Support
// ==========================================
router.get('/chat/history', protect, async (req, res, next) => {
  try {
    const messages = await ChatMessage.find({ user: req.user._id }).sort('createdAt');
    res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
});

router.post('/chat/message', protect, async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Message text is required' });

    const message = await ChatMessage.create({
      user: req.user._id,
      sender: 'user',
      text
    });

    // Auto-reply mock bot response for demonstration
    setTimeout(async () => {
      await ChatMessage.create({
        user: req.user._id,
        sender: 'bot',
        text: 'Thank you for reaching out! A concierge agent will be with you shortly.'
      });
    }, 1000);

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 3. Mobile App FCM Push Tokens
// ==========================================
router.post('/mobile/device-token', protect, async (req, res, next) => {
  try {
    const { fcmToken, deviceOs } = req.body;
    if (!fcmToken) return res.status(400).json({ success: false, message: 'FCM Token is required' });
    
    // Store token logic (could be appended to User model or a new MobileDevice model)
    res.json({ success: true, message: 'Device token registered successfully', data: { fcmToken, deviceOs }});
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 4. AR Jewellery Try-On
// ==========================================
router.get('/tryon/product/:id', async (req, res, next) => {
  try {
    const productId = req.params.id;
    // Return AR mapping matrices/models for the given product
    res.json({
      success: true,
      message: 'AR calibration models loaded',
      data: {
        productId,
        modelUrl: `https://ar-models.example.com/${productId}.gltf`,
        scale: [1, 1, 1],
        position: [0, -1.5, -2]
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/tryon/upload', protect, async (req, res, next) => {
  try {
    const { productId, mappingMatrices } = req.body;
    const session = await TryOnSession.create({
      user: req.user._id,
      product: productId,
      mappingMatrices
    });
    res.status(201).json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 5. Loyalty Rewards Engine
// ==========================================
router.get('/loyalty/points', protect, async (req, res, next) => {
  try {
    let card = await LoyaltyCard.findOne({ user: req.user._id });
    if (!card) {
      card = await LoyaltyCard.create({ user: req.user._id, points: 0 });
    }
    res.json({ success: true, data: card });
  } catch (error) {
    next(error);
  }
});

router.post('/loyalty/redeem', protect, async (req, res, next) => {
  try {
    const { pointsToRedeem } = req.body;
    const card = await LoyaltyCard.findOne({ user: req.user._id });
    
    if (!card || card.points < pointsToRedeem) {
      return res.status(400).json({ success: false, message: 'Insufficient points' });
    }

    card.points -= pointsToRedeem;
    card.history.push({
      action: 'redeemed',
      pointsAmount: pointsToRedeem,
      description: `Redeemed ${pointsToRedeem} points for a discount code.`
    });
    await card.save();

    res.json({
      success: true,
      message: `${pointsToRedeem} points redeemed successfully`,
      data: {
        remainingPoints: card.points,
        discountCode: `LOYALTY-${pointsToRedeem}-${Math.random().toString(36).substring(2,8).toUpperCase()}`
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
