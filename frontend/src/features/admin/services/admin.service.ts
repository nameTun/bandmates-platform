import api from '@/lib/api';

export interface AdminStatistics {
  users: {
    total: number;
  };
  prompts: {
    total: number;
    task1Academic: number;
    task1General: number;
    task2: number;
  };
  attempts: {
    total: number;
    task1Academic: number;
    task1General: number;
    task2: number;
    recent: {
      id: string;
      user: string;
      email: string;
      task: string;
      topic: string;
      band: number;
      createdAt: string;
    }[];
  };
  topTopics: {
    name: string;
    count: number;
  }[];
  aiUsage: {
    modelName: string;
    rpm: {
      current: number;
      limit: number;
      percent: number;
    };
    rpd: {
      current: number;
      limit: number;
      percent: number;
    };
    lastRequestAt: string;
  }[];
}

export const adminService = {
  /**
   * Lấy dữ liệu thống kê tổng quát cho Dashboard
   */
  getStatistics: async (): Promise<AdminStatistics> => {
    const response = await api.get('/admin/statistics');
    return response.data;
  },
};
