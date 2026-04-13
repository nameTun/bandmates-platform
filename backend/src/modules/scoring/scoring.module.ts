import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ExamAttempt } from './entities/exam-attempt.entity';
import { ScoringCriteria } from './entities/scoring-criteria.entity';

import { ScoringController } from './scoring.controller';
import { GeminiService } from './gemini.service';

import { Prompt } from '../prompts/entities/prompt.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([ExamAttempt, ScoringCriteria, Prompt]),
        ConfigModule,
    ],
    controllers: [ScoringController],
    providers: [GeminiService],
    exports: [TypeOrmModule, GeminiService],
})
export class ScoringModule { }
