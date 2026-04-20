import { Controller, Post, Body, UseGuards, HttpStatus, HttpException, Ip } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PracticeService } from './practice.service';
import { UserProfilesService } from '../user-profiles/user-profiles.service';
import { CheckTextDto } from './dto/check-text.dto';
import { PracticeAttempt } from './entities/practice-attempt.entity';
import { Prompt } from '../prompts/entities/prompt.entity';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { VisitorId } from '../../common/decorators/visitor-id.decorator';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { UsageLimitAiService, UsageAction } from '../usage-limit-ai/usage-limit-ai.service';
import { TaskType } from '../../common/enums/task-type.enum';

@Controller('practice')
export class PracticeController {
    constructor(
        private practiceService: PracticeService,
        private userProfilesService: UserProfilesService,
        @InjectRepository(PracticeAttempt)
        private attemptRepository: Repository<PracticeAttempt>,
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

        // --- 1. KHỞI TẠO BẢN GHI PENDING ---
        const attempt = this.attemptRepository.create({
            originalText: dto.text,
            wordCount: wordCount,
            timeSpent: timeSpent,
            prompt: promptEntity,
            status: 'pending',
        });

        const realUserId = user?.id || (user as any)?.userId;
        if (realUserId) {
            attempt.user = { id: realUserId } as any;
        } else if (visitorId) {
            attempt.visitorId = visitorId;
        }

        await this.attemptRepository.save(attempt);

        // --- 2. GỌI AI CHẤM ĐIỂM ---
        let aiResult;
        try {
            const taskType = promptEntity?.taskType || TaskType.TASK_2;
            aiResult = await this.practiceService.checkEnglish(dto.text, promptContent, userProfile, taskType);

            // --- 3. CẬP NHẬT TRẠNG THÁI SUCCESS ---
            Object.assign(attempt, {
                aiResponse: aiResult,
                overallScore: aiResult?.overallScore || null,
                scoreTA: aiResult?.scoreTA || null,
                scoreCC: aiResult?.scoreCC || null,
                scoreLR: aiResult?.scoreLR || null,
                scoreGRA: aiResult?.scoreGRA || null,
                status: 'success',
            });
            await this.attemptRepository.save(attempt);

        } catch (error) {
            // --- 4. CẬP NHẬT TRẠNG THÁI FAILED ---
            attempt.status = 'failed';
            await this.attemptRepository.save(attempt);

            console.error("Practice Error for attempt", attempt.id, ":", error);
            throw new HttpException(
                'Hệ thống chấm điểm AI đang bận hoặc gặp sự cố. Vui lòng thử lại sau vài phút.',
                HttpStatus.SERVICE_UNAVAILABLE
            );
        }

        // Trả về kết quả cho Frontend kèm thông tin hạn mức
        return {
            result: aiResult,
            attemptId: attempt.id,
            usage: usage,
        };
    }
}
