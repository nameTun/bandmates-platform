import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Prompt } from '../prompts/entities/prompt.entity';
import { ExamAttempt } from '../scoring/entities/exam-attempt.entity';
import { TaskType } from '../../common/enums/task-type.enum';
import { AiUsage } from '../ai/entities/ai-usage.entity';
import { AI_LIMITS } from '../../config/ai-models.config';
import { UserDashboardStatsDto } from './dto/user-dashboard-stats.dto';

@Injectable()
export class AnalyticsService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Prompt)
        private promptsRepository: Repository<Prompt>,
        @InjectRepository(ExamAttempt)
        private attemptsRepository: Repository<ExamAttempt>,
        @InjectRepository(AiUsage)
        private aiUsageRepository: Repository<AiUsage>,
    ) { }

    async getGlobalStatistics() {
        // 1. Thống kê Người dùng
        const totalUsers = await this.usersRepository.count();

        // 2. Thống kê Đề thi theo 3 loại
        const totalPrompts = await this.promptsRepository.count();
        const task1AcademicCount = await this.promptsRepository.count({
            where: { taskType: TaskType.TASK_1_ACADEMIC }
        });
        const task1GeneralCount = await this.promptsRepository.count({
            where: { taskType: TaskType.TASK_1_GENERAL }
        });
        const task2Count = await this.promptsRepository.count({
            where: { taskType: TaskType.TASK_2 }
        });

        // 3. Thống kê Lượt làm bài (Chỉ tính bài từ User/Admin đã đăng nhập, loại bỏ Guest)
        const totalAttempts = await this.attemptsRepository
            .createQueryBuilder('attempt')
            .innerJoin('attempt.user', 'user')
            .leftJoin('attempt.prompt', 'prompt')
            .where('attempt.status = :status', { status: 'success' })
            .andWhere('user.role IN (:...roles)', { roles: [UserRole.USER, UserRole.ADMIN] })
            .getCount();

        const task1AcademicAttempts = await this.attemptsRepository
            .createQueryBuilder('attempt')
            .innerJoin('attempt.user', 'user')
            .innerJoin('attempt.prompt', 'prompt')
            .where('attempt.status = :status', { status: 'success' })
            .andWhere('user.role IN (:...roles)', { roles: [UserRole.USER, UserRole.ADMIN] })
            .andWhere('prompt.taskType = :type', { type: TaskType.TASK_1_ACADEMIC })
            .getCount();

        const task1GeneralAttempts = await this.attemptsRepository
            .createQueryBuilder('attempt')
            .innerJoin('attempt.user', 'user')
            .innerJoin('attempt.prompt', 'prompt')
            .where('attempt.status = :status', { status: 'success' })
            .andWhere('user.role IN (:...roles)', { roles: [UserRole.USER, UserRole.ADMIN] })
            .andWhere('prompt.taskType = :type', { type: TaskType.TASK_1_GENERAL })
            .getCount();

        const task2Attempts = await this.attemptsRepository
            .createQueryBuilder('attempt')
            .innerJoin('attempt.user', 'user')
            .innerJoin('attempt.prompt', 'prompt')
            .where('attempt.status = :status', { status: 'success' })
            .andWhere('user.role IN (:...roles)', { roles: [UserRole.USER, UserRole.ADMIN] })
            .andWhere('prompt.taskType = :type', { type: TaskType.TASK_2 })
            .getCount();

        // 4. Lấy 5 bài làm gần đây nhất (Recent Activity)
        const recentAttempts = await this.attemptsRepository.find({
            where: {
                status: 'success',
                user: { role: UserRole.USER }
            },
            relations: ['user', 'prompt', 'prompt.topic', 'user.profile'],
            order: { createdAt: 'DESC' },
            take: 5,
        });


        // 5. Thống kê Top 5 Chủ đề (Topic) được làm nhiều nhất
        // QueryBuilder để group by topic name
        const topTopics = await this.attemptsRepository
            .createQueryBuilder('attempt')
            .leftJoin('attempt.prompt', 'prompt')
            .leftJoin('prompt.topic', 'topic')
            .select('topic.name', 'name')
            .addSelect('COUNT(attempt.id)', 'count')
            .where('attempt.status = :status', { status: 'success' })
            .andWhere('topic.id IS NOT NULL')
            .groupBy('topic.id')
            .orderBy('count', 'DESC')
            .limit(5)
            .getRawMany();

        // 6. Thống kê Hạn mức AI (AI Quota)
        const aiUsageRaw = await this.aiUsageRepository.find();
        
        // Logic tính toán thời gian thực tế để "Reset ảo" trên Dashboard
        const now = new Date();
        const currentMinuteId = Math.floor(now.getTime() / 60000);
        const today = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).split(' ')[0];

        // Kết hợp dữ liệu thực tế với Định mức (Limits) từ file config
        const aiUsageStats = aiUsageRaw.map(usage => {
            const limits = AI_LIMITS[usage.modelName] || { rpm: 0, rpd: 0 };
            
            // Xử lý Virtual Reset cho hiển thị: Nếu đã qua phút mới/ngày mới thì hiển thị là 0
            const displayRPM = usage.lastMinuteId === currentMinuteId ? usage.currentRPM : 0;
            const displayRPD = usage.resetDayAt === today ? usage.currentRPD : 0;

            return {
                modelName: usage.modelName,
                rpm: {
                    current: displayRPM,
                    limit: limits.rpm,
                    percent: limits.rpm > 0 ? Math.round((displayRPM / limits.rpm) * 100) : 0,
                },
                rpd: {
                    current: displayRPD,
                    limit: limits.rpd,
                    percent: limits.rpd > 0 ? Math.round((displayRPD / limits.rpd) * 100) : 0,
                },
                lastRequestAt: usage.lastRequestAt,
            };
        });

        return {
            users: {
                total: totalUsers,
            },
            prompts: {
                total: totalPrompts,
                task1Academic: task1AcademicCount,
                task1General: task1GeneralCount,
                task2: task2Count,
            },
            attempts: {
                total: totalAttempts,
                task1Academic: task1AcademicAttempts,
                task1General: task1GeneralAttempts,
                task2: task2Attempts,
                recent: recentAttempts.map(a => ({
                    id: a.id,
                    user: a.user?.profile?.displayName || a.user?.email || 'Guest',
                    email: a.user?.email || '—',
                    task: a.prompt?.taskType || 'Tùy chỉnh',
                    topic: a.prompt?.topic?.name || '—',
                    band: Number(a.overallScore) || 0,
                    createdAt: a.createdAt,
                })),
            },
            topTopics: topTopics.map(t => ({
                name: t.name,
                count: parseInt(t.count),
            })),
            aiUsage: aiUsageStats,
        };
    }

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

        // 4. Biểu đồ thay đổi
        // Lấy tối đa 15 bài đã chấm thành công, lấy từ mới nhất sau đó đảo ngược để biểu diễn xu hướng dòng thời gian
        const recentSuccessAttempts = await this.attemptsRepository.find({
            where: {
                user: { id: userId },
                status: 'success',
            },
            order: { createdAt: 'DESC' },
            take: 15,
        });

        const chartData = recentSuccessAttempts.reverse().map(attempt => ({
            date: new Date(attempt.createdAt).toISOString().split('T')[0],
            score: Number(attempt.overallScore) || 0,
        }));

        // 5. Hoạt động gần đây nhất (5 bài)
        const recentActivities = await this.attemptsRepository.find({
            where: { user: { id: userId } },
            relations: ['prompt', 'prompt.topic'],
            order: { createdAt: 'DESC' },
            take: 5,
        });

        const recentAttempts = recentActivities.map(attempt => ({
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
