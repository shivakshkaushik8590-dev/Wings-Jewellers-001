const mongoose = require('mongoose');

const charmSchema = new mongoose.Schema({
  type:       { type: String, required: true },
  position:   { type: Number, default: 0 },
  swingAngle: { type: Number, default: 0 }
}, { _id: false });

const customDesignSchema = new mongoose.Schema({
  user: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true
  },
  name: {
    type:    String,
    default: 'My Custom Design',
    trim:    true,
    maxlength: 60
  },

  // ── Core Customization Options ──────────────────────────────
  baseType: {
    type:    String,
    enum:    ['ring', 'necklace', 'bracelet', 'earrings'],
    default: 'ring'
  },
  metalType: {
    type:    String,
    enum:    ['silver', 'gold', 'rose-gold', 'platinum', 'white-gold', 'two-tone'],
    default: 'silver'
  },
  baseShape: {
    type:    String,
    enum:    ['round', 'oval', 'square', 'heart', 'marquise', 'pear', 'cushion', 'emerald-cut', 'princess-cut'],
    default: 'round'
  },
  gemstoneType: {
    type:    String,
    enum:    ['none', 'diamond', 'ruby', 'emerald', 'sapphire', 'amethyst', 'pearl', 'opal', 'tanzanite', 'aquamarine', 'moissanite', 'garnet'],
    default: 'none'
  },
  gemstoneCut: {
    type:    String,
    enum:    ['standard', 'brilliant', 'step', 'rose-cut', 'bezel', 'pavé', 'channel', 'prong', 'halo'],
    default: 'standard'
  },
  gemstoneSize: {
    type:    Number,
    min:     2,
    max:     10,
    default: 3
  },
  engravingText: {
    type:      String,
    default:   '',
    maxlength: 30,
    trim:      true
  },
  engravingFont: {
    type:    String,
    enum:    ['serif', 'script', 'block', 'art-deco', 'handwritten'],
    default: 'serif'
  },
  charms: [charmSchema],

  // ── Calculated Fields ────────────────────────────────────────
  calculatedPrice: {
    type:    Number,
    min:     0,
    default: 0
  },

  // ── Status ───────────────────────────────────────────────────
  isOrderPlaced: {
    type:    Boolean,
    default: false
  },
  orderId: {
    type:    mongoose.Schema.Types.ObjectId,
    ref:     'Order',
    default: null
  }
}, {
  timestamps: true
});

// Index for fast user design lookups
customDesignSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('CustomDesign', customDesignSchema);
