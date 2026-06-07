import { create } from 'zustand';

interface AppState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  theme: 'dark',

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setTheme: (theme) => {
    set({ theme });
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  },
}));
