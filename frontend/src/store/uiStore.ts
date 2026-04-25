import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  isDarkMode: boolean;
  isLoading: boolean;
  toast: {
    open: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  };
  
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
  setLoading: (isLoading: boolean) => void;
  showToast: (message: string, type: UIState['toast']['type']) => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false,
  isDarkMode: localStorage.getItem('darkMode') === 'true',
  isLoading: false,
  toast: {
    open: false,
    message: '',
    type: 'info',
  },

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  
  toggleDarkMode: () => {
    const newDarkMode = !useUIStore.getState().isDarkMode;
    set({ isDarkMode: newDarkMode });
    localStorage.setItem('darkMode', String(newDarkMode));
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
  
  setLoading: (isLoading) => set({ isLoading }),
  
  showToast: (message, type) => set({ toast: { open: true, message, type } }),
  
  hideToast: () => set({ toast: { open: false, message: '', type: 'info' } }),
}));