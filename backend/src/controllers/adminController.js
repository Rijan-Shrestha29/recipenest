const User = require("../models/User");
const Recipe = require("../models/Recipe");
const Comment = require("../models/Comment");
const Like = require("../models/Like");
const Bookmark = require("../models/Bookmark");
const ChefDetails = require("../models/ChefDetails");

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalChefs = await User.countDocuments({ role: "chef" });
    const totalFoodLovers = await User.countDocuments({ role: "foodlover" });
    const totalRecipes = await Recipe.countDocuments();
    const pendingRecipes = await Recipe.countDocuments({
      approvalStatus: "pending",
    });
    const approvedRecipes = await Recipe.countDocuments({
      approvalStatus: "approved",
    });
    const rejectedRecipes = await Recipe.countDocuments({
      approvalStatus: "rejected",
    });
    const totalComments = await Comment.countDocuments();
    const totalLikes = await Like.countDocuments();
    const totalBookmarks = await Bookmark.countDocuments();

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          chefs: totalChefs,
          foodLovers: totalFoodLovers,
        },
        recipes: {
          total: totalRecipes,
          pending: pendingRecipes,
          approved: approvedRecipes,
          rejected: rejectedRecipes,
        },
        engagement: {
          totalComments,
          totalLikes,
          totalBookmarks,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all recipes (including pending)
// @route   GET /api/admin/recipes
// @access  Private/Admin
const getAllRecipes = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    let query = {};

    const recipes = await Recipe.find(query)
      .populate("chefId", "name email avatar")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Recipe.countDocuments(query);

    res.json({
      success: true,
      recipes,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get pending recipes
// @route   GET /api/admin/recipes/pending
// @access  Private/Admin
const getPendingRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find({ approvalStatus: "pending" })
      .populate("chefId", "name email avatar")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: recipes.length,
      recipes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Approve recipe
// @route   PUT /api/admin/recipes/:id/approve
// @access  Private/Admin
const approveRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    recipe.approvalStatus = "approved";
    await recipe.save();

    res.json({
      success: true,
      message: "Recipe approved successfully",
      recipe,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Reject recipe
// @route   PUT /api/admin/recipes/:id/reject
// @access  Private/Admin
const rejectRecipe = async (req, res) => {
  try {
    const { reason } = req.body;

    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    recipe.approvalStatus = "rejected";
    recipe.rejectionReason = reason || "No reason provided";
    await recipe.save();

    res.json({
      success: true,
      message: "Recipe rejected",
      recipe,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete recipe (admin)
// @route   DELETE /api/admin/recipes/:id
// @access  Private/Admin
const deleteRecipeAdmin = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    await recipe.deleteOne();
    await Like.deleteMany({ recipeId: req.params.id });
    await Bookmark.deleteMany({ recipeId: req.params.id });
    await Comment.deleteMany({ recipeId: req.params.id });

    res.json({
      success: true,
      message: "Recipe deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsersAdmin = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["foodlover", "chef", "superadmin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    // If changing to chef, create chef details
    if (role === "chef" && oldRole !== "chef") {
      const existingDetails = await ChefDetails.findOne({ userId: user._id });
      if (!existingDetails) {
        await ChefDetails.create({
          userId: user._id,
          bio: "",
          specialty: "",
          experience: 0,
          profileImage: user.avatar,
          coverImage:
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
        });
      }
    }

    res.json({
      success: true,
      message: "User role updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Suspend user
// @route   PUT /api/admin/users/:id/suspend
// @access  Private/Admin
const suspendUser = async (req, res) => {
  try {
    const { reason } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isSuspended = true;
    user.suspendedAt = new Date();
    user.suspendedReason = reason || "Violation of terms";
    await user.save();

    res.json({
      success: true,
      message: "User suspended successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Unsuspend user
// @route   PUT /api/admin/users/:id/unsuspend
// @access  Private/Admin
const unsuspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isSuspended = false;
    user.suspendedAt = null;
    user.suspendedReason = null;
    await user.save();

    res.json({
      success: true,
      message: "User unsuspended successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all comments (admin)
// @route   GET /api/admin/comments
// @access  Private/Admin
const getAllCommentsAdmin = async (req, res) => {
  try {
    const comments = await Comment.find({})
      .populate("userId", "name email")
      .populate("recipeId", "title")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: comments.length,
      comments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete comment (admin)
// @route   DELETE /api/admin/comments/:id
// @access  Private/Admin
const deleteCommentAdmin = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    await comment.deleteOne();

    res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
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
  deleteCommentAdmin,
};
