const User = require('../models/User');
const ChefDetails = require('../models/ChefDetails');
const VerificationCode = require('../models/VerificationCode');
const { generateToken } = require('../utils/generateToken');
const { sendVerificationEmail } = require('../utils/emailService');

// Generate random verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
     const { name, email, password, role, bio, specialty, experience, profileImage } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Hash password manually
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'foodlover',
      avatar: profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f97316&color=fff`
    });

    // Create chef details if role is chef
    let chefDetails = null;
    if (role === 'chef') {
      chefDetails = await ChefDetails.create({
        userId: user._id,
        bio: bio || '',
        specialty: specialty || '',
        experience: experience || 0,
        profileImage: profileImage || user.avatar,
        coverImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836'
      });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    await VerificationCode.create({
      email,
      code: verificationCode
    });

    // Send verification email
    await sendVerificationEmail(email, name, verificationCode);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified
      },
      chefDetails
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified && user.role !== 'superadmin') {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in',
        isEmailVerified: false
      });
    }

    // Check if user is suspended
    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: `Account suspended: ${user.suspendedReason || 'Contact admin for details'}`
      });
    }

    // Get chef details if user is chef
    let chefDetails = null;
    if (user.role === 'chef') {
      chefDetails = await ChefDetails.findOne({ userId: user._id });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified
      },
      chefDetails
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    // Find verification code
    const verificationCode = await VerificationCode.findOne({ email, code });
    if (!verificationCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    // Update user email verification status
    const user = await User.findOneAndUpdate(
      { email },
      { isEmailVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete verification code
    await verificationCode.deleteOne();

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    let chefDetails = null;
    if (user.role === 'chef') {
      chefDetails = await ChefDetails.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      user,
      chefDetails
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Resend verification code
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified'
      });
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    await VerificationCode.create({
      email,
      code: verificationCode
    });

    // Send verification email
    await sendVerificationEmail(email, user.name, verificationCode);

    res.json({
      success: true,
      message: 'Verification code sent successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  getMe,
  resendVerification
};