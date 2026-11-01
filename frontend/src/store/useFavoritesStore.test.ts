import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useFavoritesStore } from './useFavoritesStore';
import { favoritesApi } from '../api/favorites';
import { usePlaylistsStore } from './usePlaylistsStore';

vi.mock('../api/favorites', () => ({
  favoritesApi: {
    getIds: vi.fn(),
    toggle: vi.fn(),
  },
}));

describe('useFavoritesStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useFavoritesStore.setState({ favoriteIds: new Set(), isLoading: false });
    usePlaylistsStore.setState({
      playlists: [
        { id: 1, name: 'Избранное', description: 'Favorites', tracks_count: 0, created_at: '' },
      ],
    });
  });

  it('loads favorite IDs and populates the Set', async () => {
    vi.mocked(favoritesApi.getIds).mockResolvedValue([10, 20, 30]);

    await useFavoritesStore.getState().loadFavorites();

    const ids = useFavoritesStore.getState().favoriteIds;
    expect(ids.size).toBe(3);
    expect(ids.has(10)).toBe(true);
    expect(ids.has(20)).toBe(true);
    expect(ids.has(30)).toBe(true);
    expect(useFavoritesStore.getState().isFavorite(10)).toBe(true);
    expect(useFavoritesStore.getState().isFavorite(999)).toBe(false);
  });

  it('toggles favorite ON: adds ID and increments count in favorites playlist', async () => {
    vi.mocked(favoritesApi.toggle).mockResolvedValue({
      favorited: true,
      message: 'Добавлено в избранное',
    });

    const result = await useFavoritesStore.getState().toggleFavorite(5);

    expect(result).toBe(true);
    expect(useFavoritesStore.getState().favoriteIds.has(5)).toBe(true);

    const pl = usePlaylistsStore.getState().playlists.find((p) => p.name === 'Избранное');
    expect(pl?.tracks_count).toBe(1);
  });

  it('toggles favorite OFF: removes ID and decrements count', async () => {
    useFavoritesStore.setState({ favoriteIds: new Set([5]) });
    usePlaylistsStore.setState({
      playlists: [
        { id: 1, name: 'Избранное', description: 'Favorites', tracks_count: 5, created_at: '' },
      ],
    });

    vi.mocked(favoritesApi.toggle).mockResolvedValue({
      favorited: false,
      message: 'Удалено из избранного',
    });

    const result = await useFavoritesStore.getState().toggleFavorite(5);

    expect(result).toBe(false);
    expect(useFavoritesStore.getState().favoriteIds.has(5)).toBe(false);

    const pl = usePlaylistsStore.getState().playlists.find((p) => p.name === 'Избранное');
    expect(pl?.tracks_count).toBe(4);
  });
});
