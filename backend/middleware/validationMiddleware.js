// Reusable validation middlewares

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email' });
  }
  next();
};

const validateReview = (req, res, next) => {
  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
  }
  if (!comment || comment.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Comment cannot be empty' });
  }
  next();
};

const validateCoupon = (req, res, next) => {
  const { code, discountPercent, expiryDate } = req.body;
  if (!code || !discountPercent || !expiryDate) {
    return res.status(400).json({ success: false, message: 'Please provide code, discountPercent, and expiryDate' });
  }
  next();
};

module.exports = {
  validateRegister,
  validateReview,
  validateCoupon
};
