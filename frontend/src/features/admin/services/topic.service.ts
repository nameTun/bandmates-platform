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
    // Lưu ý: Hiện tại Backend chưa có endpoint Patch :id cho Topic, 
    // Nếu chưa có ta sẽ dùng tạm create/update logic hoặc bổ sung sau.
    // Tạm thời để định nghĩa cho UI sẵn sàng.
    const response = await api.post('/topics', { ...data, id }); // Mocking logic if needed or assuming standard REST
    return response.data;
  },

  /**
   * Xoá hoàn toàn một chủ đề (Hard Delete)
   */
  deleteTopic: async (id: string): Promise<void> => {
    await api.delete(`/topics/${id}`);
  },

  /**
   * Vô hiệu hóa một chủ đề (Legacy)
   */
  deactivateTopic: async (id: string): Promise<void> => {
    await api.patch(`/topics/${id}/deactivate`);
  },

  /**
   * Import Chủ đề từ Excel
   */
  importTopics: async (file: File) => {
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
  downloadExport: async () => {
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
