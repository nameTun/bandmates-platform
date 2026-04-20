import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { UserDashboardStatsDto } from './dto/user-dashboard-stats.dto';

@Controller('analytics/user')
@UseGuards(JwtAuthGuard)
export class UserDashboardController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('dashboard-stats')
    async getDashboardStats(@GetUser('id') userId: string): Promise<UserDashboardStatsDto> {
        return this.analyticsService.getUserDashboardStats(userId);
    }
}
