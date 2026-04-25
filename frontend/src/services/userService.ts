import { api } from './api';

export const userService = {
  async getAllChefs() {
    const response = await api.get('/users/chefs');
    return response.data;
  },

  async getChefById(id: string) {
    const response = await api.get(`/users/chefs/${id}`);
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/users/profile');
    return response.data;
  },

  async updateProfile(data: { name?: string; avatar?: string }) {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  async updateChefProfile(data: {
    bio?: string;
    specialty?: string;
    experience?: number;
    profileImage?: string;
    coverImage?: string;
    socialMedia?: Record<string, string>;
  }) {
    const response = await api.put('/users/chef/profile', data);
    return response.data;
  },

  async getUserStats() {
    const response = await api.get('/users/stats');
    return response.data;
  },

  async deleteAccount() {
    const response = await api.delete('/users/profile');
    return response.data;
  },
};