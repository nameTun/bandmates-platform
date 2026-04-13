import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { VocabularyController } from './vocabulary.controller';
import { VocabularyService } from './vocabulary.service';
import { VocabularyHistory } from './entities/vocabulary-history.entity';
import { AiModule } from '../ai/ai.module';
import { UsageLimitAiModule } from '../usage-limit-ai/usage-limit-ai.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([VocabularyHistory]),
        HttpModule.register({
            timeout: 5000,
            maxRedirects: 5,
        }),
        AiModule,
        UsageLimitAiModule
    ],
    controllers: [VocabularyController],
    providers: [VocabularyService],
    exports: [VocabularyService],
})
export class VocabularyModule { }
