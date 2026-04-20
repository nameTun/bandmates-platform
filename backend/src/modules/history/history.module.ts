import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';
import { PracticeAttempt } from '../practice/entities/practice-attempt.entity';
import { VocabularyHistory } from '../vocabulary/entities/vocabulary-history.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([PracticeAttempt, VocabularyHistory]),
    ],
    controllers: [HistoryController],
    providers: [HistoryService],
})
export class HistoryModule {}
