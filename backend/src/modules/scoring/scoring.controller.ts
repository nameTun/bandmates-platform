import { Controller, Post, Body, UseGuards, HttpStatus, HttpException, Get, Param, ForbiddenException, NotFoundException, Query, Delete } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GuestGuard } from '../../common/guards/guest.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
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

        // Lấy User từ Payload JWT
        // (Vẫn giữ logic linh hoạt để check cả .id và .userId cho an tâm tuyệt đối)
        const realUserId = user?.id || (user as any)?.userId;
        

        if (realUserId) {
            // Cách an toàn nhất để gán Relation trong TypeORM khi chỉ có ID
            attempt.user = { id: realUserId } as any;
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
