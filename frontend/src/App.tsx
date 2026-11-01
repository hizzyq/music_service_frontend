import { useState } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { usePlayerStore } from './store/usePlayerStore';
import { useFavoritesStore } from './store/useFavoritesStore';
import { useHistoryStore } from './store/useHistoryStore';
import { AuthPage } from './components/AuthPage';
import { Sidebar, type ActiveView } from './components/Sidebar';
import { TrackList } from './components/TrackList';
import { RecommendationsView } from './components/RecommendationsView';
import { PlaylistsView } from './components/PlaylistsView';
import { HistoryView } from './components/HistoryView';
import { PlayerBar } from './components/PlayerBar';
import { UploadModal } from './components/UploadModal';
import { Radio, Sparkles, ListMusic, History, UploadCloud, LogOut, Terminal } from 'lucide-react';

export default function App() {
    const { token, logout, isAdmin } = useAuthStore();
    const currentTrack = usePlayerStore((state) => state.currentTrack);
    const tracksCount = usePlayerStore((state) => state.tracks.length);
    const favoriteCount = useFavoritesStore((state) => state.favoriteIds.size);
    const historyCount = useHistoryStore((state) => state.historyCount);
    const [currentView, setCurrentView] = useState<ActiveView>('tracks');
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    if (!token) {
        return <AuthPage />;
    }

    return (
        <div className="h-screen w-screen bg-zinc-950 flex flex-col overflow-hidden text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
            {/* Мобильная верхняя плашка (терминал заголовок на телефонах) */}
            <header className="md:hidden flex items-center justify-between px-4 py-3 bg-zinc-950 border-b border-zinc-800/80 shrink-0">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span className="font-mono text-xs font-bold text-emerald-400 tracking-tight">
                        cd ~/music/
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 font-mono">
                        {isAdmin ? 'root' : 'user'}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {isAdmin && (
                        <button
                            onClick={() => setIsUploadOpen(true)}
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono"
                            title="Загрузка треков"
                        >
                            <UploadCloud className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={logout}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400"
                        title="Выход"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Основная рабочая область: паддинг снизу динамически резервирует место под плеер и мобильный таббар */}
            <div className={`flex-1 flex overflow-hidden transition-all duration-300 ${currentTrack ? 'pb-36 md:pb-28' : 'pb-16 md:pb-0'}`}>
                <Sidebar
                    currentView={currentView}
                    onSelectView={setCurrentView}
                    onOpenUpload={() => setIsUploadOpen(true)}
                />
                <main className="flex-1 flex flex-col bg-zinc-950/70 md:border-l border-zinc-900 overflow-hidden">
                    {currentView === 'tracks' && <TrackList />}
                    {currentView === 'recommendations' && <RecommendationsView />}
                    {currentView === 'playlists' && <PlaylistsView />}
                    {currentView === 'history' && <HistoryView />}
                </main>
            </div>

            {/* Мобильный нижний бар навигации (Bottom Navigation Tabs) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-800/80 px-2 py-1.5 flex items-center justify-around">
                <button
                    onClick={() => setCurrentView('tracks')}
                    className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-mono cursor-pointer transition-colors relative ${
                        currentView === 'tracks' ? 'text-emerald-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                >
                    <Radio className="w-4 h-4" />
                    <span>Треки</span>
                    {tracksCount > 0 && (
                        <span className="absolute -top-1 right-1 text-[9px] px-1 py-0.2 rounded-full bg-zinc-850 border border-zinc-700 text-zinc-300 font-mono">
                            {tracksCount}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => setCurrentView('recommendations')}
                    className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-mono cursor-pointer transition-colors ${
                        currentView === 'recommendations' ? 'text-emerald-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                >
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Для вас</span>
                </button>

                <button
                    onClick={() => setCurrentView('playlists')}
                    className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-mono cursor-pointer transition-colors relative ${
                        currentView === 'playlists' ? 'text-emerald-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                >
                    <ListMusic className="w-4 h-4" />
                    <span>Плейлисты</span>
                    {favoriteCount > 0 && (
                        <span className="absolute -top-1 right-1 text-[9px] px-1 py-0.2 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 font-mono">
                            ♥{favoriteCount}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => setCurrentView('history')}
                    className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-mono cursor-pointer transition-colors relative ${
                        currentView === 'history' ? 'text-emerald-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                >
                    <History className="w-4 h-4" />
                    <span>История</span>
                    {historyCount > 0 && (
                        <span className="absolute -top-1 right-1 text-[9px] px-1 py-0.2 rounded-full bg-zinc-850 border border-zinc-700 text-zinc-300 font-mono">
                            {historyCount}
                        </span>
                    )}
                </button>
            </nav>

            {/* Нижняя панель плеера */}
            {currentTrack && <PlayerBar />}

            {/* Модальное окно загрузки для администратора */}
            <UploadModal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
            />
        </div>
    );
}