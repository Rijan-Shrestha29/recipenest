const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllRecipes,
  getPendingRecipes,
  approveRecipe,
  rejectRecipe,
  deleteRecipeAdmin,
  getAllUsersAdmin,
  updateUserRole,
  suspendUser,
  unsuspendUser,
  getAllCommentsAdmin,
  deleteCommentAdmin
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// Dashboard
router.get('/stats', protect, adminOnly, getDashboardStats);

// Recipe management
router.get('/recipes', protect, adminOnly, getAllRecipes);
router.get('/recipes/pending', protect, adminOnly, getPendingRecipes);
router.put('/recipes/:id/approve', protect, adminOnly, approveRecipe);
router.put('/recipes/:id/reject', protect, adminOnly, rejectRecipe);
router.delete('/recipes/:id', protect, adminOnly, deleteRecipeAdmin);

// User management
router.get('/users', protect, adminOnly, getAllUsersAdmin);
router.put('/users/:id/role', protect, adminOnly, updateUserRole);
router.put('/users/:id/suspend', protect, adminOnly, suspendUser);
router.put('/users/:id/unsuspend', protect, adminOnly, unsuspendUser);

// Comment management
router.get('/comments', protect, adminOnly, getAllCommentsAdmin);
router.delete('/comments/:id', protect, adminOnly, deleteCommentAdmin);

module.exports = router;