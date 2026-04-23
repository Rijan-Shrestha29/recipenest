const User = require('../models/User');
const ChefDetails = require('../models/ChefDetails');
const Recipe = require('../models/Recipe');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const Bookmark = require('../models/Bookmark');

// @desc    Get current user profile (from token)
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    let chefDetails = null;
    if (user.role === 'chef') {
      chefDetails = await ChefDetails.findOne({ userId: user._id });
    }
    
    // Get user stats
    const recipesCount = await Recipe.countDocuments({ chefId: user._id });
    const commentsCount = await Comment.countDocuments({ userId: user._id });
    const likesCount = await Like.countDocuments({ userId: user._id });
    const bookmarksCount = await Bookmark.countDocuments({ userId: user._id });
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
      },
      chefDetails,
      stats: {
        recipesCount,
        commentsCount,
        likesCount,
        bookmarksCount
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user profile - FIXED
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    
    // Find user by ID (not using save() to avoid password hashing)
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Only update allowed fields
    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    
    // Use findByIdAndUpdate to avoid triggering pre-save hooks
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name: user.name, avatar: user.avatar },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    let chefDetails = null;
    if (user.role === 'chef') {
      chefDetails = await ChefDetails.findOne({ userId: user._id });
    }
    
    // Get user stats
    const recipesCount = await Recipe.countDocuments({ chefId: user._id, approvalStatus: 'approved' });
    const commentsCount = await Comment.countDocuments({ userId: user._id });
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt
      },
      chefDetails,
      stats: {
        recipesCount,
        commentsCount
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'superadmin' } })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all chefs
// @route   GET /api/users/chefs
// @access  Public
const getAllChefs = async (req, res) => {
  try {
    const chefs = await User.find({ role: 'chef', isEmailVerified: true })
      .select('-password')
      .sort({ createdAt: -1 });
    
    const chefsWithDetails = await Promise.all(chefs.map(async (chef) => {
      const details = await ChefDetails.findOne({ userId: chef._id });
      const recipesCount = await Recipe.countDocuments({ chefId: chef._id, approvalStatus: 'approved' });
      
      return {
        ...chef.toObject(),
        bio: details?.bio || '',
        specialty: details?.specialty || '',
        experience: details?.experience || 0,
        profileImage: details?.profileImage || chef.avatar,
        coverImage: details?.coverImage,
        socialMedia: details?.socialMedia || {},
        recipesCount
      };
    }));
    
    res.json({
      success: true,
      count: chefsWithDetails.length,
      chefs: chefsWithDetails
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get chef by ID
// @route   GET /api/users/chefs/:id
// @access  Public
const getChefById = async (req, res) => {
  try {
    const chef = await User.findOne({ _id: req.params.id, role: 'chef' })
      .select('-password');
    
    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef not found'
      });
    }
    
    const details = await ChefDetails.findOne({ userId: chef._id });
    const recipes = await Recipe.find({ chefId: chef._id, approvalStatus: 'approved' })
      .sort({ createdAt: -1 });
    const recipesCount = recipes.length;
    
    res.json({
      success: true,
      chef: {
        ...chef.toObject(),
        bio: details?.bio || '',
        specialty: details?.specialty || '',
        experience: details?.experience || 0,
        profileImage: details?.profileImage || chef.avatar,
        coverImage: details?.coverImage,
        socialMedia: details?.socialMedia || {},
        recipesCount,
        recipes
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update chef profile
// @route   PUT /api/users/chef/profile
// @access  Private/Chef
const updateChefProfile = async (req, res) => {
  try {
    const { bio, specialty, experience, profileImage, coverImage, socialMedia } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'chef') {
      return res.status(404).json({
        success: false,
        message: 'Chef not found'
      });
    }
    
    let chefDetails = await ChefDetails.findOne({ userId: user._id });
    
    if (chefDetails) {
      chefDetails.bio = bio || chefDetails.bio;
      chefDetails.specialty = specialty || chefDetails.specialty;
      chefDetails.experience = experience !== undefined ? experience : chefDetails.experience;
      chefDetails.profileImage = profileImage || chefDetails.profileImage;
      chefDetails.coverImage = coverImage || chefDetails.coverImage;
      chefDetails.socialMedia = { ...chefDetails.socialMedia, ...socialMedia };
      
      await chefDetails.save();
    } else {
      chefDetails = await ChefDetails.create({
        userId: user._id,
        bio: bio || '',
        specialty: specialty || '',
        experience: experience || 0,
        profileImage: profileImage || user.avatar,
        coverImage: coverImage,
        socialMedia: socialMedia || {}
      });
    }
    
    res.json({
      success: true,
      message: 'Chef profile updated successfully',
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

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private
const deleteUserAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Delete related data
    await ChefDetails.deleteOne({ userId: user._id });
    await Recipe.deleteMany({ chefId: user._id });
    await Comment.deleteMany({ userId: user._id });
    await Like.deleteMany({ userId: user._id });
    await Bookmark.deleteMany({ userId: user._id });
    
    await user.deleteOne();
    
    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user stats
// @route   GET /api/users/stats
// @access  Private
const getUserStats = async (req, res) => {
  try {
    const recipesCount = await Recipe.countDocuments({ chefId: req.user._id });
    const commentsCount = await Comment.countDocuments({ userId: req.user._id });
    const likesCount = await Like.countDocuments({ userId: req.user._id });
    const bookmarksCount = await Bookmark.countDocuments({ userId: req.user._id });
    
    res.json({
      success: true,
      stats: {
        recipesCount,
        commentsCount,
        likesCount,
        bookmarksCount
      }
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
  getAllUsers,
  getAllChefs,
  getChefById,
  getUserById,
  getProfile,
  updateUserProfile,
  updateChefProfile,
  deleteUserAccount,
  getUserStats
};