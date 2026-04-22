import mongoose from 'mongoose';

const chefDetailsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bio: {
    type: String,
    default: ''
  },
  specialty: {
    type: String,
    default: ''
  },
  experience: {
    type: Number,
    default: 0
  },
  profileImage: {
    type: String,
    default: ''
  },
  coverImage: {
    type: String,
    default: ''
  },
  socialMedia: {
    instagram: String,
    twitter: String,
    facebook: String,
    website: String
  }
}, {
  timestamps: true
});

export default mongoose.model('ChefDetails', chefDetailsSchema);