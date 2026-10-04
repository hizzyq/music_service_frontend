import { useState } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { usePlayerStore } from './store/usePlayerStore';
import { AuthPage } from './components/AuthPage';
import { Sidebar, type ActiveView } from './components/Sidebar';
import { TrackList } from './components/TrackList';
import { PlaylistsView } from './components/PlaylistsView';
import { HistoryView } from './components/HistoryView';
import { PlayerBar } from './components/PlayerBar';
import { UploadModal } from './components/UploadModal';

export default function App() {
    const token = useAuthStore((state) => state.token);
    const currentTrack = usePlayerStore((state) => state.currentTrack);
    const [currentView, setCurrentView] = useState<ActiveView>('tracks');
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    if (!token) {
        return <AuthPage />;
    }

    return (
        <div className="h-screen w-screen bg-zinc-950 flex flex-col overflow-hidden text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
            {/* Основная рабочая область: pb-28 активируется ТОЛЬКО при наличии активного трека */}
            <div className={`flex-1 flex overflow-hidden transition-all duration-300 ${currentTrack ? 'pb-28' : 'pb-0'}`}>
                <Sidebar
                    currentView={currentView}
                    onSelectView={setCurrentView}
                    onOpenUpload={() => setIsUploadOpen(true)}
                />
                <main className="flex-1 flex flex-col bg-zinc-950/70 border-l border-zinc-900 overflow-hidden">
                    {currentView === 'tracks' && <TrackList />}
                    {currentView === 'playlists' && <PlaylistsView />}
                    {currentView === 'history' && <HistoryView />}
                </main>
            </div>

            {/* Нижняя панель плеера монтируется и плавно выезжает ТОЛЬКО после первого запуска трека */}
            {currentTrack && <PlayerBar />}

            {/* Модальное окно загрузки для администратора */}
            <UploadModal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
            />
        </div>
    );
}