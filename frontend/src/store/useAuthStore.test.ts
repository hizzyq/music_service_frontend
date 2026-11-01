import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './useAuthStore';

// Helper to make mock JWT
function createMockJwt(userId: number, role: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ user_id: userId, role, exp: 9999999999 }));
  const signature = 'fake_signature';
  return `${header}.${payload}.${signature}`;
}

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().logout();
  });

  it('initializes with null when localStorage is empty', () => {
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.userId).toBeNull();
    expect(state.role).toBeNull();
    expect(state.isAdmin).toBe(false);
  });

  it('sets token and parses admin credentials properly', () => {
    const token = createMockJwt(42, 'admin');
    useAuthStore.getState().setToken(token);

    const state = useAuthStore.getState();
    expect(state.token).toBe(token);
    expect(state.userId).toBe(42);
    expect(state.role).toBe('admin');
    expect(state.isAdmin).toBe(true);
    expect(localStorage.getItem('token')).toBe(token);
  });

  it('sets token and parses listener credentials without admin rights', () => {
    const token = createMockJwt(99, 'listener');
    useAuthStore.getState().setToken(token);

    const state = useAuthStore.getState();
    expect(state.userId).toBe(99);
    expect(state.role).toBe('listener');
    expect(state.isAdmin).toBe(false);
  });

  it('clears all state and removes token on logout', () => {
    const token = createMockJwt(1, 'admin');
    useAuthStore.getState().setToken(token);
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.userId).toBeNull();
    expect(state.isAdmin).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
  });
});
