import api from '@/lib/api';
import { TaskType } from '@/common/enums/task-type.enum';

export type Category = {
  id: string;
  name: string;
  taskType: TaskType;
  description?: string;
  isActive: boolean;
};

export type Topic = {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
};

export type Prompt = {
  id: string;
  content: string;
  taskType: TaskType;
  category: Category;
  topic?: Topic;
  imageUrl?: string;
  isActive: boolean;
  isFreeSample: boolean;
  createdAt: string;
};

export const practiceApi = {
  getPrompts: async (): Promise<Prompt[]> => {
    const response = await api.get('/prompts');
    return response.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
  },

  getTopics: async (): Promise<Topic[]> => {
    const response = await api.get('/topics');
    return response.data;
  },

  getPromptById: async (id: string): Promise<Prompt> => {
    const response = await api.get(`/prompts/${id}`);
    return response.data;
  }
};
