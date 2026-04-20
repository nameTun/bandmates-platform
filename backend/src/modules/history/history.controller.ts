import { Controller, Get, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { HistoryService } from './history.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('history')
@UseGuards(JwtAuthGuard)
export class HistoryController {
    constructor(private readonly historyService: HistoryService) {}

    /** Lấy danh sách bài luận đã chấm */
    @Get('essays')
    getEssayHistory(
        @GetUser() user: User,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('taskType') taskType?: string,
    ) {
        const userId = (user as any).userId || user.id;
        return this.historyService.getEssayHistory(userId, page, limit, taskType);
    }

    /** Lấy chi tiết một bài làm */
    @Get('essays/:id')
    getEssayDetail(@Param('id') id: string, @GetUser() user: User) {
        const userId = (user as any).userId || user.id;
        return this.historyService.getEssayDetail(id, userId);
    }

    /** Xóa một bài làm */
    @Delete('essays/:id')
    deleteEssay(@Param('id') id: string, @GetUser() user: User) {
        const userId = (user as any).userId || user.id;
        return this.historyService.deleteEssay(id, userId);
    }

    /** Lấy lịch sử tra từ vựng */
    @Get('vocabulary')
    getVocabularyHistory(
        @GetUser() user: User,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20',
    ) {
        const userId = (user as any).userId || user.id;
        return this.historyService.getVocabularyHistory(userId, Number(page), Number(limit));
    }
}
