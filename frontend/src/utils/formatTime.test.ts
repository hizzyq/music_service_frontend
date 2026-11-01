import { describe, it, expect } from 'vitest';
import { formatTime } from './formatTime';

describe('formatTime', () => {
  it('formats zero seconds as 0:00', () => {
    expect(formatTime(0)).toBe('0:00');
  });

  it('formats under a minute with leading zero for seconds', () => {
    expect(formatTime(5)).toBe('0:05');
    expect(formatTime(45)).toBe('0:45');
  });

  it('formats multiple minutes correctly', () => {
    expect(formatTime(65)).toBe('1:05');
    expect(formatTime(213)).toBe('3:33');
    expect(formatTime(600)).toBe('10:00');
  });

  it('handles negative or invalid seconds gracefully', () => {
    expect(formatTime(-10)).toBe('0:00');
    expect(formatTime(NaN)).toBe('0:00');
  });
});
