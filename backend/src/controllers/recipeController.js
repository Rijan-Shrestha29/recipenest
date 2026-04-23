const Recipe = require('../models/Recipe');
const Like = require('../models/Like');
const Bookmark = require('../models/Bookmark');
const Comment = require('../models/Comment');

// @desc    Get all recipes with filters
// @route   GET /api/recipes
// @access  Public
const getRecipes = async (req, res) => {
  try {
    const { 
      search, 
      category, 
      difficulty, 
      chefId,
      sort = 'newest',
      page = 1, 
      limit = 12 
    } = req.query;
    
    let query = { approvalStatus: 'approved' };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }
    
    if (chefId) {
      query.chefId = chefId;
    }
    
    let sortOption = {};
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'popular':
        sortOption = { views: -1 };
        break;
      case 'most-liked':
        // Will sort after getting likes count
        break;
      default:
        sortOption = { createdAt: -1 };
    }
    
    let recipes = await Recipe.find(query)
      .populate('chefId', 'name avatar')
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Get stats for each recipe
    const recipesWithStats = await Promise.all(recipes.map(async (recipe) => {
      const likesCount = await Like.countDocuments({ recipeId: recipe._id });
      const bookmarksCount = await Bookmark.countDocuments({ recipeId: recipe._id });
      const commentsCount = await Comment.countDocuments({ recipeId: recipe._id });
      
      return {
        ...recipe.toObject(),
        likesCount,
        bookmarksCount,
        commentsCount
      };
    }));
    
    // Sort by most liked if requested
    if (sort === 'most-liked') {
      recipesWithStats.sort((a, b) => b.likesCount - a.likesCount);
    }
    
    const total = await Recipe.countDocuments(query);
    
    res.json({
      success: true,
      recipes: recipesWithStats,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get recipe categories
// @route   GET /api/recipes/categories/all
// @access  Public
const getRecipeCategories = async (req, res) => {
  try {
    const categories = [
      'Appetizer',
      'Main Course', 
      'Dessert',
      'Breakfast',
      'Lunch',
      'Dinner',
      'Snack'
    ];
    
    const categoriesWithCount = await Promise.all(categories.map(async (category) => {
      const count = await Recipe.countDocuments({ 
        category, 
        approvalStatus: 'approved' 
      });
      return { name: category, count };
    }));
    
    res.json({
      success: true,
      categories: categoriesWithCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get trending recipes
// @route   GET /api/recipes/trending
// @access  Public
const getTrendingRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find({ approvalStatus: 'approved' })
      .populate('chefId', 'name avatar')
      .sort({ views: -1, createdAt: -1 })
      .limit(6);
    
    const recipesWithStats = await Promise.all(recipes.map(async (recipe) => {
      const likesCount = await Like.countDocuments({ recipeId: recipe._id });
      const commentsCount = await Comment.countDocuments({ recipeId: recipe._id });
      
      return {
        ...recipe.toObject(),
        likesCount,
        commentsCount
      };
    }));
    
    res.json({
      success: true,
      recipes: recipesWithStats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single recipe
// @route   GET /api/recipes/:id
// @access  Public
const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('chefId', 'name avatar');
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }
    
    // Increment views
    recipe.views += 1;
    await recipe.save();
    
    const likesCount = await Like.countDocuments({ recipeId: recipe._id });
    const bookmarksCount = await Bookmark.countDocuments({ recipeId: recipe._id });
    const commentsCount = await Comment.countDocuments({ recipeId: recipe._id });
    
    // Check if current user liked/bookmarked
    let isLiked = false;
    let isBookmarked = false;
    
    if (req.user) {
      isLiked = await Like.exists({ recipeId: recipe._id, userId: req.user._id });
      isBookmarked = await Bookmark.exists({ recipeId: recipe._id, userId: req.user._id });
    }
    
    res.json({
      success: true,
      recipe: {
        ...recipe.toObject(),
        likesCount,
        bookmarksCount,
        commentsCount,
        isLiked: !!isLiked,
        isBookmarked: !!isBookmarked
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create recipe
// @route   POST /api/recipes
// @access  Private (Chef only)
const createRecipe = async (req, res) => {
  try {
    const recipeData = {
      ...req.body,
      chefId: req.user._id
    };
    
    const recipe = await Recipe.create(recipeData);
    
    res.status(201).json({
      success: true,
      recipe
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update recipe
// @route   PUT /api/recipes/:id
// @access  Private (Chef owner or Admin)
const updateRecipe = async (req, res) => {
  try {
    let recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }
    
    // Check ownership
    if (recipe.chefId.toString() !== req.user._id.toString() && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this recipe'
      });
    }
    
    recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      recipe
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete recipe
// @route   DELETE /api/recipes/:id
// @access  Private (Chef owner or Admin)
const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }
    
    // Check ownership
    if (recipe.chefId.toString() !== req.user._id.toString() && req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this recipe'
      });
    }
    
    await recipe.deleteOne();
    
    // Delete related likes, bookmarks, comments
    await Like.deleteMany({ recipeId: req.params.id });
    await Bookmark.deleteMany({ recipeId: req.params.id });
    await Comment.deleteMany({ recipeId: req.params.id });
    
    res.json({
      success: true,
      message: 'Recipe deleted successfully'
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
  getRecipes,
  getRecipeCategories,
  getTrendingRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe
};