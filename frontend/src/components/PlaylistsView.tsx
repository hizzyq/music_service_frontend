import React, { useState, useEffect } from 'react';
import { playlistsApi, type PlaylistDetail } from '../api/playlists';
import { usePlaylistsStore } from '../store/usePlaylistsStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { ListMusic, Plus, Trash2, ArrowLeft, Play, Disc3, Heart } from 'lucide-react';
import { formatTime } from '../utils/formatTime';

export const PlaylistsView: React.FC = () => {
  const { playlists, isLoading, fetchPlaylists, createPlaylist, deletePlaylist } = usePlaylistsStore();
  const { favoriteIds, loadFavorites } = useFavoritesStore();
  const [selectedPlaylist, setSelectedPlaylist] = useState<PlaylistDetail | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const { playTrack, currentTrack, isPlaying } = usePlayerStore();

  useEffect(() => {
    fetchPlaylists();
    loadFavorites();
  }, [fetchPlaylists, loadFavorites]);

  const openPlaylist = async (id: number) => {
    try {
      const detail = await playlistsApi.getById(id);
      setSelectedPlaylist(detail);
    } catch (err) {
      console.error('Ошибка загрузки плейлиста:', err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    try {
      await createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setIsCreating(false);
    } catch (err) {
      console.error('Ошибка создания плейлиста:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить плейлист?')) return;
    try {
      await deletePlaylist(id);
      if (selectedPlaylist?.id === id) {
        setSelectedPlaylist(null);
      }
    } catch (err) {
      console.error('Ошибка удаления плейлиста:', err);
    }
  };

  const handleRemoveTrack = async (trackId: number) => {
    if (!selectedPlaylist) return;
    try {
      await playlistsApi.removeTrack(selectedPlaylist.id, trackId);
      openPlaylist(selectedPlaylist.id);
    } catch (err) {
      console.error('Ошибка удаления трека из плейлиста:', err);
    }
  };

  if (selectedPlaylist) {
    return (
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <button
          onClick={() => setSelectedPlaylist(null)}
          className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-zinc-100 mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад к плейлистам</span>
        </button>

        <div className="flex items-end gap-6 mb-8">
          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-emerald-600 to-zinc-800 flex items-center justify-center shadow-2xl border border-zinc-700/50">
            <ListMusic className="w-14 h-14 text-white/80" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">Плейлист</span>
            <h1 className="text-3xl font-extrabold text-zinc-100 mt-1">{selectedPlaylist.name}</h1>
            <p className="text-xs text-zinc-400 mt-2">{selectedPlaylist.tracks.length} треков</p>
          </div>
        </div>

        {selectedPlaylist.tracks.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm border border-dashed border-zinc-800 rounded-2xl">
            В этом плейлисте пока нет треков.
          </div>
        ) : (
          <div className="divide-y divide-zinc-900/60">
            {selectedPlaylist.tracks.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;
              const isThisPlaying = isCurrent && isPlaying;

              return (
                <div
                  key={track.id}
                  className={`grid grid-cols-[48px_1fr_1fr_80px_48px] gap-4 px-4 py-3 items-center rounded-xl transition-colors cursor-pointer group ${
                    isCurrent ? 'bg-zinc-800/80 text-emerald-400' : 'hover:bg-zinc-900/60 text-zinc-300 hover:text-zinc-100'
                  }`}
                >
                  <div
                    onClick={() => playTrack(track)}
                    className="flex items-center justify-center text-sm font-medium"
                  >
                    <span className="group-hover:hidden">{idx + 1}</span>
                    <button className="hidden group-hover:flex items-center justify-center text-zinc-100 hover:scale-110 transition-transform">
                      {isThisPlaying ? <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </button>
                  </div>

                  <div onClick={() => playTrack(track)} className="flex items-center gap-3 truncate pr-4">
                    {track.cover_url ? (
                      <img src={track.cover_url} alt={track.title} className="w-10 h-10 rounded-lg object-cover shrink-0 border border-zinc-700/50" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-500">
                        <Disc3 className="w-5 h-5" />
                      </div>
                    )}
                    <div className="truncate">
                      <div className={`font-medium truncate ${isCurrent ? 'text-emerald-400' : 'text-zinc-100'}`}>
                        {track.title}
                      </div>
                      <div className="text-xs text-zinc-400 truncate mt-0.5">{track.artist || 'Неизвестный исполнитель'}</div>
                    </div>
                  </div>

                  <div onClick={() => playTrack(track)} className="text-sm text-zinc-400 truncate">
                    {track.album || 'Сингл'}
                  </div>

                  <div onClick={() => playTrack(track)} className="text-sm text-zinc-500 font-mono text-right pr-2">
                    {formatTime(track.duration)}
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTrack(track.id);
                      }}
                      className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                      title="Удалить из плейлиста"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800/80">
        <div>
          <div className="font-mono text-xs text-emerald-400 mb-1 flex items-center gap-1.5">
            <span className="text-zinc-500">$</span>
            <span>ls -la ~/playlists/</span>
          </div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight font-mono">Мои плейлисты</h2>
          <p className="text-xs text-zinc-400 mt-0.5">Коллекции и персональные подборки треков</p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-mono font-semibold rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>$ mkdir --playlist</span>
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="mb-6 p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex gap-3 items-center">
          <input
            type="text"
            placeholder="Название плейлиста..."
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            className="flex-1 bg-zinc-950 border border-zinc-700/60 rounded-xl px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
            autoFocus
          />
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-semibold rounded-xl transition-colors cursor-pointer font-mono"
          >
            Сохранить
          </button>
          <button
            type="button"
            onClick={() => setIsCreating(false)}
            className="px-4 py-2 text-zinc-400 hover:text-zinc-100 text-xs font-medium rounded-xl transition-colors cursor-pointer font-mono"
          >
            Отмена
          </button>
        </form>
      )}

      {isLoading ? (
        <div className="text-zinc-500 text-center py-12 font-mono text-xs">Загрузка плейлистов...</div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-16 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl font-mono text-xs">
          <ListMusic className="w-12 h-12 mx-auto stroke-[1.5] text-zinc-600 mb-3" />
          <p>Каталог плейлистов пуст. Создайте первый плейлист командой выше.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((pl) => {
            const isFavorites = pl.name.toLowerCase() === 'избранное';
            const count = isFavorites ? favoriteIds.size : pl.tracks_count;

            return (
              <div
                key={pl.id}
                onClick={() => openPlaylist(pl.id)}
                className={`p-5 rounded-2xl transition-all cursor-pointer group flex flex-col justify-between border ${
                  isFavorites
                    ? 'bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/30 hover:border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.08)]'
                    : 'bg-zinc-900/60 hover:bg-zinc-800/60 border-zinc-800 hover:border-zinc-700/80'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform ${
                      isFavorites
                        ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                        : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {isFavorites ? <Heart className="w-6 h-6 fill-current" /> : <ListMusic className="w-6 h-6" />}
                  </div>

                  {!isFavorites && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(pl.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 p-1.5 transition-opacity cursor-pointer"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div>
                  <h3
                    className={`font-semibold transition-colors truncate font-mono text-sm ${
                      isFavorites ? 'text-rose-300 group-hover:text-rose-200' : 'text-zinc-100 group-hover:text-emerald-400'
                    }`}
                  >
                    {pl.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-zinc-500 font-mono">
                      {count} {count === 1 ? 'трек' : 'треков'}
                    </span>
                    {isFavorites && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/15 border border-rose-500/30 text-rose-400 font-mono">
                        live
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
