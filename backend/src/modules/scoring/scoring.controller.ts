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
            console.error('Scoring Error:', error); // Log lỗi chi tiết để debug
            throw new HttpException(
                `AI Service Error: ${error.message || 'Service unavailable'}`, 
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

        // Lấy User từ Payload JWT (Lưu ý: Payload dùng 'userId', Entity dùng 'id')
        if (user && (user as any).userId) {
            // Cách an toàn nhất để gán Relation trong TypeORM khi chỉ có ID
            attempt.user = { id: (user as any).userId } as any;
        } else if (visitorId) {
            attempt.visitorId = visitorId;
        }

        console.log("--- ATTEMPT DATA TO SAVE ---", {
            userId: attempt.user?.id,
            visitorId: attempt.visitorId,
            overallScore: attempt.overallScore,
            status: attempt.status
        });

        try {
            await this.examRepository.save(attempt);
            console.log("ExamAttempt saved successfully with ID:", attempt.id);
        } catch (dbError) {
            console.error("Database Save Error:", dbError);
            throw new HttpException('Lỗi lưu kết quả vào Database', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // Trả về kết quả cho Frontend
        return {
            success: true,
            data: aiResult,
            attemptId: attempt.id
        };
    }
}
