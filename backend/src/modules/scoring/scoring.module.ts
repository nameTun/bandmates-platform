import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ExamAttempt } from './entities/exam-attempt.entity';
import { ScoringCriteria } from './entities/scoring-criteria.entity';

import { ScoringController } from './scoring.controller';
import { ScoringService } from './scoring.service';
import { Prompt } from '../prompts/entities/prompt.entity';
import { AiModule } from '../ai/ai.module';
import { UserProfilesModule } from '../user-profiles/user-profiles.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([ExamAttempt, ScoringCriteria, Prompt]),
        ConfigModule,
        AiModule,
        UserProfilesModule, // Import để ScoringController có thể gọi UserProfilesService
    ],
    controllers: [ScoringController],
    providers: [ScoringService],
    exports: [TypeOrmModule, ScoringService],
})
export class ScoringModule { }
