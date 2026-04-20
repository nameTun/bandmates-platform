import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { UserProfile } from '../user-profiles/entities/user-profile.entity';
import { VocabularyHistory } from './entities/vocabulary-history.entity';
import { AiService } from '../ai/ai.service';
import { UsageLimitAiService, UsageAction } from '../usage-limit-ai/usage-limit-ai.service';
import { VOCABULARY_API } from './vocabulary.constants';

@Injectable()
export class VocabularyService {
    // REBUILD_TRIGGER_v5
    constructor(
        @InjectRepository(VocabularyHistory)
        private readonly vocabularyRepository: Repository<VocabularyHistory>,
        private readonly httpService: HttpService,
        private readonly aiService: AiService,
        private readonly usageLimitService: UsageLimitAiService,
    ) { }

    async search(word: string, userId?: string): Promise<any> {
        const cleanWord = word.trim().toLowerCase();

        // [SNAPSHOT CHECK] Nếu đã có dữ liệu trong DB, trả về ngay lập tức
        if (userId) {
            const history = await this.vocabularyRepository.findOne({
                where: { user: { id: userId }, word: cleanWord }
            });
            if (history && history.dictionaryData) {
                return { 
                    ...history.dictionaryData, 
                    isSaved: history.isSaved,
                    fromSnapshot: true 
                };
            }
        }

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
            translation: '', 
            meanings: resultMeanings, 
            wordFamily: wordFamilyWords,
            wordFamilyData: basicWordFamilyData, 
            synonyms: (datamuseData?.synonyms?.length ?? 0) > 0
                ? datamuseData!.synonyms
                : dictionaryData.synonyms,
            antonyms: (datamuseData?.antonyms?.length ?? 0) > 0
                ? datamuseData!.antonyms
                : dictionaryData.antonyms,
        };

        // [SNAPSHOT] Lưu bản ghi lịch sử ban đầu với dữ liệu từ điển
        let isSaved = false;
        if (userId) {
            const history = await this.upsertHistory(userId, cleanWord, {
                phonetic: finalResult.phonetic,
                dictionaryData: finalResult
            });
            isSaved = history?.isSaved || false;
        }

        return { ...finalResult, isSaved };
    }

    /**
     * [NÂNG CẤP] Làm giàu dữ liệu Họ từ bằng AI.
     * Chọn ra 1 từ tiêu biểu nhất cho mỗi loại (n, v, adj, adv) và tạo ví dụ IELTS.
     */
    async getExampleWordFamilyAi(word: string, userId?: string, ip?: string, visitorId?: string, userProfile?: UserProfile | null): Promise<any> {
        const cleanWord = word.trim().toLowerCase();

        // 1. Kiểm tra và ghi nhận hạn mức (Quay về cơ chế 24h rollback)
        const usage = await this.usageLimitService.checkAndRecordUsage(userId, visitorId, ip, UsageAction.ANALYZE_WORD_FAMILY);

        // 2. [SNAPSHOT CHECK] Trả về ngay nếu đã có dữ liệu mẫu trong DB
        if (userId) {
            const history = await this.vocabularyRepository.findOne({
                where: { user: { id: userId }, word: cleanWord }
            });
            if (history && history.familyData) {
                return { result: history.familyData, usage };
            }
        }

        const familyWords = await this.extractWordFamily(cleanWord);
        
        // Chuyển object thành list từ để gửi AI
        const allFamilyWords = [
            ...familyWords.noun, 
            ...familyWords.verb, 
            ...familyWords.adj, 
            ...familyWords.adv
        ];

        if (allFamilyWords.length === 0) return { result: { mainTranslation: '', familyData: [] }, usage };

        // [STAGE 4.2] Cá nhân hóa theo người dùng
        const targetBand = userProfile?.targetBand ? Number(userProfile.targetBand) : 7.0;
        const studyPurpose = userProfile?.studyPurpose || 'General IELTS Improvement';

        const prompt = `
            Bạn là một chuyên gia ngôn ngữ học IELTS chuyên nghiệp. 
            Nhiệm vụ:
            1. Dịch từ chính "${cleanWord}" sang Tiếng Việt một cách ngắn gọn.
            2. Từ danh sách họ từ [${allFamilyWords.join(', ')}], hãy chọn tối đa 6 từ có giá trị sử dụng cao nhất trong bài viết IELTS.
            3. Với mỗi từ được chọn: 
               - Cung cấp định nghĩa bằng Tiếng Việt.
               - Đặt 1 ví dụ Tiếng Anh học thuật (độ khó chuẩn Band ${targetBand}).
               - ĐẶC BIỆT: Nội dung ví dụ PHẢI sát với bối cảnh mục đích học tập của người dùng là: "${studyPurpose}" (Ví dụ: Nếu mục đích là Work, hãy đặt ví dụ về công sở; nếu là Study Abroad, hãy nói về môi trường học tập).
               - Dịch ví dụ đó sang Tiếng Việt.

            LƯU Ý: Xưng hô chuyên nghiệp, trung tính. Không xưng hô thân mật quá mức.

            Trả về DUY NHẤT JSON theo cấu trúc:
            {
              "mainTranslation": "nghĩa tiếng Việt từ chính",
              "familyData": [
                { "word": "...", "partOfSpeech": "noun|verb|adjective|adverb", "definitionVi": "...", "example": "...", "exampleVi": "..." }
              ]
            }
        `;

        try {
            const result = await this.aiService.generateContent(prompt);

            // [SNAPSHOT] Cập nhật kết quả họ từ mẫu vào DB
            if (userId && result && result.mainTranslation) {
                await this.upsertHistory(userId, cleanWord, { familyData: result });
            }

            return {
                result: result || { mainTranslation: '', familyData: [] },
                usage
            };
        } catch (error) {
            console.error('Gemini Word Family Enrichment Error:', error);
            return {
                result: { mainTranslation: '', familyData: [] },
                usage
            };
        }
    }

    async getWordAnalysisAi(word: string, userId?: string, ip?: string, visitorId?: string, userProfile?: UserProfile | null): Promise<any> {
        const cleanWord = word.trim().toLowerCase();

        // Kiểm tra và ghi nhận hạn mức
        const usage = await this.usageLimitService.checkAndRecordUsage(userId, visitorId, ip, UsageAction.ANALYZE_WORD_STRUCTURE);

        // Trả về ngay nếu đã có phân tích AI trong DB
        if (userId) {
            const history = await this.vocabularyRepository.findOne({
                where: { user: { id: userId }, word: cleanWord }
            });
            if (history && history.aiNotes) {
                return { result: history.aiNotes, usage };
            }
        }

        const aiData = await this.getIELTSAnalysis(cleanWord, userProfile);
        const result = { word: cleanWord, ...aiData };

        // Cập nhật phân tích IELTS vào DB
        if (userId && result.ieltsBand) {
            await this.upsertHistory(userId, cleanWord, { aiNotes: result });
        }

        return {
            result: result,
            usage
        };
    }

    async toggleSave(userId: string, word: string) {
        const cleanWord = word.trim().toLowerCase();
        const history = await this.vocabularyRepository.findOne({
            where: { user: { id: userId }, word: cleanWord }
        });

        if (!history) {
            throw new HttpException('Từ vựng chưa có trong lịch sử tra cứu. Hãy tra trước khi lưu.', HttpStatus.NOT_FOUND);
        }

        history.isSaved = !history.isSaved;
        await this.vocabularyRepository.save(history);

        return { word: cleanWord, isSaved: history.isSaved };
    }

    async getHistory(userId: string, page: number = 1, limit: number = 20, isSavedOnly: boolean = false) {
        const skip = (page - 1) * limit;
        const [items, total] = await this.vocabularyRepository.findAndCount({
            where: { 
                user: { id: userId },
                ...(isSavedOnly ? { isSaved: true } : {})
            },
            order: { searchedAt: 'DESC' },
            take: limit,
            skip: skip,
            // Ở danh mục lịch sử ta chỉ lấy các trường cần thiết để nhẹ data
            select: ['id', 'word', 'phonetic', 'isSaved', 'searchedAt']
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
    private async upsertHistory(userId: string, word: string, data: Partial<VocabularyHistory>) {
        try {
            let history = await this.vocabularyRepository.findOne({
                where: { user: { id: userId }, word: word.toLowerCase() }
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
                    ...data
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

    private async getIELTSAnalysis(word: string, userProfile?: UserProfile | null) {
        try {
            const targetBand = userProfile?.targetBand ? Number(userProfile.targetBand) : 7.0;
            const studyPurpose = userProfile?.studyPurpose || 'General IELTS Improvement';

            const prompt = `
                Bạn là một giám khảo IELTS 9.0 chuyên nghiệp và khách quan. 
                Nhiệm vụ: Phân tích chuyên sâu từ "${word}" để giúp học viên nâng trình độ Writing bài bám sát mục đích học tập cá nhân.
                
                Nội dung bao gồm:
                1. "ieltsBand": Đánh giá trình độ của từ này (VD: "Đây là từ vựng thuộc Band 7.0+, hãy dùng nó để bứt phá điểm số").
                2. "collocations": Các cụm từ đi kèm phổ biến. Mỗi cụm từ gồm: "phrase" (Tiếng Anh), "meaning" (Giải thích Tiếng Việt súc tích), "example" (Ví dụ Tiếng Anh sát bối cảnh "${studyPurpose}", chuẩn Band ${targetBand}).
                3. "writingStructures": Các cấu trúc câu ăn điểm khi dùng từ này. Bao gồm "structure" (Công thức), "explanation" (Cách dùng bằng Tiếng Việt), "example" (Ví dụ Tiếng Anh chuẩn Band ${targetBand} trong bối cảnh "${studyPurpose}").
                4. "commonMistakes": Các lỗi người học hay mắc phải. "wrong" (Lỗi sai), "correct" (Cách sửa), "note" (Giải thích tại sao sai bằng Tiếng Việt).
                5. "bandUpgradeTip": Lời khuyên "vàng" bằng Tiếng Việt để dùng từ này đạt Band điểm cao hơn (không nhắc đến con số Band của đề xuất ngầm).

                LƯU Ý: Xưng hô chuyên nghiệp, trung tính. Giải thích dùng Tiếng Việt. Ví dụ dùng Tiếng Anh.

                Trả về DUY NHẤT đối tượng JSON:
                {
                    "ieltsBand": "...",
                    "collocations": [ { "phrase": "...", "meaning": "...", "example": "..." } ],
                    "writingStructures": [ { "structure": "...", "explanation": "...", "example": "..." } ],
                    "commonMistakes": [ { "wrong": "...", "correct": "...", "note": "..." } ],
                    "bandUpgradeTip": "..."
                }
            `;
            const res = await this.aiService.generateContent(prompt);
            return res;
        } catch (error) { 
            console.error('IELTS Analysis Error:', error);
            return null; 
        }
    }
}
