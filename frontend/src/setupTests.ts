import '@testing-library/jest-dom';

// Polyfills for browser environment in tests
if (typeof window !== 'undefined') {
  // Mock HTMLMediaElement play/pause
  window.HTMLMediaElement.prototype.play = () => Promise.resolve();
  window.HTMLMediaElement.prototype.pause = () => {};
}
