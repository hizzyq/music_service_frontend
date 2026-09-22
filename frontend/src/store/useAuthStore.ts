import { create } from 'zustand';

interface JwtPayload {
    user_id: number;
    role?: string;
    exp: number;
}

interface AuthState {
    token: string | null;
    userId: number | null;
    role: string | null;
    isAdmin: boolean;
    setToken: (token: string) => void;
    logout: () => void;
}

// Извлечение данных из JWT без сторонних библиотек
function parseJwt(token: string): JwtPayload | null {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}

const initialToken = localStorage.getItem('token');
const initialPayload = initialToken ? parseJwt(initialToken) : null;

export const useAuthStore = create<AuthState>((set) => ({
    token: initialToken,
    userId: initialPayload?.user_id ?? null,
    role: initialPayload?.role ?? null,
    isAdmin: initialPayload?.role === 'admin',

    setToken: (token: string) => {
        localStorage.setItem('token', token);
        const payload = parseJwt(token);
        set({
            token,
            userId: payload?.user_id ?? null,
            role: payload?.role ?? null,
            isAdmin: payload?.role === 'admin',
        });
    },

    logout: () => {
        localStorage.removeItem('token');
        set({
            token: null,
            userId: null,
            role: null,
            isAdmin: false,
        });
    },
}));