import { create } from 'zustand';
import api from '../services/api';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithCode: (code: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: true,

  loginWithCode: async (code) => {
    const { data } = await api.post('/auth/use-code', { code });
    if (data.success) {
      localStorage.setItem('accessToken', data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
      set({ user: data.data.user, isAuthenticated: true });
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        set({ isLoading: false });
        return;
      }
      const { data } = await api.get('/auth/me');
      if (data.success) {
        set({ user: data.data, isAuthenticated: true });
      }
    } catch {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  updateUser: (userData) => {
    set((state) => ({ user: state.user ? { ...state.user, ...userData } : null }));
  },
}));
