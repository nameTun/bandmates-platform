import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Prompt } from '../prompts/entities/prompt.entity';
import { ExamAttempt } from '../scoring/entities/exam-attempt.entity';
import { TaskType } from '../../common/enums/task-type.enum';

@Injectable()
export class AnalyticsService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Prompt)
        private promptsRepository: Repository<Prompt>,
        @InjectRepository(ExamAttempt)
        private attemptsRepository: Repository<ExamAttempt>,
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

        // 3. Thống kê Lượt làm bài (chỉ tính bài thành công)
        const totalAttempts = await this.attemptsRepository.count({
            where: { status: 'success' }
        });

        // 4. Lấy 5 bài làm gần đây nhất (Recent Activity)
        const recentAttempts = await this.attemptsRepository.find({
            relations: ['user', 'prompt', 'prompt.topic'],
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
        };
    }
}
