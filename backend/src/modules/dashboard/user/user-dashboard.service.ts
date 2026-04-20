import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PracticeAttempt } from '../../practice/entities/practice-attempt.entity';
import { UserDashboardStatsDto } from '../dto/user-dashboard-stats.dto';

@Injectable()
export class UserDashboardService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(PracticeAttempt)
    private attemptsRepository: Repository<PracticeAttempt>,
  ) {}

  async getUserDashboardStats(userId: string): Promise<UserDashboardStatsDto> {
    // 1. Lấy thông tin mục tiêu
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    const targetBand = user?.profile?.targetBand ? Number(user.profile.targetBand) : null;
    const initialBand = user?.profile?.currentBand ? Number(user.profile.currentBand) : null;

    // 2 & 3. Thống kê bài viết và điểm trung bình (chỉ lấy bài thành công)
    const stats = await this.attemptsRepository
      .createQueryBuilder('attempt')
      .select('COUNT(attempt.id)', 'totalAttempts')
      .addSelect('AVG(attempt.overallScore)', 'averageScore')
      .where('attempt.userId = :userId', { userId })
      .andWhere('attempt.status = :status', { status: 'success' })
      .getRawOne();

    const totalEssays = parseInt(stats?.totalAttempts || '0', 10);
    const averageScoreRaw = parseFloat(stats?.averageScore || '0');
    const averageScore = averageScoreRaw > 0 ? Math.round(averageScoreRaw * 10) / 10 : 0;

    // 4. Biểu đồ thay đổi (Progress Trend)
    const recentSuccessAttempts = await this.attemptsRepository.find({
      where: {
        user: { id: userId },
        status: 'success',
      },
      order: { createdAt: 'DESC' },
      take: 15,
    });

    const chartData = recentSuccessAttempts.reverse().map((attempt) => ({
      date: new Date(attempt.createdAt).toISOString().split('T')[0],
      score: Number(attempt.overallScore) || 0,
    }));

    // 5. Hoạt động gần đây nhất (Recent Activities)
    const recentActivities = await this.attemptsRepository.find({
      where: { user: { id: userId } },
      relations: ['prompt', 'prompt.topic'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    const recentAttempts = recentActivities.map((attempt) => ({
      id: attempt.id,
      title: attempt.prompt?.topic?.name || 'Tùy chỉnh',
      score: attempt.overallScore ? Number(attempt.overallScore) : 0,
      date: new Date(attempt.createdAt).toISOString().split('T')[0],
    }));

    return {
      profile: {
        targetBand,
        initialBand,
      },
      statistics: {
        totalEssays,
        averageScore,
      },
      chartData,
      recentAttempts,
    };
  }
}
