import React, { useEffect } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { Play, Pause, Disc3, Clock } from 'lucide-react';
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

    useEffect(() => {
        fetchTracks();
    }, [fetchTracks]);

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
        <div className="flex-1 overflow-y-auto px-8 py-6">
            <h2 className="text-2xl font-bold text-zinc-100 mb-6">Каталог треков</h2>

            <div className="w-full">
                {/* Шапка таблицы */}
                <div className="grid grid-cols-[48px_1fr_1fr_80px] gap-4 px-4 py-2 border-b border-zinc-800 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    <span className="text-center">#</span>
                    <span>Название</span>
                    <span>Альбом</span>
                    <span className="flex justify-end pr-2">
            <Clock className="w-4 h-4" />
          </span>
                </div>

                {/* Список записей */}
                <div className="divide-y divide-zinc-900/60 mt-1">
                    {tracks.map((track, idx) => {
                        const isCurrent = currentTrack?.id === track.id;
                        const isThisPlaying = isCurrent && isPlaying;

                        return (
                            <div
                                key={track.id}
                                onClick={() => playTrack(track)}
                                className={`grid grid-cols-[48px_1fr_1fr_80px] gap-4 px-4 py-3 items-center rounded-xl transition-colors cursor-pointer group ${
                                    isCurrent
                                        ? 'bg-zinc-800/80 text-emerald-400'
                                        : 'hover:bg-zinc-900/60 text-zinc-300 hover:text-zinc-100'
                                }`}
                            >
                                <div className="flex items-center justify-center text-sm font-medium">
                  <span className="group-hover:hidden">
                    {isThisPlaying ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    ) : (
                        track.track_number || idx + 1
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

                                <div className="truncate pr-4">
                                    <div className={`font-medium truncate ${isCurrent ? 'text-emerald-400' : 'text-zinc-100'}`}>
                                        {track.title}
                                    </div>
                                    <div className="text-xs text-zinc-400 truncate mt-0.5">
                                        {track.artist || 'Неизвестный исполнитель'}
                                    </div>
                                </div>

                                <div className="text-sm text-zinc-400 truncate">
                                    {track.album || 'Сингл'}
                                </div>

                                <div className="text-sm text-zinc-500 font-mono text-right pr-2">
                                    {formatTime(track.duration)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};