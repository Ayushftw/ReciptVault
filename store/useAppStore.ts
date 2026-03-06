import { create } from 'zustand';
import { Receipt, User } from '../types';

export type ThemeMode = 'light' | 'dark' | 'system';

interface AppState {
  // Auth
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  // Receipts
  receipts: Receipt[];
  setReceipts: (receipts: Receipt[]) => void;
  addReceipt: (receipt: Receipt) => void;
  updateReceipt: (id: string, data: Partial<Receipt>) => void;
  removeReceipt: (id: string) => void;

  // Theme
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;

  // UI
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Auth
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),

  // Receipts
  receipts: [],
  setReceipts: (receipts) => set({ receipts }),
  addReceipt: (receipt) =>
    set((state) => ({ receipts: [receipt, ...state.receipts] })),
  updateReceipt: (id, data) =>
    set((state) => ({
      receipts: state.receipts.map((r) =>
        r.id === id ? { ...r, ...data } : r
      ),
    })),
  removeReceipt: (id) =>
    set((state) => ({
      receipts: state.receipts.filter((r) => r.id !== id),
    })),

  // Theme
  themeMode: 'system',
  setThemeMode: (mode) => set({ themeMode: mode }),

  // UI
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  error: null,
  setError: (error) => set({ error }),
}));
