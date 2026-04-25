import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, ChefDetails } from '../types';
import { authService } from '../services/authService';

interface AuthState {
  user: User | null;
  chefDetails: ChefDetails | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User }>;
  register: (data: any) => Promise<{ success: boolean; user?: User }>;
  logout: () => void;
  setUser: (user: User | null) => void;
  updateUser: (user: Partial<User>) => void;
  checkAuth: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      chefDetails: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
  set({ isLoading: true, error: null });
  try {
    const response = await authService.login({ email, password });
    
    if (response.success && response.user) {
      set({
        user: response.user,
        chefDetails: response.chefDetails || null,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true, user: response.user };
    } else {
      // Don't clear form data, just return error
      set({ isLoading: false, error: response.message || 'Login failed' });
      return { success: false, message: response.message || 'Login failed' };
    }
  } catch (error: any) {
    // Don't clear form data, just set error
    const errorMessage = error.response?.data?.message || error.message || 'Login failed';
    set({ 
      isLoading: false, 
      error: errorMessage 
    });
    return { success: false, message: errorMessage };
  }
},

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(data);
          
          const isSuccess = response.success === true || response.user !== undefined;
          
          if (isSuccess && response.user) {
            set({
              user: response.user,
              chefDetails: response.chefDetails || null,
              isAuthenticated: true,
              isLoading: false,
            });
            return { success: true, user: response.user };
          } else {
            set({ 
              isLoading: false, 
              error: response.message || 'Registration failed' 
            });
            return { success: false };
          }
        } catch (error: any) {
          console.error('Registration error:', error);
          set({ 
            isLoading: false, 
            error: error.response?.data?.message || error.message || 'Registration failed' 
          });
          return { success: false };
        }
      },

      logout: () => {
        authService.logout();
        set({
          user: null,
          chefDetails: null,
          isAuthenticated: false,
          error: null,
        });
      },

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      updateUser: (updatedData) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...updatedData };
          set({ user: updatedUser });
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      },

      checkAuth: () => {
        const user = authService.getCurrentUser();
        if (user) {
          set({
            user,
            isAuthenticated: true,
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);