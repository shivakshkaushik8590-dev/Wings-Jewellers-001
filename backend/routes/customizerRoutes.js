const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const CustomDesign = require('../models/CustomDesign');

// ================================================================
//  JEWELRY CUSTOMIZER — PRICING ENGINE + DESIGN PERSISTENCE
// ================================================================
//
//  Routes:
//    POST   /api/customizer/price          — Dynamic price calculation
//    POST   /api/customizer/save           — Save a custom design (auth)
//    GET    /api/customizer/designs        — Get user's saved designs (auth)
//    GET    /api/customizer/designs/:id    — Get a single saved design (auth)
//    DELETE /api/customizer/designs/:id    — Delete a saved design (auth)
//    GET    /api/customizer/options        — All available customization options
// ================================================================

// ----------------------------------------------------------------
// PRICING CONFIG (mirrors frontend main.js priceConfig)
// ----------------------------------------------------------------
const PRICING = {
  base: {
    ring:      299,
    necklace:  399,
    bracelet:  249,
    earrings:  199
  },
  metal: {
    'silver':           0,
    'gold':           350,
    'rose-gold':      320,
    'platinum':       700,
    'white-gold':     400,
    'two-tone':       450
  },
  shape: {
    'round':            0,
    'oval':            40,
    'square':          30,
    'heart':           50,
    'marquise':        60,
    'pear':            55,
    'cushion':         45,
    'emerald-cut':     70,
    'princess-cut':    65
  },
  gemstone: {
    'none':             0,
    'diamond':        800,
    'ruby':           400,
    'emerald':        350,
    'sapphire':       380,
    'amethyst':       120,
    'pearl':          150,
    'opal':           200,
    'tanzanite':      500,
    'aquamarine':     180,
    'moissanite':     300,
    'garnet':          90
  },
  cut: {
    'standard':         0,
    'brilliant':      100,
    'step':            60,
    'rose-cut':        80,
    'bezel':           50,
    'pavé':           120,
    'channel':         90,
    'prong':           40,
    'halo':           150
  },
  // Per mm above 3mm base
  gemstoneSize: {
    base:             3,  // mm
    pricePerMm:      35
  },
  engraving: {
    base:            50,  // flat fee
    perChar:          2   // per character
  },
  charm: {
    'star':          40,
    'heart':         35,
    'moon':          38,
    'butterfly':     55,
    'infinity':      45,
    'flower':        42,
    'anchor':        38,
    'feather':       48
  }
};

// ----------------------------------------------------------------
// HELPER: Calculate price from customization options
// ----------------------------------------------------------------
function calculatePrice(options) {
  const {
    baseType,
    metalType,
    baseShape,
    gemstoneType,
    gemstoneCut,
    gemstoneSize,
    engravingText,
    charms = []
  } = options;

  const breakdown = {};
  let total = 0;

  // Base price
  const basePrice = PRICING.base[baseType] || PRICING.base.ring;
  breakdown.base = { label: `Base (${baseType})`, price: basePrice };
  total += basePrice;

  // Metal
  const metalPrice = PRICING.metal[metalType] || 0;
  if (metalPrice) breakdown.metal = { label: `Metal (${metalType})`, price: metalPrice };
  total += metalPrice;

  // Base shape
  const shapePrice = PRICING.shape[baseShape] || 0;
  if (shapePrice) breakdown.shape = { label: `Shape (${baseShape})`, price: shapePrice };
  total += shapePrice;

  // Gemstone
  const gemstonePrice = PRICING.gemstone[gemstoneType] || 0;
  if (gemstonePrice) breakdown.gemstone = { label: `Gemstone (${gemstoneType})`, price: gemstonePrice };
  total += gemstonePrice;

  // Gemstone cut (only if gemstone selected)
  if (gemstoneType && gemstoneType !== 'none') {
    const cutPrice = PRICING.cut[gemstoneCut] || 0;
    if (cutPrice) breakdown.cut = { label: `Cut (${gemstoneCut})`, price: cutPrice };
    total += cutPrice;

    // Gemstone size premium
    const sizeNum = Number(gemstoneSize) || PRICING.gemstoneSize.base;
    if (sizeNum > PRICING.gemstoneSize.base) {
      const sizePrice = (sizeNum - PRICING.gemstoneSize.base) * PRICING.gemstoneSize.pricePerMm;
      breakdown.size = { label: `Size premium (${sizeNum}mm)`, price: sizePrice };
      total += sizePrice;
    }
  }

  // Engraving
  if (engravingText && engravingText.trim().length > 0) {
    const engravingPrice = PRICING.engraving.base + (engravingText.trim().length * PRICING.engraving.perChar);
    breakdown.engraving = { label: `Engraving ("${engravingText.trim()}")`, price: engravingPrice };
    total += engravingPrice;
  }

  // Charms
  if (charms && charms.length > 0) {
    let charmsTotal = 0;
    charms.forEach(charm => {
      charmsTotal += PRICING.charm[charm.type] || 40;
    });
    breakdown.charms = { label: `Charms (${charms.length}x)`, price: charmsTotal };
    total += charmsTotal;
  }

  return { total: Math.round(total * 100) / 100, breakdown };
}

// ================================================================
// POST /api/customizer/price — Calculate price dynamically
// @access Public (no auth needed for browsing)
// ================================================================
router.post('/price', (req, res) => {
  try {
    const options = req.body;

    if (!options.baseType) {
      return res.status(400).json({
        success: false,
        message: 'baseType is required (ring, necklace, bracelet, earrings)'
      });
    }

    const result = calculatePrice(options);

    res.json({
      success: true,
      data: {
        price:     result.total,
        breakdown: result.breakdown,
        currency:  'INR',
        note:      'Prices are indicative. Final price may vary based on material market rates.'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ================================================================
// GET /api/customizer/options — All available options & pricing matrix
// @access Public
// ================================================================
router.get('/options', (req, res) => {
  res.json({
    success: true,
    data: {
      baseTypes:    Object.keys(PRICING.base).map(k => ({ id: k, basePrice: PRICING.base[k] })),
      metals:       Object.keys(PRICING.metal).map(k => ({ id: k, premium: PRICING.metal[k] })),
      shapes:       Object.keys(PRICING.shape).map(k => ({ id: k, premium: PRICING.shape[k] })),
      gemstones:    Object.keys(PRICING.gemstone).map(k => ({ id: k, premium: PRICING.gemstone[k] })),
      cuts:         Object.keys(PRICING.cut).map(k => ({ id: k, premium: PRICING.cut[k] })),
      charms:       Object.keys(PRICING.charm).map(k => ({ id: k, price: PRICING.charm[k] })),
      engraving: {
        baseFee: PRICING.engraving.base,
        perCharFee: PRICING.engraving.perChar,
        maxLength: 30
      },
      gemstoneSizeRange: {
        min: 2,
        max: 10,
        baseIncluded: PRICING.gemstoneSize.base,
        pricePerMmAboveBase: PRICING.gemstoneSize.pricePerMm
      }
    }
  });
});

// ================================================================
// POST /api/customizer/save — Persist a custom design for user
// @access Private
// ================================================================
router.post('/save', protect, async (req, res, next) => {
  try {
    const {
      name,
      baseType, metalType, baseShape, gemstoneType, gemstoneCut,
      gemstoneSize, engravingText, engravingFont, charms
    } = req.body;

    const options = { baseType, metalType, baseShape, gemstoneType, gemstoneCut, gemstoneSize, engravingText, charms };
    const { total } = calculatePrice(options);

    const design = await CustomDesign.create({
      user:          req.user._id,
      name:          name || `My Custom ${baseType || 'Ring'}`,
      baseType,
      metalType,
      baseShape,
      gemstoneType,
      gemstoneCut,
      gemstoneSize,
      engravingText,
      engravingFont,
      charms:        charms || [],
      calculatedPrice: total
    });

    res.status(201).json({ success: true, data: design });
  } catch (error) {
    next(error);
  }
});

// ================================================================
// GET /api/customizer/designs — Get all saved designs for user
// @access Private
// ================================================================
router.get('/designs', protect, async (req, res, next) => {
  try {
    const designs = await CustomDesign.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: designs.length, data: designs });
  } catch (error) {
    next(error);
  }
});

// ================================================================
// GET /api/customizer/designs/:id — Get a single saved design
// @access Private
// ================================================================
router.get('/designs/:id', protect, async (req, res, next) => {
  try {
    const design = await CustomDesign.findById(req.params.id);

    if (!design) {
      res.status(404);
      throw new Error('Design not found');
    }

    if (design.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to view this design');
    }

    // Re-calculate live price when loading
    const options = {
      baseType:      design.baseType,
      metalType:     design.metalType,
      baseShape:     design.baseShape,
      gemstoneType:  design.gemstoneType,
      gemstoneCut:   design.gemstoneCut,
      gemstoneSize:  design.gemstoneSize,
      engravingText: design.engravingText,
      charms:        design.charms
    };
    const { total, breakdown } = calculatePrice(options);

    res.json({
      success: true,
      data: {
        ...design.toObject(),
        livePrice:  total,
        breakdown
      }
    });
  } catch (error) {
    next(error);
  }
});

// ================================================================
// DELETE /api/customizer/designs/:id — Delete a saved design
// @access Private
// ================================================================
router.delete('/designs/:id', protect, async (req, res, next) => {
  try {
    const design = await CustomDesign.findById(req.params.id);

    if (!design) {
      res.status(404);
      throw new Error('Design not found');
    }

    if (design.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to delete this design');
    }

    await CustomDesign.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Design deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
module.exports.calculatePrice = calculatePrice; // Export for use in order creation
