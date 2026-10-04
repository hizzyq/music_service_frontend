import { useState } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { AuthPage } from './components/AuthPage';
import { Sidebar, type ActiveView } from './components/Sidebar';
import { TrackList } from './components/TrackList';
import { PlaylistsView } from './components/PlaylistsView';
import { HistoryView } from './components/HistoryView';
import { PlayerBar } from './components/PlayerBar';
import { UploadModal } from './components/UploadModal';

export default function App() {
    const token = useAuthStore((state) => state.token);
    const [currentView, setCurrentView] = useState<ActiveView>('tracks');
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    if (!token) {
        return <AuthPage />;
    }

    return (
        <div className="h-screen w-screen bg-zinc-950 flex flex-col overflow-hidden text-zinc-100">
            <div className="flex-1 flex overflow-hidden pb-28">
                <Sidebar
                    currentView={currentView}
                    onSelectView={setCurrentView}
                    onOpenUpload={() => setIsUploadOpen(true)}
                />
                <main className="flex-1 flex flex-col bg-zinc-900/40 overflow-hidden">
                    {currentView === 'tracks' && <TrackList />}
                    {currentView === 'playlists' && <PlaylistsView />}
                    {currentView === 'history' && <HistoryView />}
                </main>
            </div>
            <PlayerBar />

            {/* Модальное окно загрузки для администратора */}
            <UploadModal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
            />
        </div>
    );
}