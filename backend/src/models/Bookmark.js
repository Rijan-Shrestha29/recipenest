import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema({
  recipeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Ensure one bookmark per user per recipe
bookmarkSchema.index({ recipeId: 1, userId: 1 }, { unique: true });

export default mongoose.model('Bookmark', bookmarkSchema);