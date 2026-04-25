const express = require('express');
const router = express.Router();
const { protect, chefOnly } = require('../middleware/auth');
const {
  getRecipes,
  getRecipeCategories,
  getTrendingRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getChefRecipes
} = require('../controllers/recipeController');

// Public routes
router.get('/', getRecipes);
router.get('/categories', getRecipeCategories);
router.get('/trending', getTrendingRecipes);
router.get('/:id', getRecipeById);

// Chef-specific route - MUST be before the /:id route
router.get('/chef/my-recipes', protect, chefOnly, getChefRecipes);

// Protected routes
router.post('/', protect, chefOnly, createRecipe);
router.put('/:id', protect, updateRecipe);
router.delete('/:id', protect, deleteRecipe);

module.exports = router;