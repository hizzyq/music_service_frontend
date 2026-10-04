import { api } from './client';
import { type Track } from './tracks';

export interface ToggleFavoriteResponse {
  favorited: boolean;
  message: string;
}

export const favoritesApi = {
  getAll: async (): Promise<Track[]> => {
    const res = await api.get<Track[]>('/favorites');
    return res.data;
  },

  getIds: async (): Promise<number[]> => {
    const res = await api.get<number[]>('/favorites/ids');
    return res.data;
  },

  toggle: async (trackId: number): Promise<ToggleFavoriteResponse> => {
    const res = await api.post<ToggleFavoriteResponse>(`/favorites/${trackId}`);
    return res.data;
  },
};
