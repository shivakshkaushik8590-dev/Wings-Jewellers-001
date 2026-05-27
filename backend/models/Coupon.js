const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Please add a coupon code'],
    unique: true,
    uppercase: true,
    trim: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'flat'],
    default: 'percentage',
    required: true
  },
  discountValue: {
    type: Number,
    required: [true, 'Please add a discount value'],
    min: 0
  },
  minPurchase: {
    type: Number,
    default: 0,
    min: 0
  },
  expiryDate: {
    type: Date,
    required: [true, 'Please specify an expiry date']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Check if coupon is expired or inactive
couponSchema.methods.isValid = function (purchaseAmount = 0) {
  const isExpired = new Date() > this.expiryDate;
  const isMeetMinPurchase = purchaseAmount >= this.minPurchase;
  return this.isActive && !isExpired && isMeetMinPurchase;
};

module.exports = mongoose.model('Coupon', couponSchema);
