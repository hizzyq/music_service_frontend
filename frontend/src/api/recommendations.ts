import { api } from './client';
import type { Track } from './tracks';

export interface RecommendedTrack extends Track {
  recommendation: {
    score: number;
    reason: string;
  };
}

export const recommendationsApi = {
  getAll: async (limit = 20): Promise<RecommendedTrack[]> => {
    const res = await api.get<RecommendedTrack[]>('/recommendations', {
      params: { limit },
    });
    return res.data;
  },
};
