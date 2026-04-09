import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VocabularyHistory } from './entities/vocabulary-history.entity';

@Injectable()
export class VocabularyService {
    constructor(
        @InjectRepository(VocabularyHistory)
        private readonly vocabularyRepository: Repository<VocabularyHistory>,
    ) {}
}
