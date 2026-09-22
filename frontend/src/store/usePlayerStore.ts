// src/store/usePlayerStore.ts
import { create } from 'zustand';
import { api } from '../api/client';

export interface Track {
    id: number;
    title: string;
    artist: string;
    album: string;
    duration: number;
}

interface PlayerState {
    currentTrack: Track | null;
    isPlaying: boolean;
    progress: number;
    audio: HTMLAudioElement;
    playTrack: (track: Track) => Promise<void>;
    togglePlay: () => void;
    seek: (seconds: number) => void;
}

const audio = new Audio();

export const usePlayerStore = create<PlayerState>((set, get) => {
    audio.ontimeupdate = () => {
        set({ progress: audio.currentTime });
    };

    return {
        currentTrack: null,
        isPlaying: false,
        progress: 0,
        audio,
        playTrack: async (track) => {
            // 1. Получаем Presigned URL из Rails API
            const res = await api.get<{ stream_url: string }>(`/tracks/${track.id}/stream`); //[cite: 1]

            // 2. Направляем аудиопоток напрямую в MinIO
            audio.src = res.data.stream_url; //[cite: 1]
            await audio.play();
            set({ currentTrack: track, isPlaying: true });
        },
        togglePlay: () => {
            const { isPlaying } = get();
            if (isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
            set({ isPlaying: !isPlaying });
        },
        seek: (seconds) => {
            audio.currentTime = seconds;
            set({ progress: seconds });
        },
    };
});