import { Controller, Get, Post, Query, UseGuards, Body, Ip } from '@nestjs/common';
import { VocabularyService } from './vocabulary.service';
import { UserProfilesService } from '../user-profiles/user-profiles.service';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { VisitorId } from '../../common/decorators/visitor-id.decorator';
import { User } from '../users/entities/user.entity';

@Controller('vocabulary')
export class VocabularyController {
    constructor(
        private readonly vocabularyService: VocabularyService,
        private readonly userProfilesService: UserProfilesService
    ) {}

    /** [FAST] Kết quả chính: phiên âm, nghĩa, ví dụ, đồng nghĩa */
    @Get('search')
    @UseGuards(OptionalJwtAuthGuard)
    async search(@Query('word') word: string, @GetUser() user: User | null) {
        return this.vocabularyService.search(word, user?.id);
    }

    /** [SLOW — gọi sau] Phân tích ngữ pháp và IELTS Writing từ AI (Cá nhân hóa) */
    @Get('word-analysis-ai')
    @UseGuards(OptionalJwtAuthGuard)
    async getWordAnalysisAi(
        @Query('word') word: string, 
        @Ip() ip: string, 
        @VisitorId() visitorId: string,
        @GetUser() user: User | null
    ) {
        let userProfile = null;
        if (user && user.id) {
            try {
                userProfile = await this.userProfilesService.getProfile(user.id);
            } catch (e) {
                console.warn(`[Word-Analysis] Không lấy được profile cho user ${user.id}, dùng mặc định.`);
            }
        }
        const usage = await this.vocabularyService.getWordAnalysisAi(word, user?.id, ip, visitorId, userProfile);
        return usage; // Bây giờ Service đã trả về { result, usage }
    }

    /** [TEST] Kiểm tra kết nối Controller */
    @Get('ping')
    ping() {
        return { message: 'Vocabulary Controller is alive!' };
    }

    /** [NÂNG CẤP] Phân tích Họ từ chuyên sâu bằng AI (Cá nhân hóa theo mục tiêu & band điểm) */
    @Get('word-family-ai')
    @UseGuards(OptionalJwtAuthGuard)
    async getExampleWordFamilyAi(
        @Query('word') word: string,
        @Ip() ip: string,
        @VisitorId() visitorId: string,
        @GetUser() user: User | null
    ) {
        let userProfile = null;
        if (user && user.id) {
            try {
                userProfile = await this.userProfilesService.getProfile(user.id);
            } catch (e) {
                // Thầm lặng sử dụng mặc định nếu không có profile
                console.warn(`[Word-Family] Không lấy được profile cho user ${user.id}, dùng mặc định.`);
            }
        }
        const usage = await this.vocabularyService.getExampleWordFamilyAi(word, user?.id, ip, visitorId, userProfile);
        return usage; // Bây giờ Service đã trả về { result, usage }
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
