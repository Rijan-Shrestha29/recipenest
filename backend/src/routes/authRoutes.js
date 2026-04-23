const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  verifyEmail,
  getMe,
  resendVerification
} = require('../controllers/authController');

const {
  changePassword,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  resendResetOTP
} = require('../controllers/passwordController');

// Authentication routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.get('/me', protect, getMe);

// Password management routes
router.post('/change-password', protect, changePassword);  // Logged in user
router.post('/forgot-password', forgotPassword);           // Send OTP
router.post('/verify-reset-otp', verifyResetOTP);          // Verify OTP
router.post('/reset-password', resetPassword);             // Reset with OTP
router.post('/resend-reset-otp', resendResetOTP);          // Resend OTP

module.exports = router;