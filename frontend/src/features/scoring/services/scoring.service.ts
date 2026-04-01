import api from '@/lib/api';

export const ScoringService = {
    checkIelts: async (text: string) => {
        const response = await api.post('/scoring/check', { text });
        return response.data;
    }
};
