import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Music2, Radio, ListMusic, History, LogOut, ShieldAlert, UploadCloud } from 'lucide-react';

export type ActiveView = 'tracks' | 'playlists' | 'history';

interface SidebarProps {
  currentView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  onOpenUpload: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onSelectView, onOpenUpload }) => {
  const { logout, isAdmin } = useAuthStore();

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-6">
        {/* Логотип */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <Music2 className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-zinc-100 tracking-tight">SoundService</span>
        </div>

        {/* Навигация */}
        <nav className="space-y-1.5">
          <button
            onClick={() => onSelectView('tracks')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer ${
              currentView === 'tracks'
                ? 'bg-zinc-800/80 text-emerald-400 font-semibold shadow-inner'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Главная / Треки</span>
          </button>

          <button
            onClick={() => onSelectView('playlists')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer ${
              currentView === 'playlists'
                ? 'bg-zinc-800/80 text-emerald-400 font-semibold shadow-inner'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
            }`}
          >
            <ListMusic className="w-4 h-4" />
            <span>Мои плейлисты</span>
          </button>

          <button
            onClick={() => onSelectView('history')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer ${
              currentView === 'history'
                ? 'bg-zinc-800/80 text-emerald-400 font-semibold shadow-inner'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
            }`}
          >
            <History className="w-4 h-4" />
            <span>История</span>
          </button>

          {/* Кнопка загрузки только для администратора */}
          {isAdmin && (
            <button
              onClick={onOpenUpload}
              className="w-full mt-4 flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 font-medium text-sm transition-colors cursor-pointer border border-dashed border-zinc-700/60"
            >
              <UploadCloud className="w-4 h-4 text-emerald-400" />
              <span>Загрузить трек</span>
            </button>
          )}
        </nav>

        {/* Индикатор роли администратора */}
        {isAdmin && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Режим администратора</span>
          </div>
        )}
      </div>

      {/* Кнопка выхода */}
      <button
        onClick={logout}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 text-sm font-medium transition-colors cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>Выйти</span>
      </button>
    </aside>
  );
};