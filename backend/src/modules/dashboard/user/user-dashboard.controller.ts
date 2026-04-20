import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserDashboardService } from './user-dashboard.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { GetUser } from '../../../common/decorators/get-user.decorator';
import { UserDashboardStatsDto } from '../dto/user-dashboard-stats.dto';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserDashboardController {
  constructor(private readonly userDashboardService: UserDashboardService) {}

  @Get('dashboard')
  async getDashboardStats(@GetUser('id') userId: string): Promise<UserDashboardStatsDto> {
    return this.userDashboardService.getUserDashboardStats(userId);
  }
}
