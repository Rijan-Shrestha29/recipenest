export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const RECIPE_CATEGORIES = [
  'Appetizer',
  'Main Course',
  'Dessert',
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snack',
];

export const DIFFICULTY_LEVELS = [
  { value: 'Easy', label: 'Easy', color: 'text-green-600' },
  { value: 'Medium', label: 'Medium', color: 'text-yellow-600' },
  { value: 'Hard', label: 'Hard', color: 'text-red-600' },
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'most-liked', label: 'Most Liked' },
];

export const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=f97316&color=fff';

export const DEFAULT_COVER_IMAGE = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=400&fit=crop';