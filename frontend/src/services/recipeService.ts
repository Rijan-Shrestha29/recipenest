import { api } from './api';
import { Recipe } from '../types';

export const recipeService = {
  async getRecipes(params?: {
    search?: string;
    category?: string;
    difficulty?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await api.get('/recipes', { params });
    return response.data;
  },

  // Get chef's own recipes
  async getMyRecipes() {
    const response = await api.get('/recipes/chef/my-recipes');
    return response.data;
  },

  async getRecipeById(id: string) {
    const response = await api.get(`/recipes/${id}`);
    return response.data;
  },

  async getTrendingRecipes() {
    const response = await api.get('/recipes/trending');
    return response.data;
  },

  async getRecipeCategories() {
    const response = await api.get('/recipes/categories');
    return response.data;
  },

  async createRecipe(data: Partial<Recipe>) {
    const response = await api.post('/recipes', data);
    return response.data;
  },

  async updateRecipe(id: string, data: Partial<Recipe>) {
    const response = await api.put(`/recipes/${id}`, data);
    return response.data;
  },

  async deleteRecipe(id: string) {
    const response = await api.delete(`/recipes/${id}`);
    return response.data;
  },
};