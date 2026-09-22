import React from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music } from 'lucide-react';
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

  if (!currentTrack) return null;

  return (
    <footer className="h-24 bg-zinc-900 border-t border-zinc-800 px-6 grid grid-cols-[1fr_2fr_1fr] items-center gap-4 fixed bottom-0 left-0 right-0 z-50">
      
      {/* Информация о текущем треке */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0 border border-zinc-700/50">
          <Music className="w-6 h-6 text-zinc-400" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-zinc-100 truncate">
            {currentTrack.title}
          </div>
          <div className="text-xs text-zinc-400 truncate">
            {currentTrack.artist || 'Неизвестный исполнитель'}
          </div>
        </div>
      </div>

      {/* Органы управления воспроизведением */}
      <div className="flex flex-col items-center gap-2 max-w-xl w-full mx-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={playPrev}
            className="text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            disabled={isLoadingStream}
            className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={playNext}
            className="text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
        </div>

        {/* Скраббер таймлайна */}
        <div className="w-full flex items-center gap-3 text-xs font-mono text-zinc-400">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || currentTrack.duration || 100}
            value={currentTime}
            onChange={(e) => seek(Number(e.target.value))}
            className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <span>{formatTime(duration || currentTrack.duration)}</span>
        </div>
      </div>

      {/* Регулировка громкости */}
      <div className="flex items-center justify-end gap-3 text-zinc-400">
        <button
          onClick={() => setVolume(volume === 0 ? 1 : 0)}
          className="hover:text-zinc-100 cursor-pointer"
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
          className="w-24 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
      </div>
    </footer>
  );
};