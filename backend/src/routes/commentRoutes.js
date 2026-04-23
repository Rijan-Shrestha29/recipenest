const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getCommentsByRecipe,
  createComment,
  updateComment,
  deleteComment
} = require('../controllers/commentController');

router.get('/recipe/:recipeId', getCommentsByRecipe);
router.post('/', protect, createComment);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);

module.exports = router;