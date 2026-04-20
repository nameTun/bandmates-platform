import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ScoringCriteriaService } from './scoring-criteria.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { UpdateScoringCriteriaDto } from './dto/update-scoring-criteria.dto';

@Controller('scoring-criteria')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ScoringCriteriaController {
    constructor(private readonly criteriaService: ScoringCriteriaService) {}

    @Get()
    @Roles(UserRole.ADMIN) // Chỉ Admin mới được xem cấu hình criteria
    async findAll() {
        return this.criteriaService.findAll();
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    async update(@Param('id') id: string, @Body() dto: UpdateScoringCriteriaDto) {
        return this.criteriaService.update(id, dto.description);
    }
}
