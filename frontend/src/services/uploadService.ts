import { api } from './api';

export const uploadService = {
  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async uploadRecipeImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/upload/recipe-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async uploadCoverImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/upload/cover-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async uploadGeneralImage(file: File, folder?: string) {
    const formData = new FormData();
    formData.append('image', file);
    if (folder) formData.append('folder', folder);
    const response = await api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};