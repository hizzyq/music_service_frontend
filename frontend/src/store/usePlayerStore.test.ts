import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePlayerStore } from './usePlayerStore';
import type { Track } from '../api/tracks';

const mockTrack1: Track = {
  id: 1,
  title: 'First Track',
  duration: 180,
  artist: 'Artist One',
  album: 'Album One',
  track_number: 1,
};

const mockTrack2: Track = {
  id: 2,
  title: 'Second Track',
  duration: 200,
  artist: 'Artist Two',
  album: 'Album Two',
  track_number: 2,
};

describe('usePlayerStore', () => {
  beforeEach(() => {
    localStorage.clear();
    usePlayerStore.setState({
      tracks: [mockTrack1, mockTrack2],
      queue: [mockTrack1, mockTrack2],
      currentTrack: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 0.6,
    });
  });

  it('initializes with default safe volume 0.6 (60%)', () => {
    expect(usePlayerStore.getState().volume).toBe(0.6);
  });

  it('updates volume and syncs to localStorage', () => {
    usePlayerStore.getState().setVolume(0.85);
    expect(usePlayerStore.getState().volume).toBe(0.85);
    expect(localStorage.getItem('music_player_volume')).toBe('0.85');
  });

  it('seeks currentTime properly', () => {
    usePlayerStore.getState().seek(45);
    expect(usePlayerStore.getState().currentTime).toBe(45);
  });

  it('cycles queue through playNext and playPrev', () => {
    usePlayerStore.setState({ currentTrack: mockTrack1 });

    const playSpy = vi.spyOn(usePlayerStore.getState(), 'playTrack').mockImplementation(async (t) => {
      usePlayerStore.setState({ currentTrack: t });
    });

    usePlayerStore.getState().playNext();
    expect(playSpy).toHaveBeenCalledWith(mockTrack2);

    usePlayerStore.setState({ currentTrack: mockTrack2 });
    usePlayerStore.getState().playPrev();
    expect(playSpy).toHaveBeenCalledWith(mockTrack1);
  });

  describe('Sleep Timer (Таймер сна)', () => {
    it('initializes with inactive sleep timer', () => {
      expect(usePlayerStore.getState().isSleepTimerActive).toBe(false);
      expect(usePlayerStore.getState().sleepTimerOption).toBeNull();
      expect(usePlayerStore.getState().sleepTimerRemaining).toBeNull();
    });

    it('activates timed sleep timer with countdown in seconds', () => {
      usePlayerStore.getState().setSleepTimer('15');
      expect(usePlayerStore.getState().isSleepTimerActive).toBe(true);
      expect(usePlayerStore.getState().sleepTimerOption).toBe('15');
      expect(usePlayerStore.getState().sleepTimerRemaining).toBe(15 * 60);

      usePlayerStore.getState().cancelSleepTimer();
    });

    it('activates end_of_track sleep timer mode', () => {
      usePlayerStore.getState().setSleepTimer('end_of_track');
      expect(usePlayerStore.getState().isSleepTimerActive).toBe(true);
      expect(usePlayerStore.getState().sleepTimerOption).toBe('end_of_track');
      expect(usePlayerStore.getState().sleepTimerRemaining).toBeNull();

      usePlayerStore.getState().cancelSleepTimer();
    });

    it('cancels active sleep timer and resets state', () => {
      usePlayerStore.getState().setSleepTimer('30');
      expect(usePlayerStore.getState().isSleepTimerActive).toBe(true);

      usePlayerStore.getState().cancelSleepTimer();
      expect(usePlayerStore.getState().isSleepTimerActive).toBe(false);
      expect(usePlayerStore.getState().sleepTimerOption).toBeNull();
      expect(usePlayerStore.getState().sleepTimerRemaining).toBeNull();
    });

    it('ticks down and stops playback when timer expires', () => {
      vi.useFakeTimers();
      usePlayerStore.setState({ isPlaying: true, volume: 0.8 });
      usePlayerStore.getState().setSleepTimer('15');

      // Fast-forward 15 minutes (900 seconds)
      vi.advanceTimersByTime(900 * 1000);

      expect(usePlayerStore.getState().isPlaying).toBe(false);
      expect(usePlayerStore.getState().isSleepTimerActive).toBe(false);
      expect(usePlayerStore.getState().volume).toBe(0.8);
      vi.useRealTimers();
    });
  });
});
