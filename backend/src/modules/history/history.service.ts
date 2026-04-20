import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PracticeAttempt } from '../practice/entities/practice-attempt.entity';
import { VocabularyHistory } from '../vocabulary/entities/vocabulary-history.entity';

@Injectable()
export class HistoryService {
    constructor(
        @InjectRepository(PracticeAttempt)
        private attemptsRepository: Repository<PracticeAttempt>,
        @InjectRepository(VocabularyHistory)
        private vocabularyRepository: Repository<VocabularyHistory>,
    ) {}

    /**
     * Lấy danh sách bài luận đã chấm của người dùng (tối ưu hóa, không lấy full AI response)
     */
    async getEssayHistory(userId: string, page: number, limit: number, taskType?: string) {
        const skip = (page - 1) * limit;

        const [items, total] = await this.attemptsRepository.findAndCount({
            where: {
                user: { id: userId },
                ...(taskType ? { prompt: { taskType: taskType as any } } : {}),
            },
            relations: ['prompt', 'prompt.category', 'prompt.topic'],
            order: { createdAt: 'DESC' },
            take: limit,
            skip: skip,
            // Không lấy aiResponse để response nhanh hơn khi hiển thị danh sách
            select: [
                'id', 'wordCount', 'timeSpent', 'overallScore',
                'scoreTA', 'scoreCC', 'scoreLR', 'scoreGRA',
                'status', 'createdAt',
            ],
        });

        return {
            items,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Lấy chi tiết đầy đủ của một bài làm (bao gồm AI feedback)
     */
    async getEssayDetail(id: string, userId: string) {
        const attempt = await this.attemptsRepository.findOne({
            where: { id },
            relations: ['user', 'prompt', 'prompt.category', 'prompt.topic'],
        });

        if (!attempt) {
            throw new NotFoundException('Không tìm thấy bài làm');
        }

        if (!attempt.user || attempt.user.id !== userId) {
            throw new ForbiddenException('Bạn không có quyền xem bài làm này');
        }

        delete (attempt as any).user;
        return attempt;
    }

    /**
     * Xóa một bài làm
     */
    async deleteEssay(id: string, userId: string) {
        const attempt = await this.attemptsRepository.findOne({
            where: { id },
            relations: ['user'],
        });

        if (!attempt) {
            throw new NotFoundException('Không tìm thấy bài làm để xóa');
        }

        if (!attempt.user || attempt.user.id !== userId) {
            throw new ForbiddenException('Bạn không có quyền xóa bài làm này');
        }

        await this.attemptsRepository.remove(attempt);
        return { message: 'Đã xóa bài làm thành công' };
    }

    /**
     * Lấy lịch sử tra cứu từ vựng của người dùng
     */
    async getVocabularyHistory(userId: string, page: number, limit: number) {
        const skip = (page - 1) * limit;

        const [items, total] = await this.vocabularyRepository.findAndCount({
            where: { user: { id: userId } },
            order: { searchedAt: 'DESC' },
            take: limit,
            skip: skip,
            select: ['id', 'word', 'phonetic', 'isSaved', 'searchedAt'],
        });

        return {
            items,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
