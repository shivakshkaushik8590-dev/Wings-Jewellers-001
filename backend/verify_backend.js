/**
 * Verification Script for Wings Jewellers Backend System
 * 
 * This script imports all the schemas, routes, and main configurations
 * to verify there are no syntax errors or circular dependency issues.
 */

const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('   WINGS JEWELLERS BACKEND CODE INTEGRITY TEST      ');
console.log('====================================================\n');

const filesToVerify = [
  'config/db.js',
  'models/User.js',
  'models/Product.js',
  'models/Category.js',
  'models/Order.js',
  'models/Review.js',
  'models/Coupon.js',
  'middleware/authMiddleware.js',
  'middleware/errorMiddleware.js',
  'routes/authRoutes.js',
  'routes/productRoutes.js',
  'routes/categoryRoutes.js',
  'routes/cartRoutes.js',
  'routes/wishlistRoutes.js',
  'routes/orderRoutes.js',
  'routes/paymentRoutes.js',
  'routes/reviewRoutes.js',
  'routes/adminRoutes.js',
  'server.js'
];

let errors = 0;

// Set dummy env variables for parsing
process.env.MONGO_URI = 'mongodb://localhost:27017/test_verify';
process.env.JWT_SECRET = 'verify_secret_12345';
process.env.RAZORPAY_KEY_ID = 'rzp_test_mockKeyId123';
process.env.RAZORPAY_KEY_SECRET = 'mockRazorpaySecret456';
process.env.PORT = '9999';

// Mock DB connection to avoid server hang
const mongoose = require('mongoose');
mongoose.connect = async () => ({
  connection: { host: 'mock-localhost' }
});
// Stub mongoose model compile errors if any
const originalModel = mongoose.model;
mongoose.model = function(...args) {
  try {
    return originalModel.apply(this, args);
  } catch (e) {
    if (e.name === 'OverwriteModelError') {
      return mongoose.models[args[0]];
    }
    throw e;
  }
};

console.log('Checking file existences and requiring modules...');

filesToVerify.forEach((file) => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.error(`[-] MISSING: ${file} does not exist!`);
    errors++;
    return;
  }

  try {
    // Attempt load
    require(filePath);
    console.log(`[+] OK: Loaded and verified ${file}`);
  } catch (err) {
    console.error(`[-] ERROR: Failed to load ${file}`);
    console.error(`    Details: ${err.message}`);
    errors++;
  }
});

console.log('\n====================================================');
if (errors === 0) {
  console.log(' SUCCESS: All backend modules successfully verified!');
  console.log(' No compile, require, or syntax errors found.');
} else {
  console.error(` FAILED: Found ${errors} verification issues.`);
}
console.log('====================================================');

// Close any open servers if server.js started listening
setTimeout(() => {
  process.exit(errors > 0 ? 1 : 0);
}, 500);
