import { Controller, Post, Body, UseGuards, Req, HttpStatus, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GuestGuard } from '../../common/guards/guest.guard';
import { GeminiService } from './gemini.service';
import { CheckTextDto } from './dto/check-text.dto';
import { ExamAttempt } from './entities/exam-attempt.entity';

@Controller('scoring')
export class ScoringController {
    constructor(
        private geminiService: GeminiService,
        @InjectRepository(ExamAttempt)
        private examRepository: Repository<ExamAttempt>,
    ) { }

    @Post('check')
    @UseGuards(GuestGuard)
    async checkEnglish(@Body() dto: CheckTextDto, @Req() req: any) {
        // 1. Gọi AI để chấm điểm
        let aiResult;
        try {
            aiResult = await this.geminiService.checkEnglish(dto.text);
        } catch (error) {
            throw new HttpException('AI Service currently unavailable', HttpStatus.SERVICE_UNAVAILABLE);
        }

        // 2. Lưu lịch sử vào database
        const attempt = this.examRepository.create({
            originalText: dto.text,
            aiResponse: aiResult,
        });

        // Nếu đã login (User có trong req do GuestGuard/AuthGuard gán)
        if (req.user) {
            attempt.user = req.user; // TypeORM sẽ tự lấy ID
        } else {
            // Nếu là Guest, lưu visitorId
            attempt.visitorId = req.headers['x-visitor-id'];
        }

        await this.examRepository.save(attempt);

        // 3. Trả về kết quả cho Frontend
        return {
            success: true,
            data: aiResult,
            attemptId: attempt.id
        };
    }
}
