import { create } from 'zustand';
import { type Track, tracksApi } from '../api/tracks';

interface PlayerState {
    tracks: Track[];
    isTracksLoading: boolean;
    currentTrack: Track | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    queue: Track[];
    isLoadingStream: boolean;

    fetchTracks: () => Promise<void>;
    setQueue: (tracks: Track[]) => void;
    playTrack: (track: Track) => Promise<void>;
    togglePlay: () => void;
    seek: (time: number) => void;
    setVolume: (volume: number) => void;
    playNext: () => void;
    playPrev: () => void;
}

const audio = new Audio();

export const usePlayerStore = create<PlayerState>((set, get) => {
    audio.ontimeupdate = () => {
        set({ currentTime: audio.currentTime });
    };

    audio.onloadedmetadata = () => {
        set({ duration: audio.duration });
    };

    audio.onended = () => {
        get().playNext();
    };

    return {
        tracks: [],
        isTracksLoading: false,
        currentTrack: null,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 1,
        queue: [],
        isLoadingStream: false,

        fetchTracks: async () => {
            set({ isTracksLoading: true });
            try {
                const data = await tracksApi.getAll();
                set({ tracks: data, queue: data, isTracksLoading: false });
            } catch (err) {
                console.error('Ошибка загрузки треков:', err);
                set({ isTracksLoading: false });
            }
        },

        setQueue: (tracks) => set({ queue: tracks }),

        playTrack: async (track) => {
            const { currentTrack, isPlaying } = get();

            if (currentTrack?.id === track.id) {
                if (isPlaying) {
                    audio.pause();
                    set({ isPlaying: false });
                } else {
                    await audio.play();
                    set({ isPlaying: true });
                }
                return;
            }

            set({ currentTrack: track, isLoadingStream: true });

            try {
                const streamUrl = await tracksApi.getStreamUrl(track.id); //
                audio.src = streamUrl; //
                await audio.play();
                set({ isPlaying: true, isLoadingStream: false });
            } catch (err) {
                console.error('Ошибка воспроизведения потока:', err);
                set({ isPlaying: false, isLoadingStream: false });
            }
        },

        togglePlay: () => {
            const { isPlaying, currentTrack } = get();
            if (!currentTrack) return;

            if (isPlaying) {
                audio.pause();
                set({ isPlaying: false });
            } else {
                audio.play();
                set({ isPlaying: true });
            }
        },

        seek: (time) => {
            audio.currentTime = time;
            set({ currentTime: time });
        },

        setVolume: (volume) => {
            audio.volume = volume;
            set({ volume });
        },

        playNext: () => {
            const { queue, currentTrack, playTrack } = get();
            if (!currentTrack || queue.length === 0) return;

            const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
            const nextIndex = (currentIndex + 1) % queue.length;
            playTrack(queue[nextIndex]);
        },

        playPrev: () => {
            const { queue, currentTrack, playTrack } = get();
            if (!currentTrack || queue.length === 0) return;

            const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
            const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
            playTrack(queue[prevIndex]);
        },
    };
});