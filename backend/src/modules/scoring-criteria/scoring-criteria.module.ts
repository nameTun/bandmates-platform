import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoringCriteria } from './entities/scoring-criteria.entity';
import { ScoringCriteriaController } from './scoring-criteria.controller';
import { ScoringCriteriaService } from './scoring-criteria.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([ScoringCriteria]),
    ],
    controllers: [ScoringCriteriaController],
    providers: [ScoringCriteriaService],
    exports: [ScoringCriteriaService, TypeOrmModule],
})
export class ScoringCriteriaModule { }
