import { api } from './api';

export const adminService = {
  async getDashboardStats() {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  async getAllRecipes(status?: string) {
    const response = await api.get('/admin/recipes', { params: { status } });
    return response.data;
  },

  async getPendingRecipes() {
    const response = await api.get('/admin/recipes/pending');
    return response.data;
  },

  async approveRecipe(recipeId: string) {
    const response = await api.put(`/admin/recipes/${recipeId}/approve`);
    return response.data;
  },

  async rejectRecipe(recipeId: string, reason: string) {
    const response = await api.put(`/admin/recipes/${recipeId}/reject`, { reason });
    return response.data;
  },

  async deleteRecipe(recipeId: string) {
    const response = await api.delete(`/admin/recipes/${recipeId}`);
    return response.data;
  },

  async getAllUsers() {
    const response = await api.get('/admin/users');
    return response.data;
  },

  async getAllChef(){
    const response = await api.get('/admin/chefs');
    return response.data;
  },

  async updateUserRole(userId: string, role: string) {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  async suspendUser(userId: string, reason: string) {
    const response = await api.put(`/admin/users/${userId}/suspend`, { reason });
    return response.data;
  },

  async unsuspendUser(userId: string) {
    const response = await api.put(`/admin/users/${userId}/unsuspend`);
    return response.data;
  },

  async getAllComments() {
    const response = await api.get('/admin/comments');
    return response.data;
  },

  async deleteComment(commentId: string) {
    const response = await api.delete(`/admin/comments/${commentId}`);
    return response.data;
  },
};