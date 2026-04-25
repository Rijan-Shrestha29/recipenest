import { api } from './api';

export const bookmarkService = {
  async getMyBookmarks() {
    const response = await api.get('/bookmarks/my-bookmarks');
    return response.data;
  },

  async toggleBookmark(recipeId: string) {
    const response = await api.post('/bookmarks/toggle', { recipeId });
    return response.data;
  },

  async checkBookmarkStatus(recipeId: string) {
    const response = await api.get(`/bookmarks/check/${recipeId}`);
    return response.data;
  },
};