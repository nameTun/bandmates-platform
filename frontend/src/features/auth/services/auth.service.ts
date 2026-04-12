import api from '@/lib/api';

export interface User {
    id: string;
    email: string;
    googleId?: string;
    facebookId?: string;
    name?: string;
    role: string;
}

export interface AuthResponse {
    accessToken: string;
    user: User;
}

export interface LoginCredentials {
    email?: string;
    password?: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password?: string;
}

export const authService = {
    /**
     * Đăng nhập hệ thống
     */
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    },

    /**
     * Đăng ký tài khoản mới
     */
    register: async (data: RegisterData): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/register', data);
        return response.data;
    },

    /**
     * Đăng xuất
     */
    logout: async () => {
        const response = await api.post('/auth/logout');
        return response.data;
    },

    /**
     * Làm mới Token (Silent Refresh)
     */
    refresh: async (): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/refresh');
        return response.data;
    }
};
