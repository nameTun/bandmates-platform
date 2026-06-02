import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { UserProfile } from '../user-profiles/entities/user-profile.entity';
import { VocabularyHistory } from './entities/vocabulary-history.entity';
import { AiService } from '../ai/ai.service';
import {
  UsageLimitAiService,
  UsageAction,
} from '../usage-limit-ai/usage-limit-ai.service';
import { VOCABULARY_API } from './vocabulary.constants';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import {
  WORD_FAMILY_SYSTEM_INSTRUCTION,
  WORD_FAMILY_RESPONSE_SCHEMA,
  buildWordFamilyUserPrompt,
} from './prompts/word-family.prompt';
import {
  WORD_ANALYSIS_SYSTEM_INSTRUCTION,
  WORD_ANALYSIS_RESPONSE_SCHEMA,
  buildWordAnalysisUserPrompt,
} from './prompts/word-analysis.prompt';

@Injectable()
export class VocabularyService {
  // REBUILD_TRIGGER_v5
  constructor(
    @InjectRepository(VocabularyHistory)
    private readonly vocabularyRepository: Repository<VocabularyHistory>,
    private readonly httpService: HttpService,
    private readonly aiService: AiService,
    private readonly usageLimitService: UsageLimitAiService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async search(word: string, userId?: string): Promise<any> {
    const cleanWord = word.trim().toLowerCase();

    // 1. Kiểm tra trạng thái isSaved từ MySQL (nếu có userId)
    let isSaved = false;
    if (userId) {
      const history = await this.vocabularyRepository.findOne({
        where: { user: { id: userId }, word: cleanWord },
      });
      if (history) {
        isSaved = history.isSaved;
      }
    }

    // 2. Kiểm tra Cache Redis
    const cacheKey = `vocab:search:${cleanWord}`;
    let finalResult: any = await this.cacheManager.get(cacheKey);

    if (!finalResult) {
      const [dictResult, datamuseResult] = await Promise.allSettled([
        this.getDictionaryData(cleanWord),
        this.getDatamuseData(cleanWord),
      ]);

      const dictionaryData =
        dictResult.status === 'fulfilled' ? dictResult.value : null;
      const datamuseData =
        datamuseResult.status === 'fulfilled' ? datamuseResult.value : null;

      if (!dictionaryData) {
        throw new HttpException(
          'Không tìm thấy từ này trong từ điển.',
          HttpStatus.NOT_FOUND,
        );
      }

      const wordFamilyWords = await this.extractWordFamily(cleanWord);

      const resultMeanings = (dictionaryData.meanings || [])
        .slice(0, 3)
        .map((m: any) => ({
          partOfSpeech: m.partOfSpeech,
          definitions: (m.definitions || []).slice(0, 2).map((d: any) => ({
            definition: d.definition,
            definitionVi: '',
            example: d.example || '',
            exampleVi: '',
          })),
        }));

      const basicWordFamilyData = [
        ...wordFamilyWords.noun.map((w) => ({ word: w, partOfSpeech: 'noun' })),
        ...wordFamilyWords.verb.map((w) => ({ word: w, partOfSpeech: 'verb' })),
        ...wordFamilyWords.adj.map((w) => ({
          word: w,
          partOfSpeech: 'adjective',
        })),
        ...wordFamilyWords.adv.map((w) => ({
          word: w,
          partOfSpeech: 'adverb',
        })),
      ];

      finalResult = {
        word: cleanWord,
        phonetic: dictionaryData.phonetic,
        audio: dictionaryData.audio,
        translation: '',
        meanings: resultMeanings,
        wordFamily: wordFamilyWords,
        wordFamilyData: basicWordFamilyData,
        synonyms:
          (datamuseData?.synonyms?.length ?? 0) > 0
            ? datamuseData!.synonyms
            : dictionaryData.synonyms,
        antonyms:
          (datamuseData?.antonyms?.length ?? 0) > 0
            ? datamuseData!.antonyms
            : dictionaryData.antonyms,
      };

      // Cache 30 ngày (ms)
      await this.cacheManager.set(
        cacheKey,
        finalResult,
        30 * 24 * 60 * 60 * 1000,
      );
    }

    // [SNAPSHOT] Ghi lịch sử truy cập (Upsert)
    if (userId) {
      await this.upsertHistory(userId, cleanWord, {
        phonetic: finalResult.phonetic,
        dictionaryData: finalResult,
      });
    }

    return { ...finalResult, isSaved };
  }

  /**
   * [NÂNG CẤP] Làm giàu dữ liệu Họ từ bằng AI.
   * Chọn ra 1 từ tiêu biểu nhất cho mỗi loại (n, v, adj, adv) và tạo ví dụ IELTS.
   */
  async getExampleWordFamilyAi(
    word: string,
    userId?: string,
    ip?: string,
    visitorId?: string,
    userProfile?: UserProfile | null,
    userRole?: string,
  ): Promise<any> {
    const cleanWord = word.trim().toLowerCase();

    // 1. Kiểm tra và ghi nhận hạn mức (Rate Limiting bằng Redis)
    const usage = await this.usageLimitService.checkAndRecordUsage(
      userId,
      visitorId,
      ip,
      UsageAction.ANALYZE_WORD_FAMILY,
      userRole,
    );

    // 2. Khởi tạo cấu hình cá nhân hóa
    const targetBand = userProfile?.targetBand
      ? Number(userProfile.targetBand)
      : 7.0;
    const studyPurpose =
      userProfile?.studyPurpose || 'General IELTS Improvement';

    // 3. Kiểm tra Redis Cache
    const cacheKey = `vocab:family:${cleanWord}:${targetBand}:${studyPurpose.replace(/\\s+/g, '_')}`;
    let result: any = await this.cacheManager.get(cacheKey);

    if (result) {
      // Hoàn lại lượt dùng vì đã lấy từ Cache
      await this.usageLimitService.refundUsage(usage.usageRecordId);
      usage.used = Math.max(0, usage.used - 1);
      usage.remaining += 1;
    } else {
      // Chưa có Cache -> Gọi AI
      const familyWords = await this.extractWordFamily(cleanWord);
      const allFamilyWords: string[] = [
        ...(familyWords.noun as string[]),
        ...(familyWords.verb as string[]),
        ...(familyWords.adj as string[]),
        ...(familyWords.adv as string[]),
      ];

      if (allFamilyWords.length === 0)
        return { result: { mainTranslation: '', familyData: [] }, usage };

      const userPrompt = buildWordFamilyUserPrompt(
        cleanWord,
        allFamilyWords,
        targetBand,
        studyPurpose,
      );

      try {
        result = await this.aiService.generateContent(userPrompt, {
          systemInstruction: WORD_FAMILY_SYSTEM_INSTRUCTION,
          responseSchema: WORD_FAMILY_RESPONSE_SCHEMA,
        });
        // Cache 30 ngày
        if (result && result.mainTranslation) {
          await this.cacheManager.set(
            cacheKey,
            result,
            30 * 24 * 60 * 60 * 1000,
          );
        }
      } catch (error) {
        console.error('Gemini Word Family Enrichment Error:', error);
        await this.usageLimitService.refundUsage(usage.usageRecordId);
        throw error;
      }
    }

    // [SNAPSHOT] Cập nhật vào MySQL
    if (userId && result && result.mainTranslation) {
      await this.upsertHistory(userId, cleanWord, { familyData: result });
    }

    return { result: result || { mainTranslation: '', familyData: [] }, usage };
  }

  async getWordAnalysisAi(
    word: string,
    userId?: string,
    ip?: string,
    visitorId?: string,
    userProfile?: UserProfile | null,
    userRole?: string,
  ): Promise<any> {
    const cleanWord = word.trim().toLowerCase();

    // 1. Kiểm tra hạn mức (Redis Rate Limiting)
    const usage = await this.usageLimitService.checkAndRecordUsage(
      userId,
      visitorId,
      ip,
      UsageAction.ANALYZE_WORD_STRUCTURE,
      userRole,
    );

    // 2. Khởi tạo cấu hình cá nhân
    const targetBand = userProfile?.targetBand
      ? Number(userProfile.targetBand)
      : 7.0;
    const studyPurpose =
      userProfile?.studyPurpose || 'General IELTS Improvement';

    // 3. Kiểm tra Redis Cache
    const cacheKey = `vocab:analysis:${cleanWord}:${targetBand}:${studyPurpose.replace(/\\s+/g, '_')}`;
    let result: any = await this.cacheManager.get(cacheKey);

    if (result) {
      // Refund usage
      await this.usageLimitService.refundUsage(usage.usageRecordId);
      usage.used = Math.max(0, usage.used - 1);
      usage.remaining += 1;
    } else {
      try {
        const aiData = await this.getIELTSAnalysis(cleanWord, userProfile);
        result = { word: cleanWord, ...aiData };

        if (result.ieltsBand) {
          await this.cacheManager.set(
            cacheKey,
            result,
            30 * 24 * 60 * 60 * 1000,
          );
        }
      } catch (error) {
        console.error('Gemini Word Analysis Error:', error);
        await this.usageLimitService.refundUsage(usage.usageRecordId);
        throw error;
      }
    }

    // Cập nhật vào DB
    if (userId && result && result.ieltsBand) {
      await this.upsertHistory(userId, cleanWord, { aiNotes: result });
    }

    return { result, usage };
  }

  async toggleSave(userId: string, word: string) {
    const cleanWord = word.trim().toLowerCase();
    const history = await this.vocabularyRepository.findOne({
      where: { user: { id: userId }, word: cleanWord },
    });

    if (!history) {
      throw new HttpException(
        'Từ vựng chưa có trong lịch sử tra cứu. Hãy tra trước khi lưu.',
        HttpStatus.NOT_FOUND,
      );
    }

    history.isSaved = !history.isSaved;
    await this.vocabularyRepository.save(history);

    return { word: cleanWord, isSaved: history.isSaved };
  }

  async getHistory(
    userId: string,
    page: number = 1,
    limit: number = 20,
    isSavedOnly: boolean = false,
  ) {
    const skip = (page - 1) * limit;
    const [items, total] = await this.vocabularyRepository.findAndCount({
      where: {
        user: { id: userId },
        ...(isSavedOnly ? { isSaved: true } : {}),
      },
      order: { searchedAt: 'DESC' },
      take: limit,
      skip: skip,
      // Ở danh mục lịch sử ta chỉ lấy các trường cần thiết để nhẹ data
      select: ['id', 'word', 'phonetic', 'isSaved', 'searchedAt'],
    });

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * [PERSISTENCE] Cập nhật hoặc lưu mới Snapshot lịch sử tra cứu
   */
  private async upsertHistory(
    userId: string,
    word: string,
    data: Partial<VocabularyHistory>,
  ) {
    try {
      const history = await this.vocabularyRepository.findOne({
        where: { user: { id: userId }, word: word.toLowerCase() },
      });

      if (history) {
        // Cập nhật Snapshot (Object.assign để không ghi đè các trường khác)
        Object.assign(history, data);
        history.searchedAt = new Date(); // Update thời gian tra gần nhất
        return await this.vocabularyRepository.save(history);
      } else {
        // Tạo mới record
        const newHistory = this.vocabularyRepository.create({
          user: { id: userId },
          word: word.toLowerCase(),
          ...data,
        });
        return await this.vocabularyRepository.save(newHistory);
      }
    } catch (error) {
      console.error('Failed to upsert history:', error);
      return null;
    }
  }

  private async getDictionaryData(word: string) {
    try {
      const response = await lastValueFrom(
        this.httpService.get(VOCABULARY_API.DICTIONARY(word)),
      );
      const data = response.data[0];
      const audio = data.phonetics?.find((p: any) => p.audio)?.audio || '';

      const synonyms: string[] = [];
      const antonyms: string[] = [];
      for (const m of data.meanings || []) {
        synonyms.push(...(m.synonyms || []));
        antonyms.push(...(m.antonyms || []));
        for (const d of m.definitions || []) {
          synonyms.push(...(d.synonyms || []));
          antonyms.push(...(d.antonyms || []));
        }
      }

      return {
        phonetic: data.phonetic || data.phonetics?.[0]?.text || '',
        audio,
        meanings: data.meanings || [],
        synonyms: [...new Set(synonyms)].slice(0, 8),
        antonyms: [...new Set(antonyms)].slice(0, 8),
      };
    } catch {
      return null;
    }
  }

  private async getDatamuseData(word: string) {
    try {
      const [synRes, antRes] = await Promise.all([
        lastValueFrom(
          this.httpService.get(VOCABULARY_API.DATAMUSE_SYNONYMS(word)),
        ),
        lastValueFrom(
          this.httpService.get(VOCABULARY_API.DATAMUSE_ANTONYMS(word)),
        ),
      ]);
      return {
        synonyms: synRes.data.slice(0, 8).map((i: any) => i.word),
        antonyms: antRes.data.slice(0, 8).map((i: any) => i.word),
      };
    } catch {
      return null;
    }
  }

  /**
   * [TỐI ƯU] Trích xuất Họ từ từ Datamuse (Fast)
   */
  private async extractWordFamily(word: string) {
    try {
      // Sử dụng ml (means like) và rel_trg (trigger) để tìm các từ liên quan chặt chẽ
      const url = `https://api.datamuse.com/words?ml=${word}&md=p&max=50`;
      const res = await lastValueFrom(this.httpService.get(url));
      const data = res.data;
      const family: any = { noun: [], verb: [], adj: [], adv: [] };

      // Giảm root length xuống 3 để lấy được nhiều biến thể hơn (vd: success -> succ -> successful)
      const root = word.toLowerCase().substring(0, 3);

      data.forEach((item: any) => {
        const w = item.word.toLowerCase();
        const tags = item.tags || [];

        // Điều kiện: Bắt đầu bằng root HOẶC chứa root (với từ đủ dài)
        if (
          w !== word &&
          (w.startsWith(root) || (word.length > 5 && w.includes(root)))
        ) {
          if (tags.includes('n')) family.noun.push(w);
          else if (tags.includes('v')) family.verb.push(w);
          else if (tags.includes('adj')) family.adj.push(w);
          else if (tags.includes('adv')) family.adv.push(w);
        }
      });

      return {
        noun: [...new Set(family.noun)].slice(0, 3),
        verb: [...new Set(family.verb)].slice(0, 3),
        adj: [...new Set(family.adj)].slice(0, 3),
        adv: [...new Set(family.adv)].slice(0, 3),
      };
    } catch {
      return { noun: [], verb: [], adj: [], adv: [] };
    }
  }

  private async getIELTSAnalysis(
    word: string,
    userProfile?: UserProfile | null,
  ) {
    try {
      const targetBand = userProfile?.targetBand
        ? Number(userProfile.targetBand)
        : 7.0;
      const studyPurpose =
        userProfile?.studyPurpose || 'General IELTS Improvement';

      const userPrompt = buildWordAnalysisUserPrompt(
        word,
        targetBand,
        studyPurpose,
      );
      const res = await this.aiService.generateContent(userPrompt, {
        systemInstruction: WORD_ANALYSIS_SYSTEM_INSTRUCTION,
        responseSchema: WORD_ANALYSIS_RESPONSE_SCHEMA,
      });
      return res;
    } catch (error) {
      console.error('IELTS Analysis Error:', error);
      return null;
    }
  }
}
