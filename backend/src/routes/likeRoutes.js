const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getLikesByRecipe,
  toggleLike,
  checkLikeStatus
} = require('../controllers/likeController');

router.get('/recipe/:recipeId', getLikesByRecipe);
router.post('/toggle', protect, toggleLike);
router.get('/check/:recipeId', protect, checkLikeStatus);

module.exports = router;