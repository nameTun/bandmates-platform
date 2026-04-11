import { Controller, Get, Post, Query, UseGuards, Body, Ip } from '@nestjs/common';
import { VocabularyService } from './vocabulary.service';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { VisitorId } from '../../common/decorators/visitor-id.decorator';
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
    @UseGuards(OptionalJwtAuthGuard)
    async getAINotes(
        @Query('word') word: string, 
        @Ip() ip: string, 
        @VisitorId() visitorId: string,
        @GetUser() user: User | null
    ) {
        return this.vocabularyService.getAINotes(word, user?.id, ip, visitorId);
    }

    /** [TEST] Kiểm tra kết nối Controller */
    @Get('ping')
    ping() {
        return { message: 'Vocabulary Controller is alive!' };
    }

    /** [NÂNG CẤP] Phân tích Họ từ chuyên sâu bằng AI */
    @Get('enrich')
    @UseGuards(OptionalJwtAuthGuard)
    async getFamilyAINotes(
        @Query('word') word: string, 
        @Ip() ip: string, 
        @VisitorId() visitorId: string,
        @GetUser() user: User | null
    ) {
        console.log('--- AI Enrichment Triggered for:', word, 'by', user?.id || visitorId || ip);
        return this.vocabularyService.getFamilyAINotes(word, user?.id, ip, visitorId);
    }

    /** Toggle lưu/bỏ lưu từ vào Sổ tay — Chỉ User đăng nhập */
    @Post('toggle-save')
    @UseGuards(JwtAuthGuard)
    async toggleSave(
        @Body('word') word: string,
        @GetUser() user: User
    ) {
        return this.vocabularyService.toggleSave(user.id, word);
    }

    /** Lấy lịch sử tra cứu của User - Có phân trang */
    @Get('history')
    @UseGuards(JwtAuthGuard)
    async getHistory(
        @GetUser() user: User,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20'
    ) {
        return this.vocabularyService.getHistory(user.id, Number(page), Number(limit), false);
    }

    /** Lấy danh sách từ đã lưu (Sổ tay) */
    @Get('saved')
    @UseGuards(JwtAuthGuard)
    async getSavedWords(
        @GetUser() user: User,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20'
    ) {
        return this.vocabularyService.getHistory(user.id, Number(page), Number(limit), true);
    }
}
