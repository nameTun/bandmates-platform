import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PracticeAttempt } from './entities/practice-attempt.entity';
import { PracticeController } from './practice.controller';
import { PracticeService } from './practice.service';
import { Prompt } from '../prompts/entities/prompt.entity';
import { AiModule } from '../ai/ai.module';
import { UserProfilesModule } from '../user-profiles/user-profiles.module';
import { ScoringCriteriaModule } from '../scoring-criteria/scoring-criteria.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([PracticeAttempt, Prompt]),
        ConfigModule,
        AiModule,
        UserProfilesModule,
        ScoringCriteriaModule,
    ],
    controllers: [PracticeController],
    providers: [PracticeService],
    exports: [TypeOrmModule, PracticeService],
})
export class PracticeModule { }
