import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ScoringModule } from './modules/scoring/scoring.module';
import { PromptsModule } from './modules/prompts/prompts.module';
import databaseConfig from './config/database.config';
import { validate } from './config/env.validation';

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
    UsersModule,
    AuthModule,
    ScoringModule,
    PromptsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
