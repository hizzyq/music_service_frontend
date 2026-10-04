import { create } from 'zustand';
import { favoritesApi } from '../api/favorites';
import { usePlaylistsStore } from './usePlaylistsStore';

interface FavoritesState {
  favoriteIds: Set<number>;
  isLoading: boolean;
  loadFavorites: () => Promise<void>;
  toggleFavorite: (trackId: number) => Promise<boolean>;
  isFavorite: (trackId: number) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoriteIds: new Set(),
  isLoading: false,

  loadFavorites: async () => {
    try {
      const ids = await favoritesApi.getIds();
      set({ favoriteIds: new Set(ids) });
    } catch {
      // Ignore if not logged in
    }
  },

  toggleFavorite: async (trackId: number) => {
    try {
      const res = await favoritesApi.toggle(trackId);
      const next = new Set(get().favoriteIds);
      if (res.favorited) {
        next.add(trackId);
      } else {
        next.delete(trackId);
      }
      set({ favoriteIds: next });

      // Live-обновление счетчика треков в плейлисте "Избранное"
      usePlaylistsStore.getState().updateTrackCount('Избранное', res.favorited ? 1 : -1);

      return res.favorited;
    } catch (err) {
      console.error('Ошибка добавления в избранное:', err);
      return false;
    }
  },

  isFavorite: (trackId: number) => get().favoriteIds.has(trackId),
}));
