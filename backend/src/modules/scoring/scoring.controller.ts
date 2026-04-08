import { Controller, Post, Body, UseGuards, HttpStatus, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GuestGuard } from '../../common/guards/guest.guard';
import { GeminiService } from './gemini.service';
import { CheckTextDto } from './dto/check-text.dto';
import { ExamAttempt } from './entities/exam-attempt.entity';
import { Prompt } from '../prompts/entities/prompt.entity';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { VisitorId } from '../../common/decorators/visitor-id.decorator';
import { User } from '../users/entities/user.entity';

@Controller('scoring')
export class ScoringController {
    constructor(
        private geminiService: GeminiService,
        @InjectRepository(ExamAttempt)
        private examRepository: Repository<ExamAttempt>,
        @InjectRepository(Prompt)
        private promptRepository: Repository<Prompt>,
    ) { }

    @Post('check')
    @UseGuards(GuestGuard)
    async checkEnglish(
        @Body() dto: CheckTextDto,
        @GetUser() user: User | null,
        @VisitorId() visitorId: string,
    ) {
    
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

        // Gọi AI để chấm điểm (Master Prompt)
        let aiResult;
        try {
            aiResult = await this.geminiService.checkEnglish(dto.text, promptContent);
        } catch (error) {
            throw new HttpException('AI Service currently unavailable', HttpStatus.SERVICE_UNAVAILABLE);
        }

        // Lưu lịch sử vào database
        const attempt = this.examRepository.create({
            originalText: dto.text,
            wordCount: wordCount,
            timeSpent: timeSpent,
            aiResponse: aiResult,
            prompt: promptEntity,
        });

        // Nếu đã login
        if (user) {
            attempt.user = user; 
        } else {
            // Nếu là Guest, lưu visitorId
            attempt.visitorId = visitorId;
        }

        await this.examRepository.save(attempt);

        // Trả về kết quả cho Frontend
        return {
            success: true,
            data: aiResult,
            attemptId: attempt.id
        };
    }
}
