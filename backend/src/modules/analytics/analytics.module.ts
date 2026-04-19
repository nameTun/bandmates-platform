import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { User } from '../users/entities/user.entity';
import { Prompt } from '../prompts/entities/prompt.entity';
import { ExamAttempt } from '../scoring/entities/exam-attempt.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Prompt, ExamAttempt]),
    ],
    controllers: [AnalyticsController],
    providers: [AnalyticsService],
})
export class AnalyticsModule { }
