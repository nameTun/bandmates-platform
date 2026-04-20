import api from '@/lib/api';

export interface DashboardStats {
  profile: {
    targetBand: number | null;
    initialBand: number | null;
  };
  statistics: {
    totalEssays: number;
    averageScore: number;
  };
  chartData: {
    date: string;
    score: number;
  }[];
  recentAttempts: {
    id: string;
    title: string;
    score: number;
    date: string;
  }[];
}

export const dashboardService = {
  /**
   * Lấy dữ liệu thống kê tổng quát cho User Dashboard
   */
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/user/dashboard');
    return response.data;
  },
};
