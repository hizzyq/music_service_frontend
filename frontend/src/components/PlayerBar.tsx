import React, { useRef } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music, Heart } from 'lucide-react';
import { formatTime } from '../utils/formatTime';

export const PlayerBar: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isLoadingStream,
    togglePlay,
    seek,
    setVolume,
    playNext,
    playPrev,
  } = usePlayerStore();

  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const waveformRef = useRef<HTMLDivElement>(null);

  if (!currentTrack) return null;

  const isFav = isFavorite(currentTrack.id);

  const handleToggleFavorite = async () => {
    if (!currentTrack) return;
    await toggleFavorite(currentTrack.id);
  };

  const totalDuration = duration || currentTrack.duration || 100;
  const progressRatio = Math.min(1, Math.max(0, currentTime / (totalDuration || 1)));

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!waveformRef.current) return;
    const rect = waveformRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickRatio = Math.min(1, Math.max(0, clickX / rect.width));
    seek(clickRatio * totalDuration);
  };

  return (
    <footer className="h-18 md:h-28 bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800 px-4 md:px-6 flex items-center justify-between md:grid md:grid-cols-[1fr_2.5fr_1fr] md:gap-6 fixed bottom-13 md:bottom-0 left-0 right-0 z-50 shadow-2xl">
      {/* Мобильная полоса прогресса сверху мини-плеера */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-[2.5px] bg-zinc-800">
        <div
          className="h-full bg-emerald-400 transition-all duration-150"
          style={{ width: `${progressRatio * 100}%` }}
        />
      </div>

      {/* Информация о текущем треке с обложкой и кнопкой Избранного */}
      <div className="flex items-center gap-3 min-w-0 flex-1 md:flex-initial">
        {currentTrack.cover_url ? (
          <img
            src={currentTrack.cover_url}
            alt={currentTrack.title}
            className="w-11 h-11 md:w-14 md:h-14 rounded-xl object-cover shrink-0 border border-zinc-700/60 shadow-lg shadow-black/40"
          />
        ) : (
          <div className="w-11 h-11 md:w-14 md:h-14 bg-zinc-800/80 rounded-xl flex items-center justify-center shrink-0 border border-zinc-700/50 shadow-inner">
            <Music className="w-5 h-5 md:w-6 md:h-6 text-zinc-400" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-xs md:text-sm font-semibold text-zinc-100 truncate tracking-tight">
            {currentTrack.title}
          </div>
          <div className="text-[11px] md:text-xs text-zinc-400 truncate mt-0.5">
            {currentTrack.artist || 'Неизвестный исполнитель'}
          </div>
          {currentTrack.album && (
            <div className="hidden md:block text-[10px] text-zinc-500 truncate mt-0.5 font-medium">
              {currentTrack.album}
            </div>
          )}
        </div>

        {/* Кнопка "В избранное" */}
        <button
          onClick={handleToggleFavorite}
          className={`p-1.5 md:p-2 rounded-xl transition-transform active:scale-90 cursor-pointer ${
            isFav ? 'text-rose-500' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          title={isFav ? 'Удалить из избранного' : 'Добавить в избранное'}
        >
          <Heart className={`w-4 h-4 md:w-5 md:h-5 ${isFav ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Мобильные кнопки управления прямо в мини-плеере */}
      <div className="md:hidden flex items-center gap-2 shrink-0">
        <button
          onClick={togglePlay}
          disabled={isLoadingStream}
          className="w-9 h-9 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center active:scale-95 cursor-pointer disabled:opacity-50"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>
        <button
          onClick={playNext}
          className="p-1.5 text-zinc-400 hover:text-zinc-100 active:scale-95 cursor-pointer"
        >
          <SkipForward className="w-4 h-4 fill-current" />
        </button>
      </div>

      {/* Органы управления воспроизведением и интерактивная звуковая волна (Desktop) */}
      <div className="hidden md:flex flex-col items-center gap-2 max-w-2xl w-full mx-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={playPrev}
            className="text-zinc-400 hover:text-zinc-100 transition-transform active:scale-95 cursor-pointer"
            title="Предыдущий трек"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            disabled={isLoadingStream}
            className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            title={isPlaying ? 'Пауза' : 'Воспроизведение'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={playNext}
            className="text-zinc-400 hover:text-zinc-100 transition-transform active:scale-95 cursor-pointer"
            title="Следующий трек"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
        </div>

        {/* Интерактивный Waveform с таймлайном */}
        <div className="w-full flex items-center gap-3">
          <span className="text-xs font-mono text-zinc-400 min-w-[42px] text-right">
            {formatTime(currentTime)}
          </span>

          <div
            ref={waveformRef}
            onClick={handleWaveformClick}
            className="flex-1 h-10 flex items-center gap-[2px] cursor-pointer group px-2 py-1 rounded-xl bg-zinc-950/40 hover:bg-zinc-800/50 border border-zinc-800/40 transition-colors"
            title="Кликните на звуковую волну для перемотки"
          >
            {currentTrack.waveform && currentTrack.waveform.length > 0 ? (
              currentTrack.waveform.map((peak, idx) => {
                const barRatio = idx / currentTrack.waveform!.length;
                const isPlayed = barRatio <= progressRatio;
                const heightPx = Math.max(4, Math.round(peak * 32));

                return (
                  <div
                    key={idx}
                    className={`flex-1 rounded-full transition-colors ${
                      isPlayed
                        ? 'bg-emerald-400 group-hover:bg-emerald-300 shadow-[0_0_6px_rgba(52,211,153,0.6)]'
                        : 'bg-zinc-700/90 group-hover:bg-zinc-600'
                    }`}
                    style={{ height: `${heightPx}px` }}
                  />
                );
              })
            ) : (
              <input
                type="range"
                min={0}
                max={totalDuration}
                value={currentTime}
                onChange={(e) => seek(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            )}
          </div>

          <span className="text-xs font-mono text-zinc-400 min-w-[42px]">
            {formatTime(totalDuration)}
          </span>
        </div>
      </div>

      {/* Регулировка громкости (Desktop) */}
      <div className="hidden md:flex items-center justify-end gap-3 text-zinc-400">
        <button
          onClick={() => setVolume(volume === 0 ? 1 : 0)}
          className="hover:text-zinc-100 transition-colors cursor-pointer"
        >
          {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-24 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
      </div>
    </footer>
  );
};