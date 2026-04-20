import api from '@/lib/api';
import { TaskType } from '@/common/enums/task-type.enum';

export type Topic = {
  id: string;
  name: string;
  taskType: TaskType;
  description?: string;
  isActive: boolean;
  promptsCount?: number;
  createdAt: string;
}

export type CreateTopicDto = {
  name: string;
  taskType: TaskType;
  description?: string;
}

export type UpdateTopicDto = Partial<CreateTopicDto>;

export type ImportResult = {
  total: number;
  created: number;
  updated: number;
  errors: string[];
}

export const topicService = {
  /**
   * Lấy danh sách tất cả các chủ đề (Topics)
   */
  getTopics: async (): Promise<Topic[]> => {
    const response = await api.get('/topics');
    return response.data;
  },

  /**
   * Tạo mới một chủ đề
   */
  createTopic: async (data: CreateTopicDto): Promise<Topic> => {
    const response = await api.post('/topics', data);
    return response.data;
  },

  /**
   * Cập nhật chủ đề
   */
  updateTopic: async (id: string, data: UpdateTopicDto): Promise<Topic> => {
    const response = await api.patch(`/topics/${id}`, data);
    return response.data;
  },

  /**
   * Xoá hoàn toàn một chủ đề (Hard Delete)
   */
  deleteTopic: async (id: string): Promise<void> => {
    const response = await api.delete(`/topics/${id}`);
    return response.data;
  },

  /**
   * Vô hiệu hóa một chủ đề (Legacy)
   */
  deactivateTopic: async (id: string): Promise<void> => {
    const response = await api.patch(`/topics/${id}/deactivate`);
    return response.data;
  },

  /**
   * Import Chủ đề từ Excel
   */
  importTopics: async (file: File): Promise<ImportResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/topics/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Tải file Export Excel
   */
  downloadExport: async (): Promise<void> => {
    const response = await api.get('/topics/export', {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'topics-export.xlsx');
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};
