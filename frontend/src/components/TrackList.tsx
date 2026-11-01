import React, { useEffect } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { useAuthStore } from '../store/useAuthStore';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { adminApi } from '../api/admin';
import { Play, Pause, Disc3, Clock, Heart, Trash2 } from 'lucide-react';
import { formatTime } from '../utils/formatTime';

export const TrackList: React.FC = () => {
  const {
    tracks,
    isTracksLoading,
    currentTrack,
    isPlaying,
    playTrack,
    fetchTracks,
  } = usePlayerStore();

  const { isAdmin } = useAuthStore();
  const { favoriteIds, loadFavorites, toggleFavorite } = useFavoritesStore();

  useEffect(() => {
    fetchTracks();
    loadFavorites();
  }, [fetchTracks, loadFavorites]);

  const handleToggleFavorite = async (e: React.MouseEvent, trackId: number) => {
    e.stopPropagation();
    await toggleFavorite(trackId);
  };

  const handleDeleteTrack = async (e: React.MouseEvent, trackId: number, title: string) => {
    e.stopPropagation();
    if (!confirm(`Удалить трек "${title}" из библиотеки и S3-хранилища?`)) return;

    try {
      await adminApi.deleteTrack(trackId);
      usePlayerStore.setState((prev) => ({
        tracks: prev.tracks.filter((t) => t.id !== trackId),
        queue: prev.queue.filter((t) => t.id !== trackId),
      }));
      await fetchTracks();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Не удалось удалить трек');
    }
  };

  if (isTracksLoading && tracks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-500">
        Загрузка треков...
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-2">
        <Disc3 className="w-12 h-12 stroke-[1.5] text-zinc-600" />
        <p>Каталог пуст. Загрузите первый трек в MinIO или базу данных.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 md:py-6">
      <div className="flex items-center justify-between mb-4 md:mb-6 pb-3 md:pb-4 border-b border-zinc-800/80">
        <div>
          <div className="font-mono text-xs text-emerald-400 mb-1 flex items-center gap-1.5">
            <span className="text-zinc-500">$</span>
            <span>ls -la ~/music/tracks/</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-zinc-100 tracking-tight font-mono">Каталог треков</h2>
          <p className="text-[11px] md:text-xs text-zinc-400 mt-0.5">drwxr-xr-x 1 hizzyq audio • Хранилище MinIO S3</p>
        </div>
        <span className="text-xs text-emerald-400 font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          total: {tracks.length} {tracks.length === 1 ? 'файл' : 'файлов'}
        </span>
      </div>

      <div className="w-full">
        {/* Шапка таблицы (скрыта на мобильных) */}
        <div className="hidden md:grid grid-cols-[40px_1.5fr_1fr_120px_70px_80px] gap-4 px-4 py-2 border-b border-zinc-800 text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
          <span className="text-center">#</span>
          <span>Название</span>
          <span>Альбом</span>
          <span>Волна</span>
          <span className="flex justify-end pr-2">
            <Clock className="w-4 h-4" />
          </span>
          <span className="text-right pr-1">Действия</span>
        </div>

        {/* Список записей */}
        <div className="divide-y divide-zinc-900/60 mt-1">
          {tracks.map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id;
            const isThisPlaying = isCurrent && isPlaying;
            const isFavorite = favoriteIds.has(track.id);
            const trackNum = String(track.track_number || idx + 1).padStart(2, '0');

            return (
              <div
                key={track.id}
                onClick={() => playTrack(track)}
                className={`flex items-center justify-between gap-3 px-3 py-2.5 md:grid md:grid-cols-[40px_1.5fr_1fr_120px_70px_80px] md:gap-4 md:px-4 md:py-3 rounded-xl transition-colors cursor-pointer group ${
                  isCurrent
                    ? 'bg-zinc-800/80 text-emerald-400'
                    : 'hover:bg-zinc-900/60 text-zinc-300 hover:text-zinc-100'
                }`}
              >
                {/* Номер / Кнопка Play */}
                <div className="hidden md:flex items-center justify-center text-xs font-mono font-medium text-zinc-500">
                  <span className="group-hover:hidden">
                    {isThisPlaying ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    ) : (
                      trackNum
                    )}
                  </span>
                  <button className="hidden group-hover:flex items-center justify-center text-zinc-100 hover:scale-110 transition-transform">
                    {isThisPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>
                </div>

                {/* Обложка и Название */}
                <div className="flex items-center gap-3 truncate pr-4">
                  {track.cover_url ? (
                    <img
                      src={track.cover_url}
                      alt={track.title}
                      className="w-10 h-10 rounded-lg object-cover shrink-0 border border-zinc-700/50 shadow"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700/50 text-zinc-500">
                      <Disc3 className="w-5 h-5" />
                    </div>
                  )}
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium truncate ${isCurrent ? 'text-emerald-400' : 'text-zinc-100'}`}>
                        {track.title}
                      </span>
                      {track.format && (
                        <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400 shrink-0">
                          {track.format}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-400 truncate mt-0.5">
                      {track.artist || 'Неизвестный исполнитель'}
                    </div>
                  </div>
                </div>

                {/* Альбом */}
                <div className="text-sm text-zinc-400 truncate">
                  {track.album || 'Сингл'}
                </div>

                {/* Мини-превью звуковой волны (Waveform) */}
                <div className="hidden md:flex items-center h-5 gap-[1px] opacity-70 group-hover:opacity-100 transition-opacity">
                  {track.waveform && track.waveform.length > 0 ? (
                    track.waveform.slice(0, 36).map((peak, wIdx) => (
                      <div
                        key={wIdx}
                        className={`w-[2px] rounded-full ${
                          isCurrent ? 'bg-emerald-400' : 'bg-zinc-600 group-hover:bg-zinc-500'
                        }`}
                        style={{ height: `${Math.max(3, Math.round(peak * 18))}px` }}
                      />
                    ))
                  ) : (
                    <span className="text-[10px] text-zinc-600">нет волны</span>
                  )}
                </div>

                {/* Длительность */}
                <div className="text-sm text-zinc-400 font-mono text-right pr-2">
                  {formatTime(track.duration)}
                </div>

                {/* Действия: Избранное + Удаление (для админа) */}
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={(e) => handleToggleFavorite(e, track.id)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isFavorite
                        ? 'text-rose-500 hover:text-rose-400'
                        : 'text-zinc-500 hover:text-zinc-200 opacity-0 group-hover:opacity-100'
                    }`}
                    title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>

                  {isAdmin && (
                    <button
                      onClick={(e) => handleDeleteTrack(e, track.id, track.title)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      title="Удалить трек из библиотеки"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};