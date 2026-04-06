import api from '@/lib/api';
import { TaskType } from '@/common/enums/task-type.enum';
import type { Category } from './category-api';
import type { Topic } from './topic-api';

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
  createdAt: string;
}

export type CreatePromptDto = {
  taskType: TaskType;
  categoryId: string; // Truyền UUID thay vì Tên
  topicId?: string;   // Truyền UUID (Task 2)
  content: string;
  imageUrl?: string;
  modelAnswer?: string;
  hints?: string;
}

export const promptApi = {
  /**
   * Lấy danh sách tất cả các đề bài dành cho Admin (không phân trang hiện tại)
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
