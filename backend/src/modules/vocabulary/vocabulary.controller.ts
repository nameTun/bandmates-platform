import { Controller, Get, Post, Query, UseGuards, Body } from '@nestjs/common';
import { VocabularyService } from './vocabulary.service';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('vocabulary')
export class VocabularyController {
    constructor(private readonly vocabularyService: VocabularyService) {}

    /** [FAST] Kết quả chính: phiên âm, nghĩa, ví dụ, đồng nghĩa */
    @Get('search')
    @UseGuards(OptionalJwtAuthGuard)
    async search(@Query('word') word: string, @GetUser() user: User | null) {
        return this.vocabularyService.search(word, user?.id);
    }

    /** [SLOW — gọi sau] Phân tích ngữ pháp từ AI */
    @Get('ai-notes')
    async getAINotes(@Query('word') word: string) {
        return this.vocabularyService.getAINotes(word);
    }

    /** Toggle lưu/bỏ lưu từ vào Sổ tay — Chỉ User đăng nhập */
    @Post('save')
    @UseGuards(JwtAuthGuard)
    async toggleSaved(@Body('word') word: string, @GetUser() user: User) {
        return this.vocabularyService.toggleSaved(word, user.id);
    }

    /** Lịch sử & Sổ tay từ vựng — Chỉ User đăng nhập */
    @Get('history')
    @UseGuards(JwtAuthGuard)
    async getHistory(
        @GetUser() user: User,
        @Query('page') page = '1',
        @Query('limit') limit = '20',
        @Query('savedOnly') savedOnly = 'false',
    ) {
        return this.vocabularyService.getHistory(
            user.id,
            parseInt(page),
            parseInt(limit),
            savedOnly === 'true',
        );
    }
}
