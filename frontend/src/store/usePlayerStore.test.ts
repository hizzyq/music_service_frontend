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
});
