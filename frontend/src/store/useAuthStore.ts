import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

interface User {
    id: string;
    email: string;
    googleId: string;
    name?: string;
}

interface AuthState {
    accessToken: string | null;
    user: User | null;
    isAuthenticated: boolean;

    setAuth: (accessToken: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    accessToken: null,
    user: null,
    isAuthenticated: false,

    setAuth: (accessToken: string) => {
        try {
            const decoded: any = jwtDecode(accessToken);
            const user: User = {
                id: decoded.sub,
                email: decoded.email,
                googleId: decoded.googleId,
                name: decoded.name
            };
            set({ accessToken, user, isAuthenticated: true });
        } catch (e) {
            console.error("Failed to decode token", e);
            set({ accessToken: null, user: null, isAuthenticated: false });
        }
    },

    logout: () => {
        set({ accessToken: null, user: null, isAuthenticated: false });
    }
}));
