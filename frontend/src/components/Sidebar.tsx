import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { useHistoryStore } from '../store/useHistoryStore';
import { Terminal, Radio, ListMusic, History, LogOut, ShieldAlert, UploadCloud, Cpu, Sparkles } from 'lucide-react';

export type ActiveView = 'tracks' | 'recommendations' | 'playlists' | 'history';

interface SidebarProps {
  currentView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  onOpenUpload: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onSelectView, onOpenUpload }) => {
  const { logout, isAdmin } = useAuthStore();
  const favoriteCount = useFavoritesStore((state) => state.favoriteIds.size);
  const tracksCount = usePlayerStore((state) => state.tracks.length);
  const historyCount = useHistoryStore((state) => state.historyCount);

  return (
    <aside className="hidden md:flex w-64 bg-zinc-950/95 border-r border-zinc-800/80 flex-col justify-between p-4 shrink-0 font-sans">
      <div className="space-y-6">
        {/* Linux-терминал брендинг */}
        <div className="px-2 py-1.5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            <span className="text-[10px] text-zinc-500 font-mono ml-1">tty1</span>
          </div>

          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="font-mono text-xs font-bold text-emerald-400 tracking-tight flex items-center gap-1 truncate">
              <span className="text-zinc-500">$</span>
              <span>cd ~/music/</span>
              <span className="inline-block w-1.5 h-3 bg-emerald-400 animate-pulse shrink-0" />
            </div>
          </div>
        </div>

        {/* Системный инфо-блок в стиле Neofetch */}
        <div className="px-3 py-2.5 bg-zinc-900/40 border border-zinc-800/60 rounded-xl font-mono text-[11px] space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-zinc-500 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-zinc-500" />
              OS
            </span>
            <span className="text-zinc-300 font-medium">Linux/x86_64</span>
          </div>
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-zinc-500">USER</span>
            <span className={isAdmin ? 'text-amber-400 font-semibold' : 'text-emerald-400'}>
              {isAdmin ? 'root#admin' : 'user$listener'}
            </span>
          </div>
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-zinc-500">STORE</span>
            <span className="text-zinc-300 font-mono">MinIO [S3]</span>
          </div>
        </div>

        {/* Навигация */}
        <nav className="space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-600 px-3 py-1">
            FILESYSTEM
          </div>

          <button
            onClick={() => onSelectView('tracks')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
              currentView === 'tracks'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold shadow-[0_0_12px_rgba(16,185,129,0.1)]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3 truncate">
              <Radio className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">~/tracks/</span>
            </div>
            {tracksCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-800/80 border border-zinc-700/60 text-zinc-400 font-mono shrink-0">
                {tracksCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectView('recommendations')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
              currentView === 'recommendations'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold shadow-[0_0_12px_rgba(16,185,129,0.1)]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
            <span className="truncate">~/recommendations/</span>
          </button>

          <button
            onClick={() => onSelectView('playlists')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
              currentView === 'playlists'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold shadow-[0_0_12px_rgba(16,185,129,0.1)]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3 truncate">
              <ListMusic className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">~/playlists/</span>
            </div>
            {favoriteCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-400 font-mono flex items-center gap-1 shadow-sm shrink-0">
                ♥ {favoriteCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectView('history')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
              currentView === 'history'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold shadow-[0_0_12px_rgba(16,185,129,0.1)]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3 truncate">
              <History className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">~/history.log</span>
            </div>
            {historyCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-800/80 border border-zinc-700/60 text-zinc-400 font-mono shrink-0">
                {historyCount}
              </span>
            )}
          </button>

          {/* Кнопка загрузки для администратора */}
          {isAdmin && (
            <div className="pt-2">
              <button
                onClick={onOpenUpload}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-mono font-medium transition-all cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">$ upload --batch</span>
              </button>
            </div>
          )}
        </nav>

        {/* Индикатор роли администратора */}
        {isAdmin && (
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 font-mono text-[11px] flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>sudo mode: active</span>
          </div>
        )}
      </div>

      {/* Кнопка выхода */}
      <button
        onClick={logout}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs font-mono transition-colors cursor-pointer border border-transparent hover:border-rose-500/20"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>$ exit</span>
      </button>
    </aside>
  );
};