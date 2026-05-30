const express = require('express');
const Review = require('../models/Review');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');
const { validateReview } = require('../middleware/validationMiddleware');

const router = express.Router();

// @desc    Get approved reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
router.get('/product/:productId', async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, isApproved: true })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    next(error);
  }
});

// @desc    Create a product review
// @route   POST /api/reviews
// @access  Private
router.post('/', protect, validateReview, async (req, res, next) => {
  const { productId, rating, comment } = req.body;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    // Check if user already reviewed this product
    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      product: productId
    });

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('You have already reviewed this product');
    }

    const review = new Review({
      user: req.user._id,
      userName: req.user.name,
      product: productId,
      rating: Number(rating),
      comment,
      isApproved: false // Requires admin moderation
    });

    const createdReview = await review.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted. It will appear once approved by an administrator.',
      data: createdReview
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Approve/moderate a review
// @route   PUT /api/reviews/:id/approve
// @access  Private/Admin
router.put('/:id/approve', protect, admin, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (review) {
      review.isApproved = true;
      const approvedReview = await review.save();
      
      // Explicitly recalculate rating on the product since save post-hook runs
      await Review.calculateAverageRating(review.product);

      res.json({
        success: true,
        message: 'Review approved and product ratings updated',
        data: approvedReview
      });
    } else {
      res.status(404);
      throw new Error('Review not found');
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (review) {
      // Check authorization (Must be author or admin)
      if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to delete this review');
      }

      const productId = review.product;
      await Review.deleteOne({ _id: req.params.id });

      // Recalculate average rating on product
      await Review.calculateAverageRating(productId);

      res.json({ success: true, message: 'Review removed' });
    } else {
      res.status(404);
      throw new Error('Review not found');
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
