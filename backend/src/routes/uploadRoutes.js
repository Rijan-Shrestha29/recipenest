const express = require('express');
const router = express.Router();
const { protect, chefOnly } = require('../middleware/auth');
const { uploadSingle, uploadMultiple } = require('../middleware/upload');
const {
  uploadImage,
  uploadMultipleImages,
  updateAvatar,
  uploadRecipeImage,
  updateCoverImage,
  deleteImage
} = require('../controllers/uploadController');

// All routes are protected
router.post('/image', protect, uploadSingle('image'), uploadImage);
router.post('/images', protect, uploadMultiple('images', 5), uploadMultipleImages);
router.post('/avatar', protect, uploadSingle('image'), updateAvatar);
router.post('/recipe-image', protect, chefOnly, uploadSingle('image'), uploadRecipeImage);
router.post('/cover-image', protect, chefOnly, uploadSingle('image'), updateCoverImage);
router.delete('/image/:publicId', protect, deleteImage);

// Test Cloudinary configuration route (admin only)
const { testCloudinaryConnection } = require('../config/cloudinary');
router.get('/test-config', protect, (req, res) => {
  const isConfigured = testCloudinaryConnection();
  res.json({
    success: isConfigured,
    message: isConfigured ? 'Cloudinary is configured' : 'Cloudinary is not configured',
    config: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not set',
      apiKey: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set',
      apiSecret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set'
    }
  });
});

module.exports = router;