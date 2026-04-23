const Bookmark = require('../models/Bookmark');
const Recipe = require('../models/Recipe');

// @desc    Get user's bookmarks
// @route   GET /api/bookmarks/my-bookmarks
// @access  Private
const getMyBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user._id })
      .populate({
        path: 'recipeId',
        populate: { path: 'chefId', select: 'name avatar' }
      })
      .sort({ createdAt: -1 });
    
    const recipes = bookmarks.map(bookmark => bookmark.recipeId);
    
    res.json({
      success: true,
      count: recipes.length,
      bookmarks: recipes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Toggle bookmark on recipe
// @route   POST /api/bookmarks/toggle
// @access  Private
const toggleBookmark = async (req, res) => {
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
    
    const existingBookmark = await Bookmark.findOne({
      recipeId,
      userId: req.user._id
    });
    
    if (existingBookmark) {
      // Remove bookmark
      await existingBookmark.deleteOne();
      const bookmarksCount = await Bookmark.countDocuments({ recipeId });
      
      res.json({
        success: true,
        bookmarked: false,
        bookmarksCount,
        message: 'Bookmark removed'
      });
    } else {
      // Add bookmark
      await Bookmark.create({
        recipeId,
        userId: req.user._id
      });
      
      const bookmarksCount = await Bookmark.countDocuments({ recipeId });
      
      res.json({
        success: true,
        bookmarked: true,
        bookmarksCount,
        message: 'Recipe bookmarked'
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

// @desc    Check if user bookmarked recipe
// @route   GET /api/bookmarks/check/:recipeId
// @access  Private
const checkBookmarkStatus = async (req, res) => {
  try {
    const bookmark = await Bookmark.findOne({
      recipeId: req.params.recipeId,
      userId: req.user._id
    });
    
    res.json({
      success: true,
      bookmarked: !!bookmark
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
  getMyBookmarks,
  toggleBookmark,
  checkBookmarkStatus
};