export class AdminDashboardStatsDto {
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
      createdAt: Date;
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
    lastRequestAt: Date;
  }[];
}
