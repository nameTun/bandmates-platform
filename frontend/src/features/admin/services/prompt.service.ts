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
  targetBand?: number;
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
  targetBand?: number;
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
  },

  /**
   * Cập nhật một đề bài (Admin)
   */
  updatePrompt: async (id: string, data: Partial<CreatePromptDto>): Promise<Prompt> => {
    const response = await api.patch(`/prompts/${id}`, data);
    return response.data;
  },

  /**
   * Xoá một đề bài (Admin)
   */
  deletePrompt: async (id: string): Promise<void> => {
    await api.delete(`/prompts/${id}`);
  },

  /**
   * Import dữ liệu từ file Excel cho từng loại Task
   */
  importPrompts: async (taskType: TaskType, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    let endpoint = '/prompts/import/';
    if (taskType === TaskType.TASK_2) endpoint += 'task2';
    else if (taskType === TaskType.TASK_1_ACADEMIC) endpoint += 'task1-academic';
    else if (taskType === TaskType.TASK_1_GENERAL) endpoint += 'task1-general';

    const response = await api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Tải file Export Excel (Có xác thực)
   */
  downloadExport: async (taskType?: TaskType) => {
    let endpoint = '/prompts/export/all';
    let filename = 'prompts-all.xlsx';

    if (taskType) {
      if (taskType === TaskType.TASK_2) {
        endpoint = '/prompts/export/task2';
        filename = 'prompts-task2.xlsx';
      } else if (taskType === TaskType.TASK_1_ACADEMIC) {
        endpoint = '/prompts/export/task1-academic';
        filename = 'prompts-task1-academic.xlsx';
      } else if (taskType === TaskType.TASK_1_GENERAL) {
        endpoint = '/prompts/export/task1-general';
        filename = 'prompts-task1-general.xlsx';
      }
    }

    const response = await api.get(endpoint, {
      responseType: 'blob',
    });

    // Tạo link download ảo
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    
    // Dọn dẹp
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};
