const Comment = require('../models/Comment');
const Recipe = require('../models/Recipe');

// @desc    Get comments for a recipe
// @route   GET /api/comments/recipe/:recipeId
// @access  Public
const getCommentsByRecipe = async (req, res) => {
  try {
    const comments = await Comment.find({ recipeId: req.params.recipeId })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: comments.length,
      comments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create comment
// @route   POST /api/comments
// @access  Private
const createComment = async (req, res) => {
  try {
    const { recipeId, content } = req.body;
    
    // Check if recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }
    
    const comment = await Comment.create({
      recipeId,
      userId: req.user._id,
      userName: req.user.name,
      userAvatar: req.user.avatar,
      content
    });
    
    res.status(201).json({
      success: true,
      comment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private
const updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    
    let comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    // Check ownership
    if (comment.userId.toString() !== req.user._id.toString() && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this comment'
      });
    }
    
    comment.content = content;
    await comment.save();
    
    res.json({
      success: true,
      comment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    // Check ownership
    if (comment.userId.toString() !== req.user._id.toString() && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }
    
    await comment.deleteOne();
    
    res.json({
      success: true,
      message: 'Comment deleted successfully'
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
  getCommentsByRecipe,
  createComment,
  updateComment,
  deleteComment
};