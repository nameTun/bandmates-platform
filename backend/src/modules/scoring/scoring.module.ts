import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GuestLimit } from './entities/guest-limit.entity';
import { ExamAttempt } from './entities/exam-attempt.entity';

import { ScoringController } from './scoring.controller';
import { GeminiService } from './gemini.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([GuestLimit, ExamAttempt]),
        ConfigModule,
    ],
    controllers: [ScoringController],
    providers: [GeminiService],
    exports: [TypeOrmModule], // Export để có thể dùng repository ở nơi khác nếu cần
})
export class ScoringModule { }
