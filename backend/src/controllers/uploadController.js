const { uploadToCloudinary, deleteFromCloudinary, testCloudinaryConnection } = require('../config/cloudinary');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const ChefDetails = require('../models/ChefDetails');

// @desc    Upload single image
// @route   POST /api/upload/image
// @access  Private
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    if (!testCloudinaryConnection()) {
      return res.status(500).json({
        success: false,
        message: 'Cloudinary is not configured. Please check your credentials.'
      });
    }

    const folder = req.body.folder || 'recipenest/general';
    const result = await uploadToCloudinary(req.file.buffer, folder);
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.url,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
        format: result.format
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload image'
    });
  }
};

// @desc    Upload multiple images
// @route   POST /api/upload/images
// @access  Private
const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

    if (!testCloudinaryConnection()) {
      return res.status(500).json({
        success: false,
        message: 'Cloudinary is not configured. Please check your credentials.'
      });
    }

    const folder = req.body.folder || 'recipenest/general';
    const uploadPromises = req.files.map(file => 
      uploadToCloudinary(file.buffer, folder)
    );
    
    const results = await Promise.all(uploadPromises);
    
    res.json({
      success: true,
      message: `${results.length} images uploaded successfully`,
      data: results
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload images'
    });
  }
};

// @desc    Update user avatar
// @route   POST /api/upload/avatar
// @access  Private
const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old avatar from Cloudinary if it exists and is not default
    if (user.avatar && 
        !user.avatar.includes('ui-avatars.com') && 
        !user.avatar.includes('unsplash.com')) {
      try {
        const publicId = user.avatar.split('/').slice(-2).join('/').split('.')[0];
        await deleteFromCloudinary(publicId);
      } catch (deleteError) {
        console.log('Could not delete old avatar:', deleteError);
      }
    }

    const result = await uploadToCloudinary(req.file.buffer, 'recipenest/avatars');
    
    user.avatar = result.url;
    await user.save();
    
    res.json({
      success: true,
      message: 'Avatar updated successfully',
      data: {
        url: result.url,
        publicId: result.publicId
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update avatar'
    });
  }
};

// @desc    Upload recipe image
// @route   POST /api/upload/recipe-image
// @access  Private (Chef)
const uploadRecipeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const result = await uploadToCloudinary(req.file.buffer, 'recipenest/recipes');
    
    res.json({
      success: true,
      message: 'Recipe image uploaded successfully',
      data: {
        url: result.url,
        publicId: result.publicId
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload recipe image'
    });
  }
};

// @desc    Update chef cover image
// @route   POST /api/upload/cover-image
// @access  Private (Chef)
const updateCoverImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const chefDetails = await ChefDetails.findOne({ userId: req.user._id });
    if (!chefDetails) {
      return res.status(404).json({
        success: false,
        message: 'Chef details not found'
      });
    }

    // Delete old cover image from Cloudinary if it exists and is not default
    if (chefDetails.coverImage && 
        !chefDetails.coverImage.includes('unsplash.com')) {
      try {
        const publicId = chefDetails.coverImage.split('/').slice(-2).join('/').split('.')[0];
        await deleteFromCloudinary(publicId);
      } catch (deleteError) {
        console.log('Could not delete old cover:', deleteError);
      }
    }

    const result = await uploadToCloudinary(req.file.buffer, 'recipenest/covers');
    
    chefDetails.coverImage = result.url;
    await chefDetails.save();
    
    res.json({
      success: true,
      message: 'Cover image updated successfully',
      data: {
        url: result.url,
        publicId: result.publicId
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update cover image'
    });
  }
};

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload/image/:publicId
// @access  Private
const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }

    const result = await deleteFromCloudinary(publicId);
    
    res.json({
      success: true,
      message: 'Image deleted successfully',
      data: result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete image'
    });
  }
};

module.exports = {
  uploadImage,
  uploadMultipleImages,
  updateAvatar,
  uploadRecipeImage,
  updateCoverImage,
  deleteImage
};