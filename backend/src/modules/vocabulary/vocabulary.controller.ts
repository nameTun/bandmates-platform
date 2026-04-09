import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { VocabularyService } from './vocabulary.service';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';

@Controller('vocabulary')
export class VocabularyController {
    constructor(private readonly vocabularyService: VocabularyService) {}

    /** [FAST] Kết quả chính: phiên âm, nghĩa, ví dụ, đồng nghĩa */
    @Get('search')
    @UseGuards(OptionalJwtAuthGuard)
    async search(@Query('word') word: string, @Req() req: any) {
        const userId = req.user?.id;
        return this.vocabularyService.search(word, userId);
    }

    /** [SLOW — gọi sau] Phân tích ngữ pháp từ AI */
    @Get('ai-notes')
    async getAINotes(@Query('word') word: string) {
        return this.vocabularyService.getAINotes(word);
    }
}
