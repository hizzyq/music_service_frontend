import { create } from 'zustand';
import { type Track, tracksApi } from '../api/tracks';
import { useHistoryStore } from './useHistoryStore';
import { setupMediaSession } from '../utils/mediaSession';

export type SleepTimerOption = '15' | '30' | '45' | '60' | 'end_of_track' | null;

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

    // Таймер сна
    sleepTimerOption: SleepTimerOption;
    sleepTimerRemaining: number | null; // секунд осталось
    isSleepTimerActive: boolean;

    fetchTracks: () => Promise<void>;
    setQueue: (tracks: Track[]) => void;
    playTrack: (track: Track) => Promise<void>;
    togglePlay: () => void;
    seek: (time: number) => void;
    setVolume: (volume: number) => void;
    playNext: () => void;
    playPrev: () => void;

    // Управление таймером сна
    setSleepTimer: (option: SleepTimerOption) => void;
    cancelSleepTimer: () => void;
}

const savedVol = typeof window !== 'undefined' ? localStorage.getItem('music_player_volume') : null;
const initialVolume = savedVol !== null ? Math.min(1, Math.max(0, parseFloat(savedVol))) : 0.6;

const audio = new Audio();
audio.volume = initialVolume;

let sleepTimerInterval: ReturnType<typeof setInterval> | null = null;
const FADE_DURATION_SECONDS = 30; // Длительность плавного затухания звука (30 сек)
const FADE_TRACK_END_SECONDS = 15; // Длительность затухания перед концом трека

export const usePlayerStore = create<PlayerState>((set, get) => {
    audio.ontimeupdate = () => {
        const { sleepTimerOption, volume } = get();
        set({ currentTime: audio.currentTime });

        // Плавный Fade-out громкости для режима 'end_of_track'
        if (sleepTimerOption === 'end_of_track' && audio.duration > 0) {
            const remaining = audio.duration - audio.currentTime;
            if (remaining <= FADE_TRACK_END_SECONDS && remaining >= 0) {
                const factor = Math.max(0, remaining / FADE_TRACK_END_SECONDS);
                audio.volume = volume * factor;
            } else if (remaining > FADE_TRACK_END_SECONDS && audio.volume !== volume) {
                audio.volume = volume;
            }
        }
    };

    audio.onloadedmetadata = () => {
        set({ duration: audio.duration });
    };

    audio.onended = () => {
        const { sleepTimerOption, cancelSleepTimer, playNext, volume } = get();
        if (sleepTimerOption === 'end_of_track') {
            audio.pause();
            audio.volume = volume;
            set({ isPlaying: false });
            cancelSleepTimer();
        } else {
            playNext();
        }
    };

    return {
        tracks: [],
        isTracksLoading: false,
        currentTrack: null,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: initialVolume,
        queue: [],
        isLoadingStream: false,

        sleepTimerOption: null,
        sleepTimerRemaining: null,
        isSleepTimerActive: false,

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
                const streamUrl = await tracksApi.getStreamUrl(track.id);
                audio.src = streamUrl;
                await audio.play();
                set({ isPlaying: true, isLoadingStream: false });
                useHistoryStore.getState().recordListen(track);

                setupMediaSession(track, {
                    onPlay: () => get().togglePlay(),
                    onPause: () => get().togglePlay(),
                    onNext: () => get().playNext(),
                    onPrev: () => get().playPrev(),
                    onSeek: (time) => get().seek(time),
                });
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
            if (typeof window !== 'undefined') {
                localStorage.setItem('music_player_volume', volume.toString());
            }
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

        setSleepTimer: (option) => {
            if (sleepTimerInterval) {
                clearInterval(sleepTimerInterval);
                sleepTimerInterval = null;
            }

            if (!option) {
                get().cancelSleepTimer();
                return;
            }

            audio.volume = get().volume;

            if (option === 'end_of_track') {
                set({
                    sleepTimerOption: 'end_of_track',
                    sleepTimerRemaining: null,
                    isSleepTimerActive: true,
                });
                return;
            }

            const minutes = parseInt(option, 10);
            const totalSeconds = minutes * 60;

            set({
                sleepTimerOption: option,
                sleepTimerRemaining: totalSeconds,
                isSleepTimerActive: true,
            });

            sleepTimerInterval = setInterval(() => {
                const { sleepTimerRemaining, volume, cancelSleepTimer } = get();
                if (sleepTimerRemaining === null || sleepTimerRemaining <= 1) {
                    audio.pause();
                    audio.volume = volume;
                    set({ isPlaying: false });
                    cancelSleepTimer();
                } else {
                    const nextRemaining = sleepTimerRemaining - 1;
                    if (nextRemaining <= FADE_DURATION_SECONDS) {
                        const factor = Math.max(0, nextRemaining / FADE_DURATION_SECONDS);
                        audio.volume = volume * factor;
                    } else if (audio.volume !== volume) {
                        audio.volume = volume;
                    }
                    set({ sleepTimerRemaining: nextRemaining });
                }
            }, 1000);
        },

        cancelSleepTimer: () => {
            if (sleepTimerInterval) {
                clearInterval(sleepTimerInterval);
                sleepTimerInterval = null;
            }
            audio.volume = get().volume;
            set({
                sleepTimerOption: null,
                sleepTimerRemaining: null,
                isSleepTimerActive: false,
            });
        },
    };
});