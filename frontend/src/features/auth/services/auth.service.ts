import api from '@/lib/api';

export const AuthService = {
    login: async (credentials: any) => {
        const response = await api.post('/auth/login', credentials);
        return response.data; // expecting { accessToken, user }
    },
    register: async (data: any) => {
        const response = await api.post('/auth/register', data);
        return response.data; // expecting { accessToken, user }
    },
    logout: async () => {
        const response = await api.post('/auth/logout');
        return response.data;
    },
    refresh: async () => {
        const response = await api.post('/auth/refresh');
        return response.data; // expecting { accessToken, user }
    }
};
