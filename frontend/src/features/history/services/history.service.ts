import api from '@/lib/api';
import type { SearchResult } from '../../vocabulary/services/vocabulary.service';

export interface Essay {
    id: string;
    task: string;
    topic: string;
    band: number;
    date: string;
    wordCount: number;
    prompt: string;
    scores: { tr: number; cc: number; lr: number; gra: number };
}

export interface VocabHistoryItem {
    id: string;
    word: string;
    phonetic: string;
    isSaved: boolean;
    searchedAt: string;
    dictionaryData?: SearchResult;
}

export interface AttemptDetail {
    id: string;
    originalText: string;
    aiResponse: any;
    timeSpent: number;
    wordCount: number;
    prompt: any;
    createdAt: string;
}

export const historyService = {
    /**
     * Lấy danh sách bài viết đã chấm của tôi
     */
    getMyHistory: async (params?: { page?: number; limit?: number; taskType?: string }) => {
        const response = await api.get('/scoring/my-history', { params });
        return response.data;
    },

    /**
     * Lấy chi tiết một bài làm cũ
     */
    getAttemptDetail: async (id: string): Promise<AttemptDetail> => {
        const response = await api.get(`/scoring/attempt/${id}`);
        // Backend đang bọc trong field .data
        return response.data.data || response.data;
    },

    /**
     * Xóa một bài làm
     */
    deleteAttempt: async (id: string) => {
        const response = await api.delete(`/scoring/attempt/${id}`);
        return response.data;
    }
};
