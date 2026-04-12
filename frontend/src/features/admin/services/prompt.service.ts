import api from '@/lib/api';
import { TaskType } from '@/common/enums/task-type.enum';
import type { Category } from './category.service';
import type { Topic } from './topic.service';

export type Prompt = {
  id: string;
  content: string;
  taskType: TaskType;
  category: Category;
  topic?: Topic;
  imageUrl?: string;
  modelAnswer?: string;
  hints?: string;
  isActive: boolean;
  isFreeSample: boolean;
  createdAt: string;
}

export type CreatePromptDto = {
  taskType: TaskType;
  categoryId: string;
  topicId?: string;
  content: string;
  imageUrl?: string;
  modelAnswer?: string;
  hints?: string;
  isFreeSample?: boolean;
}

export const promptService = {
  /**
   * Lấy danh sách tất cả các đề bài dành cho Admin
   */
  getPrompts: async (): Promise<Prompt[]> => {
    const response = await api.get('/prompts');
    return response.data;
  },

  /**
   * Lấy chi tiết một đề bài theo ID
   */
  getPromptById: async (id: string): Promise<Prompt> => {
    const response = await api.get(`/prompts/${id}`);
    return response.data;
  },

  /**
   * Tạo mới một đề bài thủ công (Admin)
   */
  createPrompt: async (data: CreatePromptDto): Promise<Prompt> => {
    const response = await api.post('/prompts', data);
    return response.data;
  }
};
