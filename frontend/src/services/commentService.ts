import { api } from './api';

export const commentService = {
  async getCommentsByRecipe(recipeId: string) {
    const response = await api.get(`/comments/recipe/${recipeId}`);
    return response.data;
  },

  async createComment(recipeId: string, content: string) {
    const response = await api.post('/comments', { recipeId, content });
    return response.data;
  },

  async updateComment(commentId: string, content: string) {
    const response = await api.put(`/comments/${commentId}`, { content });
    return response.data;
  },

  async deleteComment(commentId: string) {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  },
};