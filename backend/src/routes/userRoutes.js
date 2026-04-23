const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getAllUsers,
  getAllChefs,
  getChefById,
  getUserById,
  updateUserProfile,
  updateChefProfile,
  deleteUserAccount,
  getUserStats,
  getProfile
} = require('../controllers/userController');

// Public routes
router.get('/chefs', getAllChefs);
router.get('/chefs/:id', getChefById);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateUserProfile);
router.delete('/profile', protect, deleteUserAccount);
router.get('/stats', protect, getUserStats);
router.put('/chef/profile', protect, updateChefProfile);

// Get user by ID (protected)
router.get('/:id', protect, getUserById);

// Admin only routes
router.get('/', protect, adminOnly, getAllUsers);

module.exports = router;