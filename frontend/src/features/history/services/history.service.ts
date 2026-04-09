import api from '@/lib/api';

export const HistoryService = {
    getMyHistory: async (params?: { page?: number; limit?: number; taskType?: string }) => {
        const response = await api.get('/scoring/my-history', { params });
        // Trả về cả dữ liệu và metadata
        return response.data;
    },
    getAttemptDetail: async (id: string) => {
        const response = await api.get(`/scoring/attempt/${id}`);
        // Trả về chi tiết bài làm
        return response.data.data;
    },
    deleteAttempt: async (id: string) => {
        const response = await api.delete(`/scoring/attempt/${id}`);
        return response.data;
    }
};
