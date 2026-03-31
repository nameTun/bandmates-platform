import { create } from 'zustand';

interface User {
    id: string;
    email: string;
    googleId?: string;
    facebookId?: string;
    name?: string;
    role: string
}

interface AuthState {
    accessToken: string | null;
    user: User | null;
    isAuthenticated: boolean;

    setAuth: (accessToken: string, user: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    accessToken: null,
    user: null,
    isAuthenticated: false,

    setAuth: (accessToken: string, user: User) => {
        set({ accessToken, user, isAuthenticated: true });
    },

    logout: () => {
        set({ accessToken: null, user: null, isAuthenticated: false });
    }
}));
