import React, { useEffect, useState } from 'react';
import { recommendationsApi, type RecommendedTrack } from '../api/recommendations';
import { usePlayerStore } from '../store/usePlayerStore';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { Sparkles, Play, Pause, Disc3, Heart, Clock, RefreshCw } from 'lucide-react';
import { formatTime } from '../utils/formatTime';

export const RecommendationsView: React.FC = () => {
  const [recommendations, setRecommendations] = useState<RecommendedTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { playTrack, currentTrack, isPlaying } = usePlayerStore();
  const { favoriteIds, loadFavorites, toggleFavorite } = useFavoritesStore();

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      const data = await recommendationsApi.getAll(25);
      setRecommendations(data);
    } catch (err) {
      console.error('Ошибка загрузки рекомендаций:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
    loadFavorites();
  }, []);

  const handleToggleFavorite = async (e: React.MouseEvent, trackId: number) => {
    e.stopPropagation();
    await toggleFavorite(trackId);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
      {/* Шапка раздела в терминальном стиле */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-800/80">
        <div>
          <div className="font-mono text-xs text-emerald-400 mb-1 flex items-center gap-1.5">
            <span className="text-zinc-500">$</span>
            <span>discover --hybrid --for-you</span>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-zinc-100 tracking-tight font-mono flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Рекомендательная система
            </h2>
            {recommendations.length > 0 && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                {recommendations.length} {recommendations.length === 1 ? 'трек' : 'треков'}
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Анализ ваших предпочтений, любимых исполнителей, вкусов похожих слушателей и глобальных трендов
          </p>
        </div>

        <button
          onClick={loadRecommendations}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/60 text-xs font-mono text-zinc-300 hover:text-emerald-400 transition-all cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          <span>$ refresh</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-zinc-500 text-center py-16 font-mono text-xs flex flex-col items-center gap-3">
          <Sparkles className="w-8 h-8 text-emerald-500/60 animate-pulse" />
          <span>Анализ паттернов прослушивания и построение выборки...</span>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-center py-16 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl font-mono text-xs">
          <Disc3 className="w-12 h-12 mx-auto stroke-[1.5] text-zinc-600 mb-3" />
          <p>Пока нет треков для рекомендаций. Загрузите больше композиций в каталог.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {recommendations.map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id;
            const isThisPlaying = isCurrent && isPlaying;
            const isFavorite = favoriteIds.has(track.id);
            const reason = track.recommendation?.reason || 'Рекомендация для вас';
            const score = track.recommendation?.score ?? 0;

            return (
              <div
                key={track.id}
                onClick={() => playTrack(track)}
                className={`p-3 md:p-4 rounded-2xl transition-all cursor-pointer group border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCurrent
                    ? 'bg-zinc-800/90 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                    : 'bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-800/70 hover:border-zinc-700'
                }`}
              >
                {/* Левая часть: номер, обложка, название, артист, причина */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  {/* Номер / Play кнопка */}
                  <div className="hidden sm:flex items-center justify-center w-6 text-xs font-mono text-zinc-500 shrink-0">
                    <span className="group-hover:hidden">
                      {isThisPlaying ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      ) : (
                        String(idx + 1).padStart(2, '0')
                      )}
                    </span>
                    <button className="hidden group-hover:flex items-center justify-center text-zinc-100 hover:scale-110 transition-transform">
                      {isThisPlaying ? (
                        <Pause className="w-4 h-4 fill-current text-emerald-400" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5 text-emerald-400" />
                      )}
                    </button>
                  </div>

                  {/* Обложка */}
                  {track.cover_url ? (
                    <img
                      src={track.cover_url}
                      alt={track.title}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-zinc-700/50 shadow"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700/50 text-zinc-500">
                      <Disc3 className="w-6 h-6" />
                    </div>
                  )}

                  {/* Название и мета */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 truncate">
                      <span className={`font-semibold text-sm truncate ${isCurrent ? 'text-emerald-400' : 'text-zinc-100'}`}>
                        {track.title}
                      </span>
                      {track.format && (
                        <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400 shrink-0">
                          {track.format}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-400 truncate mt-0.5">
                      {track.artist || 'Неизвестный исполнитель'} • {track.album || 'Сингл'}
                    </div>

                    {/* Бейдж причины рекомендации */}
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        {reason}
                      </span>
                      {score > 0 && (
                        <span className="text-[10px] font-mono text-zinc-500">
                          affinity: {score}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Правая часть: волна, длительность, сердечко */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60">
                  <div className="text-xs text-zinc-400 font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    {formatTime(track.duration)}
                  </div>

                  <button
                    onClick={(e) => handleToggleFavorite(e, track.id)}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      isFavorite
                        ? 'text-rose-500 hover:text-rose-400 bg-rose-500/10'
                        : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'
                    }`}
                    title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
