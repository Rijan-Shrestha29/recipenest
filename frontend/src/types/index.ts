export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'foodlover' | 'chef' | 'superadmin';
  avatar: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface Chef extends User {
  _id: string;
  bio: string;
  specialty: string;
  experience: number;
  profileImage: string;
  coverImage: string;
  socialMedia: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    website?: string;
  };
}

export interface ChefDetails {
  userId: string;
  bio: string;
  specialty: string;
  experience: number;
  profileImage: string;
  coverImage: string;
  socialMedia: Record<string, string>;
}

export interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

export interface Recipe {
  _id: string;
  chefId: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  prepTime: number;
  cookTime: number;
  servings: number;
  ingredients: Ingredient[];
  instructions: string[];
  image: string;
  tags: string[];
  approvalStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  views: number;
  createdAt: string;
  updatedAt: string;
  // Additional fields from API
  chefName?: string;
  chefAvatar?: string;
  likesCount?: number;
  bookmarksCount?: number;
  commentsCount?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export interface Comment {
  id: string;
  recipeId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Like {
  id: string;
  recipeId: string;
  userId: string;
  createdAt: string;
}

export interface Bookmark {
  id: string;
  recipeId: string;
  userId: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
  user?: User;
  chefDetails?: ChefDetails;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'foodlover' | 'chef';
  bio?: string;
  specialty?: string;
  experience?: number;
  profileImage?: string;
}