import { Controller, Post, Body, UseGuards, HttpStatus, HttpException, Get, Param, ForbiddenException, NotFoundException, Query, Delete, Ip } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScoringService } from './scoring.service';
import { UserProfilesService } from '../user-profiles/user-profiles.service';
import { CheckTextDto } from './dto/check-text.dto';
import { ExamAttempt } from './entities/exam-attempt.entity';
import { Prompt } from '../prompts/entities/prompt.entity';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { VisitorId } from '../../common/decorators/visitor-id.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { UsageLimitAiService, UsageAction } from '../usage-limit-ai/usage-limit-ai.service';
import { TaskType } from '../../common/enums/task-type.enum';

@Controller('scoring')
export class ScoringController {
    constructor(
        private scoringService: ScoringService,
        private userProfilesService: UserProfilesService,
        @InjectRepository(ExamAttempt)
        private examRepository: Repository<ExamAttempt>,
        @InjectRepository(Prompt)
        private promptRepository: Repository<Prompt>,
        private usageLimitService: UsageLimitAiService,
    ) { }

    @Post('check')
    @UseGuards(OptionalJwtAuthGuard)
    async checkEnglish(
        @Body() dto: CheckTextDto,
        @GetUser() user: User | null,
        @VisitorId() visitorId: string,
        @Ip() ip: string,
    ) {
        // Kiểm tra hạn mức sử dụng trong file config backend/env
        const usage = await this.usageLimitService.checkAndRecordUsage(
            user?.id,
            visitorId,
            ip,
            UsageAction.PRACTICE_ESSAY,
            user?.role
        );

        // Tự động đếm số từ (Word Count)
        const wordCount = dto.text.trim().split(/\s+/).length;
        const timeSpent = dto.timeSpent || 0;

        // Lấy nội dung đề bài (nếu có)
        let promptContent = '';
        let promptEntity = null;
        if (dto.promptId) {
            // tìm prompt theo id, trong prompt có taskType (dùng taskType để tìm criteria)
            promptEntity = await this.promptRepository.findOne({ where: { id: dto.promptId } });
            if (promptEntity) {
                promptContent = promptEntity.content;
            }
        }

        // Lấy thông tin Profile để cá nhân hóa AI (nếu user đã đăng nhập)
        let userProfile = null;
        if (user && user.id) {
            try {
                userProfile = await this.userProfilesService.getProfile(user.id);
            } catch (e) {
                console.warn('Không lấy được profile để cá nhân hóa AI, chuyển về mặc định.');
            }
        }

        // Gọi AI để chấm điểm (Master Prompt)
        let aiResult;
        try {
            const taskType = promptEntity?.taskType || TaskType.TASK_2;
            aiResult = await this.scoringService.checkEnglish(dto.text, promptContent, userProfile, taskType);
        } catch (error) {
            throw new HttpException(
                'Hệ thống chấm điểm AI đang bận hoặc gặp sự cố. Vui lòng thử lại sau vài phút.',
                HttpStatus.SERVICE_UNAVAILABLE
            );
        }

        // Lưu lịch sử vào database cùng với các điểm thành phần
        const attempt = this.examRepository.create({
            originalText: dto.text,
            wordCount: wordCount,
            timeSpent: timeSpent,
            aiResponse: aiResult,
            prompt: promptEntity,

            // Mapping điểm
            overallScore: aiResult?.overallScore || null,
            scoreTA: aiResult?.scoreTA || null,
            scoreCC: aiResult?.scoreCC || null,
            scoreLR: aiResult?.scoreLR || null,
            scoreGRA: aiResult?.scoreGRA || null,
        });

        // Lấy User từ Payload JWT
        // (Vẫn giữ logic linh hoạt để check cả .id và .userId cho an tâm tuyệt đối)
        const realUserId = user?.id || (user as any)?.userId;


        if (realUserId) {
            // Cách an toàn nhất để gán Relation trong TypeORM khi chỉ có ID
            attempt.user = { id: realUserId } as any;
        } else if (visitorId) {
            attempt.visitorId = visitorId;
        }

        try {
            await this.examRepository.save(attempt);
        } catch (dbError) {
            console.error("Database Save Error:", dbError);
            throw new HttpException('Lỗi lưu kết quả vào Database', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // Trả về kết quả cho Frontend kèm thông tin hạn mức
        return {
            success: true,
            data: aiResult,
            attemptId: attempt.id,
            usage: usage // Chứa thông tin limit, used, remaining
        };
    }

    @Get('my-history')
    @UseGuards(JwtAuthGuard)
    async getMyHistory(
        @GetUser() user: User,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('taskType') taskType?: string,
    ) {
        const userId = (user as any).userId || user.id;
        if (!userId) {
            throw new ForbiddenException('User ID not found');
        }

        const skip = (page - 1) * limit;

        const [data, total] = await this.examRepository.findAndCount({
            where: {
                user: { id: userId },
                ...(taskType ? { prompt: { taskType: taskType as any } } : {})
            },
            relations: ['prompt', 'prompt.category', 'prompt.topic'],
            order: { createdAt: 'DESC' },
            take: limit,
            skip: skip,
        });

        return {
            success: true,
            data,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit),
            }
        };
    }

    @Get('attempt/:id')
    @UseGuards(JwtAuthGuard)
    async getAttemptDetail(@Param('id') id: string, @GetUser() user: User) {
        const userId = (user as any).userId || user.id;

        const attempt = await this.examRepository.findOne({
            where: { id },
            relations: ['user', 'prompt', 'prompt.category', 'prompt.topic'],
        });

        if (!attempt) {
            throw new NotFoundException('Không tìm thấy bài làm');
        }

        // Kiểm tra quyền sở hữu (Chỉ chủ sở hữu bài viết mới được xem)
        if (!attempt.user || attempt.user.id !== userId) {
            throw new ForbiddenException('Bạn không có quyền xem bài làm này');
        }

        // Giấu thông tin user nhạy cảm trước khi trả về
        delete (attempt as any).user;

        return {
            success: true,
            data: attempt,
        };
    }

    @Delete('attempt/:id')
    @UseGuards(JwtAuthGuard)
    async deleteAttempt(@Param('id') id: string, @GetUser() user: User) {
        const userId = (user as any).userId || user.id;

        const attempt = await this.examRepository.findOne({
            where: { id },
            relations: ['user'],
        });

        if (!attempt) {
            throw new NotFoundException('Không tìm thấy bài làm để xóa');
        }

        // Kiểm tra quyền sở hữu bài viết
        if (!attempt.user || attempt.user.id !== userId) {
            throw new ForbiddenException('Bạn không có quyền xóa bài làm này');
        }

        await this.examRepository.remove(attempt);

        return {
            success: true,
            message: 'Đã xóa bài làm thành công',
        };
    }
}
