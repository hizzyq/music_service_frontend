import { api } from './client';
import { type Track } from './tracks';

export interface PlaylistSummary {
  id: number;
  name: string;
  description: string | null;
  tracks_count: number;
  created_at: string;
}

export interface PlaylistDetail {
  id: number;
  name: string;
  description: string | null;
  tracks: Track[];
}

export const playlistsApi = {
  getAll: async (): Promise<PlaylistSummary[]> => {
    const res = await api.get<PlaylistSummary[]>('/playlists');
    return res.data;
  },

  getById: async (id: number): Promise<PlaylistDetail> => {
    const res = await api.get<PlaylistDetail>(`/playlists/${id}`);
    return res.data;
  },

  create: async (name: string, description?: string): Promise<PlaylistSummary> => {
    const res = await api.post<PlaylistSummary>('/playlists', { name, description });
    return res.data;
  },

  addTrack: async (playlistId: number, trackId: number): Promise<void> => {
    await api.post(`/playlists/${playlistId}/tracks`, { track_id: trackId });
  },

  removeTrack: async (playlistId: number, trackId: number): Promise<void> => {
    await api.delete(`/playlists/${playlistId}/tracks/${trackId}`);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/playlists/${id}`);
  },
};
