import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema({
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

// Ensure one like per user per recipe
likeSchema.index({ recipeId: 1, userId: 1 }, { unique: true });

export default mongoose.model('Like', likeSchema);