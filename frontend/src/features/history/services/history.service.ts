import api from '@/lib/api';
import type { SearchResult } from '../../vocabulary/services/vocabulary.service';

export interface Essay { // UI Model
    id: string;
    task: string;
    topic: string;
    band: number;
    date: string;
    wordCount: number;
    prompt: string;
    scores: { tr: number; cc: number; lr: number; gra: number };
}

export interface RawPracticeAttempt { // Backend Raw Data
    id: string;
    overallScore: number;
    scoreTA: number;
    scoreCC: number;
    scoreLR: number;
    scoreGRA: number;
    wordCount: number;
    timeSpent: number;
    status: string;
    createdAt: string;
    prompt?: {
        id: string;
        content: string;
        taskType: string;
        category?: { name: string };
        topic?: { name: string };
    };
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

export interface PaginatedResponse<T> {
    items: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const historyService = {
    /**
     * Lấy danh sách bài viết đã chấm của tôi
     */
    getMyHistory: async (params?: { page?: number; limit?: number; taskType?: string }): Promise<PaginatedResponse<RawPracticeAttempt>> => {
        const response = await api.get('/history/essays', { params });
        return response.data;
    },

    /**
     * Lấy chi tiết một bài làm cũ
     */
    getAttemptDetail: async (id: string): Promise<AttemptDetail> => {
        const response = await api.get(`/history/essays/${id}`);
        return response.data;
    },

    /**
     * Xóa một bài làm
     */
    deleteAttempt: async (id: string): Promise<{ message: string }> => {
        const response = await api.delete(`/history/essays/${id}`);
        return response.data;
    },

    /**
     * Lấy lịch sử tra từ vựng
     */
    getVocabularyHistory: async (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<VocabHistoryItem>> => {
        const response = await api.get('/history/vocabulary', { params });
        return response.data;
    },
};
