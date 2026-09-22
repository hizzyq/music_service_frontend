import { api } from './client';

export interface Track {
  id: number;
  title: string;
  duration: number;
  track_number: number;
  artist: string | null;
  album: string | null;
  stream_url?: string;
}

export const tracksApi = {
  getAll: async (): Promise<Track[]> => {
    const response = await api.get<Track[]>('/tracks');
    return response.data;
  },

  getStreamUrl: async (trackId: number): Promise<string> => {
    const response = await api.get<{ track_id: number; stream_url: string }>(
      `/tracks/${trackId}/stream`
    );
    return response.data.stream_url;
  },
};