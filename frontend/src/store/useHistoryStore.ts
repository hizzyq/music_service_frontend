import { create } from 'zustand';
import { historyApi, type HistoryItem } from '../api/history';
import type { Track } from '../api/tracks';

interface HistoryState {
  history: HistoryItem[];
  historyCount: number;
  isLoading: boolean;
  loadHistory: () => Promise<void>;
  recordListen: (track: Track) => Promise<void>;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  history: [],
  historyCount: 0,
  isLoading: false,

  loadHistory: async () => {
    set({ isLoading: true });
    try {
      const data = await historyApi.getAll();
      set({ history: data, historyCount: data.length, isLoading: false });
    } catch (err) {
      console.error('Ошибка загрузки истории:', err);
      set({ isLoading: false });
    }
  },

  recordListen: async (track: Track) => {
    // 1. Оптимистичное Live-добавление записи в историю
    const newEntry: HistoryItem = {
      id: Date.now(),
      listened_at: new Date().toISOString(),
      track,
    };

    set({
      history: [newEntry, ...get().history.slice(0, 49)],
      historyCount: get().historyCount + 1,
    });

    // 2. Фоновая отправка на бэкенд
    try {
      await historyApi.record(track.id);
    } catch (err) {
      console.error('Не удалось сохранить историю прослушивания:', err);
    }
  },
}));
