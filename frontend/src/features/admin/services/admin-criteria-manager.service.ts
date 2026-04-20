import api from '@/lib/api';

export interface ScoringCriteria {
    id: string;
    taskType: string;
    criteriaKey: string;
    description: string;
    updatedAt: string;
}

export const scoringCriteriaService = {
    getAll: async (): Promise<ScoringCriteria[]> => {
        const response = await api.get('/scoring-criteria');
        return response.data;
    },

    update: async (id: string, description: string): Promise<ScoringCriteria> => {
        const response = await api.patch(`/scoring-criteria/${id}`, { description });
        return response.data;
    }
};
