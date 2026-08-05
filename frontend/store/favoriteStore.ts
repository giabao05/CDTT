import { create } from 'zustand';
import { fetchUserFavorites } from '../lib/api';

interface FavoriteState {
  favoriteIds: number[];
  isLoaded: boolean;
  initFavorites: (email: string) => Promise<void>;
  addFavoriteId: (id: number) => void;
  removeFavoriteId: (id: number) => void;
  clearFavorites: () => void;
}

export const useFavoriteStore = create<FavoriteState>((set) => ({
  favoriteIds: [],
  isLoaded: false,
  initFavorites: async (email) => {
    if (!email) {
      set({ favoriteIds: [], isLoaded: true });
      return;
    }
    try {
      const favs = await fetchUserFavorites(email);
      const ids = favs.map((f: any) => parseInt(f.product.id));
      set({ favoriteIds: ids, isLoaded: true });
    } catch (e) {
      console.error('Failed to load favorites', e);
      set({ favoriteIds: [], isLoaded: true });
    }
  },
  addFavoriteId: (id) => set((state) => ({
    favoriteIds: [...new Set([...state.favoriteIds, id])]
  })),
  removeFavoriteId: (id) => set((state) => ({
    favoriteIds: state.favoriteIds.filter(fId => fId !== id)
  })),
  clearFavorites: () => set({ favoriteIds: [], isLoaded: false })
}));

