// src/store/useAuthStore.ts
import { create } from 'zustand';

interface AuthState {
    token: string | null;
    isAdmin: boolean;
    setToken: (token: string, isAdmin?: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: localStorage.getItem('token'),
    isAdmin: localStorage.getItem('role') === 'admin',
    setToken: (token, isAdmin = false) => {
        localStorage.setItem('token', token);
        localStorage.setItem('role', isAdmin ? 'admin' : 'listener');
        set({ token, isAdmin });
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        set({ token: null, isAdmin: false });
    },
}));