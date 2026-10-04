import { api } from './client';
import { type Track } from './tracks';

export interface HistoryItem {
  id: number;
  listened_at: string;
  track: Track;
}

export const historyApi = {
  getAll: async (): Promise<HistoryItem[]> => {
    const res = await api.get<HistoryItem[]>('/history');
    return res.data;
  },

  record: async (trackId: number): Promise<void> => {
    try {
      await api.post('/history', { track_id: trackId });
    } catch {
      // Ignore background analytics errors
    }
  },
};
