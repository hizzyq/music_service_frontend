import React, { useEffect, useState } from 'react';
import { historyApi, type HistoryItem } from '../api/history';
import { usePlayerStore } from '../store/usePlayerStore';
import { History, Play, Disc3 } from 'lucide-react';
import { formatTime } from '../utils/formatTime';

export const HistoryView: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { playTrack, currentTrack, isPlaying } = usePlayerStore();

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await historyApi.getAll();
      setHistory(data);
    } catch (err) {
      console.error('Ошибка загрузки истории:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-zinc-100 tracking-tight flex items-center gap-3">
          <History className="w-6 h-6 text-emerald-400" />
          <span>История прослушиваний</span>
        </h2>
        <p className="text-xs text-zinc-400 mt-1">Недавно воспроизведенные композиции</p>
      </div>

      {isLoading ? (
        <div className="text-zinc-500 text-center py-12">Загрузка истории...</div>
      ) : history.length === 0 ? (
        <div className="text-center py-16 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
          <History className="w-12 h-12 mx-auto stroke-[1.5] text-zinc-600 mb-3" />
          <p>История пуста. Включите любой трек, чтобы он появился здесь!</p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-900/60">
          {history.map((item, idx) => {
            const track = item.track;
            const isCurrent = currentTrack?.id === track.id;
            const isThisPlaying = isCurrent && isPlaying;
            const dateStr = new Date(item.listened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={item.id}
                onClick={() => playTrack(track)}
                className={`grid grid-cols-[48px_1fr_1fr_100px_80px] gap-4 px-4 py-3 items-center rounded-xl transition-colors cursor-pointer group ${
                  isCurrent ? 'bg-zinc-800/80 text-emerald-400' : 'hover:bg-zinc-900/60 text-zinc-300 hover:text-zinc-100'
                }`}
              >
                <div className="flex items-center justify-center text-sm font-medium">
                  <span className="group-hover:hidden text-zinc-500 text-xs">{idx + 1}</span>
                  <button className="hidden group-hover:flex items-center justify-center text-zinc-100 hover:scale-110 transition-transform">
                    {isThisPlaying ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-3 truncate pr-4">
                  {track.cover_url ? (
                    <img
                      src={track.cover_url}
                      alt={track.title}
                      className="w-10 h-10 rounded-lg object-cover shrink-0 border border-zinc-700/50"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700/50 text-zinc-500">
                      <Disc3 className="w-5 h-5" />
                    </div>
                  )}
                  <div className="truncate">
                    <div className={`font-medium truncate ${isCurrent ? 'text-emerald-400' : 'text-zinc-100'}`}>
                      {track.title}
                    </div>
                    <div className="text-xs text-zinc-400 truncate mt-0.5">
                      {track.artist || 'Неизвестный исполнитель'}
                    </div>
                  </div>
                </div>

                <div className="text-sm text-zinc-400 truncate">{track.album || 'Сингл'}</div>

                <div className="text-xs text-zinc-500 font-mono text-right">{dateStr}</div>

                <div className="text-sm text-zinc-500 font-mono text-right pr-2">
                  {formatTime(track.duration)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
