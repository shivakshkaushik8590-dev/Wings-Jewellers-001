const mongoose = require('mongoose');

const tryOnSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  mappingMatrices: {
    type: Object, // Stores 3D calibration arrays, face meshes, etc.
    default: {}
  },
  imageUrl: {
    type: String, // Resulting snapshot URL if saved
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TryOnSession', tryOnSessionSchema);
