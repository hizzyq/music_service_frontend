import { create } from 'zustand';
import { playlistsApi, type PlaylistSummary } from '../api/playlists';

interface PlaylistsState {
  playlists: PlaylistSummary[];
  isLoading: boolean;
  fetchPlaylists: () => Promise<void>;
  createPlaylist: (name: string, description?: string) => Promise<PlaylistSummary>;
  deletePlaylist: (id: number) => Promise<void>;
  updateTrackCount: (name: string, delta: number) => void;
  updateTrackCountById: (id: number, delta: number) => void;
}

export const usePlaylistsStore = create<PlaylistsState>((set, get) => ({
  playlists: [],
  isLoading: false,

  fetchPlaylists: async () => {
    set({ isLoading: true });
    try {
      const data = await playlistsApi.getAll();
      set({ playlists: data, isLoading: false });
    } catch (err) {
      console.error(err);
      set({ isLoading: false });
    }
  },

  createPlaylist: async (name: string, description?: string) => {
    const created = await playlistsApi.create(name, description);
    set({ playlists: [created, ...get().playlists] });
    return created;
  },

  deletePlaylist: async (id: number) => {
    await playlistsApi.delete(id);
    set({ playlists: get().playlists.filter((p) => p.id !== id) });
  },

  updateTrackCount: (name: string, delta: number) => {
    set({
      playlists: get().playlists.map((pl) =>
        pl.name.toLowerCase() === name.toLowerCase()
          ? { ...pl, tracks_count: Math.max(0, pl.tracks_count + delta) }
          : pl
      ),
    });
  },

  updateTrackCountById: (id: number, delta: number) => {
    set({
      playlists: get().playlists.map((pl) =>
        pl.id === id
          ? { ...pl, tracks_count: Math.max(0, pl.tracks_count + delta) }
          : pl
      ),
    });
  },
}));
