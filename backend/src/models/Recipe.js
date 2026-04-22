import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema({
  name: String,
  quantity: String,
  unit: String
});

const recipeSchema = new mongoose.Schema({
  chefId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Appetizer', 'Main Course', 'Dessert', 'Breakfast', 'Lunch', 'Dinner', 'Snack']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard']
  },
  prepTime: {
    type: Number,
    required: true
  },
  cookTime: {
    type: Number,
    required: true
  },
  servings: {
    type: Number,
    required: true
  },
  ingredients: [ingredientSchema],
  instructions: [String],
  image: {
    type: String,
    required: true
  },
  tags: [String],
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: String,
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search
recipeSchema.index({ title: 'text', description: 'text', tags: 'text' });

export default mongoose.model('Recipe', recipeSchema);