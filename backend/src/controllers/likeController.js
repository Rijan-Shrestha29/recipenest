const Like = require('../models/Like');
const Recipe = require('../models/Recipe');

// @desc    Get likes for a recipe
// @route   GET /api/likes/recipe/:recipeId
// @access  Public
const getLikesByRecipe = async (req, res) => {
  try {
    const likes = await Like.find({ recipeId: req.params.recipeId })
      .populate('userId', 'name avatar');
    
    res.json({
      success: true,
      count: likes.length,
      likes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Toggle like on recipe
// @route   POST /api/likes/toggle
// @access  Private
const toggleLike = async (req, res) => {
  try {
    const { recipeId } = req.body;
    
    // Check if recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }
    
    const existingLike = await Like.findOne({
      recipeId,
      userId: req.user._id
    });
    
    if (existingLike) {
      // Unlike
      await existingLike.deleteOne();
      const likesCount = await Like.countDocuments({ recipeId });
      
      res.json({
        success: true,
        liked: false,
        likesCount,
        message: 'Recipe unliked'
      });
    } else {
      // Like
      await Like.create({
        recipeId,
        userId: req.user._id
      });
      
      const likesCount = await Like.countDocuments({ recipeId });
      
      res.json({
        success: true,
        liked: true,
        likesCount,
        message: 'Recipe liked'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Check if user liked recipe
// @route   GET /api/likes/check/:recipeId
// @access  Private
const checkLikeStatus = async (req, res) => {
  try {
    const like = await Like.findOne({
      recipeId: req.params.recipeId,
      userId: req.user._id
    });
    
    res.json({
      success: true,
      liked: !!like
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
  getLikesByRecipe,
  toggleLike,
  checkLikeStatus
};