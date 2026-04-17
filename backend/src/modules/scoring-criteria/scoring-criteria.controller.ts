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
        const criteria = await this.criteriaService.findAll();
        return {
            success: true,
            data: criteria,
        };
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    async update(@Param('id') id: string, @Body() dto: UpdateScoringCriteriaDto) {
        const updated = await this.criteriaService.update(id, dto.description);
        return {
            success: true,
            data: updated,
            message: 'Cập nhật tiêu chí chấm điểm thành công',
        };
    }
}
