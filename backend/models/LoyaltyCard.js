const mongoose = require('mongoose');

const loyaltyCardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  points: {
    type: Number,
    default: 0
  },
  tier: {
    type: String,
    enum: ['Bronze', 'Gold', 'Platinum'],
    default: 'Bronze'
  },
  history: [{
    action: { type: String, enum: ['earned', 'redeemed'] },
    pointsAmount: { type: Number, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Auto update tier based on points
loyaltyCardSchema.pre('save', function(next) {
  if (this.points >= 5000) {
    this.tier = 'Platinum';
  } else if (this.points >= 1000) {
    this.tier = 'Gold';
  } else {
    this.tier = 'Bronze';
  }
  next();
});

module.exports = mongoose.model('LoyaltyCard', loyaltyCardSchema);
