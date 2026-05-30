const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Trust reverse proxy for rate-limiting (Vercel, Render, Heroku)
app.set('trust proxy', 1);

// Production HTTPS Enforcer
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(`https://${req.header('host')}${req.url}`);
    }
    next();
  });
}

// Security Headers Middleware
app.use(helmet());

// Enable CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true  // Required for cookies (refresh tokens)
}));

// Cookie Parser — needed for HTTP-only refresh token cookie
app.use(cookieParser());

// RAW BODY for Webhook signature verification
// Must be registered BEFORE express.json() for these specific paths
app.use('/api/payment/webhook/razorpay', express.raw({ type: 'application/json' }));
app.use('/api/payment/webhook/cashfree',  express.raw({ type: 'application/json' }));

// Request Body Parser Middleware (JSON for all other routes)
app.use(express.json());

// HTTP Request Logger Middleware (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API Rate Limiting Middleware (brute-force defense)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});
app.use('/api', apiLimiter);

// Mount Application Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/enhancements', require('./routes/enhancementRoutes'));

// Default base route check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Wings Jewellers API Server is active.'
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Wings Jewellers Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

module.exports = server;
