import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { UserDashboardController } from './user-dashboard.controller';
import { User } from '../users/entities/user.entity';
import { Prompt } from '../prompts/entities/prompt.entity';
import { ExamAttempt } from '../scoring/entities/exam-attempt.entity';
import { Topic } from '../topics/entities/topic.entity';
import { AiModule } from '../ai/ai.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Prompt, ExamAttempt, Topic]),
        AiModule,
    ],
    controllers: [AnalyticsController, UserDashboardController],
    providers: [AnalyticsService],
})
export class AnalyticsModule { }
