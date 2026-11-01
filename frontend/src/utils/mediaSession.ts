import type { Track } from '../api/tracks';

export function setupMediaSession(
  track: Track | null,
  handlers: {
    onPlay: () => void;
    onPause: () => void;
    onNext: () => void;
    onPrev: () => void;
    onSeek?: (time: number) => void;
  }
) {
  if (typeof window === 'undefined' || !('mediaSession' in navigator) || !track) {
    return;
  }

  // Настройка метаданных для экрана блокировки и шторки уведомлений мобильного устройства
  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.title,
    artist: track.artist || 'Неизвестный исполнитель',
    album: track.album || 'Сингл',
    artwork: track.cover_url
      ? [
          { src: track.cover_url, sizes: '96x96', type: 'image/jpeg' },
          { src: track.cover_url, sizes: '128x128', type: 'image/jpeg' },
          { src: track.cover_url, sizes: '192x192', type: 'image/jpeg' },
          { src: track.cover_url, sizes: '512x512', type: 'image/jpeg' },
        ]
      : [],
  });

  // Регистрация нативных обработчиков управления
  try {
    navigator.mediaSession.setActionHandler('play', handlers.onPlay);
    navigator.mediaSession.setActionHandler('pause', handlers.onPause);
    navigator.mediaSession.setActionHandler('previoustrack', handlers.onPrev);
    navigator.mediaSession.setActionHandler('nexttrack', handlers.onNext);
    if (handlers.onSeek) {
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          handlers.onSeek!(details.seekTime);
        }
      });
    }
  } catch (err) {
    console.debug('MediaSession action handler error:', err);
  }
}
