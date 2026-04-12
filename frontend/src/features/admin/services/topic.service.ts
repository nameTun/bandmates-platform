import api from '@/lib/api';
import { TaskType } from '@/common/enums/task-type.enum';

export type Topic = {
  id: string;
  name: string;
  taskType: TaskType;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export type CreateTopicDto = {
  name: string;
  taskType: TaskType;
  description?: string;
}

export const topicService = {
  /**
   * Lấy danh sách tất cả các chủ đề xã hội (Topics - Task 2)
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
   * Vô hiệu hóa một chủ đề
   */
  deactivateTopic: async (id: string): Promise<Topic> => {
    const response = await api.patch(`/topics/${id}/deactivate`);
    return response.data;
  }
};
