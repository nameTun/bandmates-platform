import { Controller, Get, Patch, Param, Body, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    async findAll(
        @Query('page') page: string,
        @Query('limit') limit: string,
        @Query('search') search?: string,
        @Query('role') role?: string,
        @Query('provider') provider?: string,
    ) {
        return this.usersService.findAll({
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
            search,
            role,
            provider,
        });
    }

    @Get('stats')
    async getStats() {
        return this.usersService.getStats();
    }

    @Patch(':id/role')
    async updateRole(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body('role') role: UserRole,
    ) {
        return this.usersService.updateUser(id, { role });
    }

    @Patch(':id/active')
    async updateStatus(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body('isActive') isActive: boolean,
    ) {
        return this.usersService.updateUser(id, { isActive });
    }
}
