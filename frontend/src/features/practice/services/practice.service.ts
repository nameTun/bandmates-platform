import api from '@/lib/api';
import { TaskType } from '@/common/enums/task-type.enum';

export interface Category {
    id: string;
    name: string;
    taskType: TaskType;
    description?: string;
    isActive: boolean;
}

export interface Topic {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
}

export interface Prompt {
    id: string;
    content: string;
    taskType: TaskType;
    category: Category;
    topic?: Topic;
    imageUrl?: string;
    isActive: boolean;
    isFreeSample: boolean;
    createdAt: string;
}

export interface Correction {
    original: string;
    corrected: string;
    explanation: string;
    type?: 'grammar' | 'vocabulary' | 'cohesion' | 'task';
}

export interface AIResponse {
    scoreTA: number;
    scoreCC: number;
    scoreLR: number;
    scoreGRA: number;
    overallScore: number;
    feedback: {
        general: string;
        ta: string;
        cc: string;
        lr: string;
        gra: string;
    };
    corrections: Correction[];
    betterVersion: string;
}

export const practiceService = {
    /**
     * Gửi bài viết để AI chấm điểm chuẩn IELTS
     */
    checkIelts: async (text: string, promptId?: string, timeSpent?: number): Promise<AIResponse> => {
        const response = await api.post('/scoring/check', { 
            text, 
            promptId, 
            timeSpent 
        });
        return response.data.data || response.data;
    },

    /**
     * Lấy danh sách toàn bộ đề thi (Prompts)
     */
    getPrompts: async (): Promise<Prompt[]> => {
        const response = await api.get('/prompts');
        return response.data;
    },

    /**
     * Lấy danh sách các dạng bài (Categories)
     */
    getCategories: async (): Promise<Category[]> => {
        const response = await api.get('/categories');
        return response.data;
    },

    /**
     * Lấy danh sách các chủ đề (Topics)
     */
    getTopics: async (): Promise<Topic[]> => {
        const response = await api.get('/topics');
        return response.data;
    },

    /**
     * Lấy chi tiết một đề bài
     */
    getPromptById: async (id: string): Promise<Prompt> => {
        const response = await api.get(`/prompts/${id}`);
        return response.data;
    }
};