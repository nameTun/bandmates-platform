import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { translate } from '@vitalets/google-translate-api';
import { VocabularyHistory } from './entities/vocabulary-history.entity';
import { AIUsageLog } from './entities/ai-usage-log.entity';
import { GeminiService } from '../scoring/gemini.service';
import { VOCABULARY_API } from './vocabulary.constants';

@Injectable()
export class VocabularyService {
    // REBUILD_TRIGGER_v5
    constructor(
        @InjectRepository(VocabularyHistory)
        private readonly vocabularyRepository: Repository<VocabularyHistory>,
        @InjectRepository(AIUsageLog)
        private readonly aiUsageRepository: Repository<AIUsageLog>,
        private readonly httpService: HttpService,
        private readonly geminiService: GeminiService,
    ) { }

    async search(word: string, userId?: string): Promise<any> {
        const cleanWord = word.trim().toLowerCase();

        const [dictResult, datamuseResult] = await Promise.allSettled([
            this.getDictionaryData(cleanWord),
            this.getDatamuseData(cleanWord),
        ]);

        const dictionaryData = dictResult.status === 'fulfilled' ? dictResult.value : null;
        const datamuseData = datamuseResult.status === 'fulfilled' ? datamuseResult.value : null;

        if (!dictionaryData) {
            throw new HttpException('Không tìm thấy từ này trong từ điển.', HttpStatus.NOT_FOUND);
        }

        const wordFamilyWords = await this.extractWordFamily(cleanWord);
        
        // Cấu trúc meanings ban đầu (Anh-Anh) - KHÔNG dịch thuật bằng Google Translate nữa
        const resultMeanings = (dictionaryData.meanings || []).slice(0, 3).map((m: any) => ({
            partOfSpeech: m.partOfSpeech,
            definitions: (m.definitions || []).slice(0, 2).map((d: any) => ({
                definition: d.definition, 
                definitionVi: '', 
                example: d.example || '', 
                exampleVi: '' 
            }))
        }));

        // Chuyển danh sách từ thô từ Datamuse thành format wordFamilyData cơ bản
        const basicWordFamilyData = [
            ...wordFamilyWords.noun.map(w => ({ word: w, partOfSpeech: 'noun' })),
            ...wordFamilyWords.verb.map(w => ({ word: w, partOfSpeech: 'verb' })),
            ...wordFamilyWords.adj.map(w => ({ word: w, partOfSpeech: 'adjective' })),
            ...wordFamilyWords.adv.map(w => ({ word: w, partOfSpeech: 'adverb' })),
        ];

        const finalResult = {
            word: cleanWord,
            phonetic: dictionaryData.phonetic,
            audio: dictionaryData.audio,
            translation: '', // Trống, sẽ chờ AI làm giàu
            meanings: resultMeanings, // Nghĩa thô English
            wordFamily: wordFamilyWords,
            wordFamilyData: basicWordFamilyData, 
            synonyms: (datamuseData?.synonyms?.length ?? 0) > 0
                ? datamuseData!.synonyms
                : dictionaryData.synonyms,
            antonyms: (datamuseData?.antonyms?.length ?? 0) > 0
                ? datamuseData!.antonyms
                : dictionaryData.antonyms,
        };

        if (userId) {
            this.vocabularyRepository.save({
                word: cleanWord,
                phonetic: finalResult.phonetic,
                user: { id: userId },
            }).catch(() => { });
        }

        return finalResult;
    }

    /**
     * [NÂNG CẤP] Làm giàu dữ liệu Họ từ bằng AI.
     * Chọn ra 1 từ tiêu biểu nhất cho mỗi loại (n, v, adj, adv) và tạo ví dụ IELTS.
     */
    async getFamilyAINotes(word: string, userId?: string, ip?: string, visitorId?: string): Promise<any> {
        await this.checkAndRecordUsage(userId, ip, visitorId, 'ENRICH');
        const cleanWord = word.trim().toLowerCase();
        const familyWords = await this.extractWordFamily(cleanWord);
        
        // Chuyển object thành list từ để gửi AI
        const allFamilyWords = [
            ...familyWords.noun, 
            ...familyWords.verb, 
            ...familyWords.adj, 
            ...familyWords.adv
        ];

        if (allFamilyWords.length === 0) return [];

        const prompt = `
            Bạn là chuyên gia ngôn ngữ học IELTS. 
            Nhiệm vụ:
            1. Dịch từ chính "${cleanWord}" sang tiếng Việt một cách súc tích.
            2. Với danh sách họ từ [${allFamilyWords.join(', ')}], hãy chọn ra tối đa 6 từ thông dụng nhất trong IELTS.
            3. Với mỗi từ được chọn, cung cấp: định nghĩa tiếng Việt, 1 ví dụ tiếng Anh học thuật, và dịch ví dụ đó sang tiếng Việt.

            Trả về duy nhất định dạng JSON (array của các object) nhưng bọc trong một object lớn:
            {
              "mainTranslation": "nghĩa tiếng Việt từ chính",
              "familyData": [
                { "word": "...", "partOfSpeech": "noun|verb|adjective|adverb", "definitionVi": "...", "example": "...", "exampleVi": "..." }
              ]
            }
        `;

        try {
            const enrichedData = await this.geminiService.generateContent(prompt);
            
            if (enrichedData && enrichedData.mainTranslation) {
                return enrichedData; // Trả về object lớn chứa cả 2
            }
            
            // Fallback trường hợp AI trả về raw string
            if (enrichedData && enrichedData.raw) {
                const cleanJson = enrichedData.raw.replace(/```json|```/g, '').trim();
                return JSON.parse(cleanJson);
            }
            return { mainTranslation: '', familyData: [] };
        } catch (error) {
            console.error('Gemini Word Family Enrichment Error:', error);
            return { mainTranslation: '', familyData: [] };
        }
    }

    async getAINotes(word: string, userId?: string, ip?: string, visitorId?: string): Promise<any> {
        await this.checkAndRecordUsage(userId, ip, visitorId, 'ANALYSIS');
        const cleanWord = word.trim().toLowerCase();
        const aiData = await this.getIELTSAnalysis(cleanWord);
        // Đảm bảo aiData là object trước khi spread
        const dataObj = typeof aiData === 'string' ? JSON.parse(aiData) : aiData;
        return { word: cleanWord, ...dataObj };
    }

    async toggleSaved(word: string, userId: string): Promise<any> {
        const cleanWord = word.trim().toLowerCase();
        let entry = await this.vocabularyRepository.findOne({
            where: { word: cleanWord, user: { id: userId } },
        });

        if (!entry) {
            entry = await this.vocabularyRepository.save({
                word: cleanWord,
                isSaved: true,
                user: { id: userId },
            });
        } else {
            entry.isSaved = !entry.isSaved;
            await this.vocabularyRepository.save(entry);
        }

        return { word: cleanWord, isSaved: entry.isSaved };
    }

    async getHistory(userId: string, page = 1, limit = 20, savedOnly = false): Promise<any> {
        const skip = (page - 1) * limit;
        const where: any = { user: { id: userId } };
        if (savedOnly) where.isSaved = true;

        const [data, total] = await this.vocabularyRepository.findAndCount({
            where,
            order: { searchedAt: 'DESC' },
            skip,
            take: limit,
            select: ['id', 'word', 'phonetic', 'isSaved', 'searchedAt'],
        });

        return { data, total, page, totalPages: Math.ceil(total / limit) };
    }

    /**
     * KIỂM TRA HẠN NGẠCH AI (User: 10, Guest: 5)
     * Cơ chế Double Check: Chặn theo cả VisitorId HOẶC IP đối với Guest.
     */
    private async checkAndRecordUsage(userId?: string, ip?: string, visitorId?: string, action?: string) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const limit = userId ? 10 : 5;
        let count = 0;

        if (userId) {
            // Đếm theo User ID đã đăng nhập
            count = await this.aiUsageRepository.count({
                where: { userId, createdAt: MoreThanOrEqual(startOfDay) }
            });
        } else {
            // Đếm theo VisitorId HOẶC IP cho Guest (Double Check)
            const queryBuilder = this.aiUsageRepository.createQueryBuilder('usage');
            count = await queryBuilder
                .where('usage.createdAt >= :startOfDay', { startOfDay })
                .andWhere('(usage.visitorId = :visitorId OR usage.ipAddress = :ipAddress)', { 
                    visitorId: visitorId || 'unknown', 
                    ipAddress: ip || 'unknown' 
                })
                .getCount();
        }

        if (count >= limit) {
            throw new HttpException(
                `Bạn đã hết lượt sử dụng AI hôm nay (${count}/${limit} lượt). Vui lòng quay lại vào ngày mai!`,
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        // Lưu log đồng thời các định danh để "bủa lưới" tra cứu sau này
        await this.aiUsageRepository.save({
            userId,
            visitorId,
            ipAddress: ip,
            action: action || 'UNKNOWN',
        });
    }

    private async getDictionaryData(word: string) {
        try {
            const response = await lastValueFrom(this.httpService.get(VOCABULARY_API.DICTIONARY(word)));
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
        } catch { return null; }
    }

    private async getDatamuseData(word: string) {
        try {
            const [synRes, antRes] = await Promise.all([
                lastValueFrom(this.httpService.get(VOCABULARY_API.DATAMUSE_SYNONYMS(word))),
                lastValueFrom(this.httpService.get(VOCABULARY_API.DATAMUSE_ANTONYMS(word))),
            ]);
            return { 
                synonyms: synRes.data.slice(0, 8).map((i: any) => i.word), 
                antonyms: antRes.data.slice(0, 8).map((i: any) => i.word) 
            };
        } catch { return null; }
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
                if (w !== word && (w.startsWith(root) || (word.length > 5 && w.includes(root)))) {
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

    private async getIELTSAnalysis(word: string) {
        try {
            const prompt = `
                Bạn là chuyên gia IELTS 9.0. Phân tích chuyên sâu từ: "${word}".
                Trả về DUY NHẤT một đối tượng JSON (không kèm markup) với cấu trúc sau:
                {
                    "ieltsBand": "Nâng từ Band X lên Band Y",
                    "collocations": [
                        { "phrase": "cụm từ", "meaning": "nghĩa tiếng Việt", "example": "ví dụ tiếng Anh" }
                    ],
                    "writingStructures": [
                        { "structure": "công thức/cấu trúc", "explanation": "cách dùng", "example": "ví dụ tiếng Anh" }
                    ],
                    "commonMistakes": [
                        { "wrong": "lỗi sai", "correct": "sửa đúng", "note": "vì sao" }
                    ],
                    "bandUpgradeTip": "lời khuyên nâng band"
                }
            `;
            const res = await this.geminiService.generateContent(prompt);
            
            // SỬA LỖI: geminiService.generateContent ĐÃ trả về Object
            if (res && res.ieltsBand) {
                return res;
            }
            
            // Fallback nếu AI trả về raw string
            if (res && res.raw) {
                const cleanJson = res.raw.replace(/```json|```/g, '').trim();
                return JSON.parse(cleanJson);
            }
            return res;
        } catch (error) { 
            console.error('IELTS Analysis Error:', error);
            return null; 
        }
    }
}
