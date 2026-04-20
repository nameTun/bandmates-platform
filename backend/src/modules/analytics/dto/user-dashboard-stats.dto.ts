export class UserDashboardStatsDto {
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
