const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating between 1 and 5'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Please add a review comment'],
    trim: true
  },
  isApproved: {
    type: Boolean,
    default: false // Admin moderation required
  }
}, {
  timestamps: true
});

// Update product rating automatically when a review is added/updated
reviewSchema.statics.calculateAverageRating = async function(productId) {
  const obj = await this.aggregate([
    { $match: { product: productId, isApproved: true } },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        ratingCount: { $sum: 1 }
      }
    }
  ]);

  try {
    if (obj.length > 0) {
      await this.model('Product').findByIdAndUpdate(productId, {
        'ratings.average': Math.round(obj[0].averageRating * 10) / 10,
        'ratings.count': obj[0].ratingCount
      });
    } else {
      await this.model('Product').findByIdAndUpdate(productId, {
        'ratings.average': 0,
        'ratings.count': 0
      });
    }
  } catch (err) {
    console.error(`Error calculating rating average: ${err}`);
  }
};

// Re-calculate rating on save
reviewSchema.post('save', function() {
  this.constructor.calculateAverageRating(this.product);
});

// Re-calculate rating on delete
reviewSchema.post('remove', function() {
  this.constructor.calculateAverageRating(this.product);
});

module.exports = mongoose.model('Review', reviewSchema);
