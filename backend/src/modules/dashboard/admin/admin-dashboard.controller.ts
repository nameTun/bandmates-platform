import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminDashboardService } from './admin-dashboard.service';
import { Roles } from '../../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { UserRole } from '../../users/entities/user.entity';
import { AdminDashboardStatsDto } from '../dto/admin-dashboard-stats.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get('dashboard')
  @Roles(UserRole.ADMIN)
  async getStatistics(): Promise<AdminDashboardStatsDto> {
    return this.adminDashboardService.getGlobalStatistics();
  }
}
