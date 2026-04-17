import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ExamAttempt } from './entities/exam-attempt.entity';
import { ScoringController } from './scoring.controller';
import { ScoringService } from './scoring.service';
import { Prompt } from '../prompts/entities/prompt.entity';
import { AiModule } from '../ai/ai.module';
import { UserProfilesModule } from '../user-profiles/user-profiles.module';
import { ScoringCriteriaModule } from '../scoring-criteria/scoring-criteria.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([ExamAttempt, Prompt]),
        ConfigModule,
        AiModule,
        UserProfilesModule,
        ScoringCriteriaModule,
    ],
    controllers: [ScoringController],
    providers: [ScoringService],
    exports: [TypeOrmModule, ScoringService],
})
export class ScoringModule { }
