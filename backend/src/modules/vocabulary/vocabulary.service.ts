import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { VocabularyHistory } from './entities/vocabulary-history.entity';
import { GeminiService } from '../scoring/gemini.service';
import { VOCABULARY_API } from './vocabulary.constants';

@Injectable()
export class VocabularyService {
    constructor(
        @InjectRepository(VocabularyHistory)
        private readonly vocabularyRepository: Repository<VocabularyHistory>,
        private readonly httpService: HttpService,
        private readonly geminiService: GeminiService,
    ) {}

    /**
     * [FAST ~300ms] Tra cứu từ vựng chính.
     * Chỉ gọi Dictionary API + Datamuse — không gọi AI.
     * Kết quả trả về ngay lập tức để người dùng đọc được.
     */
    async search(word: string, userId?: string): Promise<any> {
        const cleanWord = word.trim().toLowerCase();

        // Gọi song song 2 nguồn nhanh
        const [dictResult, datamuseResult] = await Promise.allSettled([
            this.getDictionaryData(cleanWord),
            this.getDatamuseData(cleanWord),
        ]);

        const dictionaryData = dictResult.status === 'fulfilled' ? dictResult.value : null;
        const datamuseData = datamuseResult.status === 'fulfilled' ? datamuseResult.value : null;

        if (!dictionaryData) {
            throw new HttpException('Không tìm thấy từ này trong từ điển.', HttpStatus.NOT_FOUND);
        }

        // Gộp kết quả
        const finalResult = {
            word: cleanWord,
            phonetic: dictionaryData?.phonetic || '',
            audio: dictionaryData?.audio || '',
            meanings: dictionaryData?.meanings || [],
            synonyms: datamuseData?.synonyms || dictionaryData?.synonyms || [],
            antonyms: datamuseData?.antonyms || dictionaryData?.antonyms || [],
        };

        // Lưu lịch sử nếu user đã đăng nhập (không await để không làm chậm response)
        if (userId) {
            this.vocabularyRepository.save({
                word: cleanWord,
                phonetic: finalResult.phonetic,
                user: { id: userId },
            }).catch(() => {}); // Bỏ qua lỗi lưu lịch sử, không ảnh hưởng kết quả
        }

        return finalResult;
    }

    /**
     * [SLOW ~5-8s] Lấy phân tích ngữ pháp/collocations từ Gemini AI.
     * Được gọi riêng — sau khi kết quả chính đã hiển thị lên màn hình.
     */
    async getAINotes(word: string): Promise<any> {
        const cleanWord = word.trim().toLowerCase();
        const aiData = await this.getAIExplanation(cleanWord);

        return {
            word: cleanWord,
            grammarNotes: aiData?.grammarNotes || [],
            collocations: aiData?.collocations || [],
        };
    }

    /**
     * Toggle trạng thái lưu vào Sổ tay (Notebook).
     * Nếu từ chưa có trong lịch sử → tạo mới và đánh dấu isSaved = true.
     * Nếu đã có → đổi ngược trạng thái isSaved.
     */
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

    /**
     * Lấy danh sách lịch sử tra cứu của User (có phân trang).
     * Có thể lọc chỉ các từ đã lưu vào Sổ tay bằng savedOnly=true.
     */
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

        return {
            data,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    private async getDictionaryData(word: string) {
        try {
            const response = await lastValueFrom(
                this.httpService.get(VOCABULARY_API.DICTIONARY(word))
            );
            const data = response.data[0];
            
            // Tìm audio URL trong danh sách phonetics (ép kiểu any để tránh lỗi lint vì API cấu trúc phức tạp)
            const audio = data.phonetics.find((p: any) => p.audio !== '')?.audio || '';
            
            return {
                phonetic: data.phonetic || (data.phonetics[0]?.text || ''),
                audio,
                meanings: data.meanings,
                synonyms: data.meanings[0]?.synonyms || [],
                antonyms: data.meanings[0]?.antonyms || [],
            };
        } catch (error) {
            return null;
        }
    }

    private async getDatamuseData(word: string) {
        try {
            const [synResponse, antResponse] = await Promise.all([
                lastValueFrom(this.httpService.get(VOCABULARY_API.DATAMUSE_SYNONYMS(word))),
                lastValueFrom(this.httpService.get(VOCABULARY_API.DATAMUSE_ANTONYMS(word))),
            ]);
            
            return {
                synonyms: synResponse.data.map((item: any) => item.word),
                antonyms: antResponse.data.map((item: any) => item.word),
            };
        } catch (error) {
            return null;
        }
    }

    private async getAIExplanation(word: string) {
        try {
            const prompt = `
            Phân tích từ tiếng Anh: "${word}" cho mục tiêu luyện thi IELTS.
            Cung cấp các thông tin sau dưới định dạng JSON:
            1. "grammarNotes": Mảng 2-4 lưu ý về ngữ pháp/cách dùng đặc biệt (ví dụ: giới từ đi kèm). Trả lời bằng tiếng Việt.
            2. "collocations": Mảng 4-6 cụm từ thường đi kèm phổ biến trong IELTS.
            
            Chỉ trả về JSON, không giải thích thêm: {"grammarNotes": [], "collocations": []}`;

            return await this.geminiService.generateContent(prompt);
        } catch (error) {
            return null;
        }
    }
}
