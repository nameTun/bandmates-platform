import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';

import { PromptsModule } from './modules/prompts/prompts.module';
import { VocabularyModule } from './modules/vocabulary/vocabulary.module';
import databaseConfig from './config/database.config';
import { validate } from './config/env.validation';
import { UsageLimitAiModule } from './modules/usage-limit-ai/usage-limit-ai.module';
import { UserProfilesModule } from './modules/user-profiles/user-profiles.module';
import { AiModule } from './modules/ai/ai.module';
import { ScoringCriteriaModule } from './modules/scoring-criteria/scoring-criteria.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TopicsModule } from './modules/topics/topics.module';
import { PracticeModule } from './modules/practice/practice.module';
import {HistoryModule} from './modules/history/history.module';

@Module({
  imports: [
    // ConfigModule.forRoot: Load biến môi trường từ file .env
    // isGlobal: true giúp chúng ta dùng ConfigService ở mọi nơi mà không cần import lại ConfigModule.
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      validate,
    }),
    DatabaseModule,
    
    // --- Infrastructure & Utilities ---
    AiModule,
    CloudinaryModule,
    
    // --- Business Feature Modules ---
    DashboardModule,      // Unified Admin & User Dashboard
    UsersModule,          // Quản lý người dùng lõi
    UserProfilesModule,   // Thông tin cá nhân (Bands, Display Name, v.v.)
    AuthModule,           // Xử lý JWT, Login, Register, Social Auth
    UsageLimitAiModule,   // Kiểm soát hạn mức gọi AI (RPM/RPD)
    CategoriesModule,     // Quản lý Danh mục đề thi (Task 1/2, Academic/General)
    TopicsModule,         // Quản lý Chủ đề (Education, Health, v.v.)
    ScoringCriteriaModule,// Tiêu chí chấm điểm IELTS
    PracticeModule,       // Logic chấm bài (AI Scoring Engine)
    HistoryModule,        // Lịch sử bài làm Essay & Từ vựng tra cứu
    PromptsModule,        // Quản lý kho đề thi (Tasks, Topics)
    VocabularyModule,     // Học từ vựng & AI Word Analysis

  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
