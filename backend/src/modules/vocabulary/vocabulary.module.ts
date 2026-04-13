import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ScoringModule } from '../scoring/scoring.module';
import { VocabularyController } from './vocabulary.controller';
import { VocabularyService } from './vocabulary.service';
import { VocabularyHistory } from './entities/vocabulary-history.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([VocabularyHistory]),
        HttpModule,
        ScoringModule,
    ],
    controllers: [VocabularyController],
    providers: [VocabularyService],
    exports: [VocabularyService],
})
export class VocabularyModule {}
