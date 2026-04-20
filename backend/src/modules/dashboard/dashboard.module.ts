import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Prompt } from '../prompts/entities/prompt.entity';
import { PracticeAttempt } from '../practice/entities/practice-attempt.entity';
import { Topic } from '../topics/entities/topic.entity';
import { AiUsage } from '../ai/entities/ai-usage.entity';
import { AiModule } from '../ai/ai.module';

// Admin Side
import { AdminDashboardService } from './admin/admin-dashboard.service';
import { AdminDashboardController } from './admin/admin-dashboard.controller';

// User Side
import { UserDashboardService } from './user/user-dashboard.service';
import { UserDashboardController } from './user/user-dashboard.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Prompt, PracticeAttempt, Topic, AiUsage]),
    AiModule,
  ],
  controllers: [AdminDashboardController, UserDashboardController],
  providers: [AdminDashboardService, UserDashboardService],
})
export class DashboardModule {}
