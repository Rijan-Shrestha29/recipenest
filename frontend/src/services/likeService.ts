import { api } from './api';

export const likeService = {
  async getLikesByRecipe(recipeId: string) {
    const response = await api.get(`/likes/recipe/${recipeId}`);
    return response.data;
  },

  async toggleLike(recipeId: string) {
    const response = await api.post('/likes/toggle', { recipeId });
    return response.data;
  },

  async checkLikeStatus(recipeId: string) {
    const response = await api.get(`/likes/check/${recipeId}`);
    return response.data;
  },
};