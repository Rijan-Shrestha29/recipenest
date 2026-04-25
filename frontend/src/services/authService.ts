import { api } from './api';
import { User, ChefDetails, LoginCredentials, RegisterData } from '../types';

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.data.success && response.data.token) {
      localStorage.setItem('accessToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      if (response.data.chefDetails) {
        localStorage.setItem('chefDetails', JSON.stringify(response.data.chefDetails));
      }
    }
    return response.data;
  },

  async register(data: RegisterData) {
    const response = await api.post('/auth/register', data);
    if (response.data.success && response.data.token) {
      localStorage.setItem('accessToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      if (response.data.chefDetails) {
        localStorage.setItem('chefDetails', JSON.stringify(response.data.chefDetails));
      }
    }
    return response.data;
  },

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    const response = await api.post('/auth/change-password', data);
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async verifyEmail(email: string, code: string) {
    const response = await api.post('/auth/verify-email', { email, code });
    return response.data;
  },

  async resendVerification(email: string) {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  },

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('chefDetails');
    window.location.href = '/';
  },

  getCurrentUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};