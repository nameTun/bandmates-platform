import api from '@/lib/api';

export const ScoringService = {
    checkIelts: async (text: string, promptId?: string, timeSpent?: number) => {
        const response = await api.post('/scoring/check', { 
            text, 
            promptId, 
            timeSpent 
        });
        return response.data;
    }
};