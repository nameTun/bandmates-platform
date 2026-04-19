import { AI_MODELS, AI_LIMITS } from '../../config/ai-models.config';
import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiUsage } from './entities/ai-usage.entity';

@Injectable()
export class AiService {
    private genAI: GoogleGenerativeAI;

    constructor(
        private configService: ConfigService,
        @InjectRepository(AiUsage)
        private aiUsageRepository: Repository<AiUsage>,
    ) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        this.genAI = new GoogleGenerativeAI(apiKey || '');
    }

    /**
     * [HELPER] Cơ chế thử lại khi AI bận (503 Service Unavailable)
     */
    private async withRetry<T>(fn: () => Promise<T>, retries = 2, delay = 1500): Promise<T> {
        try {
            return await fn();
        } catch (error: any) {
            // Lỗi 503 là Service Unavailable, thường là tạm thời
            if (retries > 0 && (error.status === 503 || error.message?.includes('503'))) {
                console.warn(`Gemini 503 detected, retrying in ${delay}ms... (${retries} left)`);
                await new Promise(res => setTimeout(res, delay));
                return this.withRetry(fn, retries - 1, delay * 1.5);
            }
            throw error;
        }
    }

    /**
     * [CORE] Thực hiện gọi AI với cơ chế Fallback qua danh sách Model.
     */
    async generateWithFallback(prompt: string, modelList: string[]): Promise<any> {
        let lastError: any;

        for (let i = 0; i < modelList.length; i++) {
            const modelName = modelList[i];
            const isLastModel = i === modelList.length - 1;

            // 1. KIỂM TRA CHỦ ĐỘNG (PROACTIVE CHECK)
            const isAvailable = await this.checkAvailability(modelName);
            if (!isAvailable && !isLastModel) {
                console.warn(`[Quota Fallback] Model ${modelName} đã hết hạn mức trong DB. Đang thử model tiếp theo...`);
                continue;
            }

            try {
                const model = this.genAI.getGenerativeModel({ model: modelName });

                return await this.withRetry(async () => {
                    const result = await model.generateContent(prompt);
                    const response = await result.response;

                    if (!response || !response.candidates || response.candidates.length === 0) {
                        throw new Error('AI không thể phản hồi yêu cầu này.');
                    }

                    // 2. GHI NHẬN THÀNH CÔNG (TRACKING)
                    await this.recordUsage(modelName);

                    const textResponse = response.text();
                    try {
                        const cleanJson = textResponse.replace(/```json|```/g, '').trim();
                        return JSON.parse(cleanJson);
                    } catch (e: any) {
                        if (prompt.includes('STRICT JSON')) {
                            throw new Error('AI trả về định dạng JSON không hợp lệ.');
                        }
                        return { raw: textResponse };
                    }
                });
            } catch (error: any) {
                lastError = error;
                const status = error.status || (error.message?.includes('429') ? 429 : 0);

                if (status === 429) {
                    // 3. XỬ LÝ LỖI 429 (REACTIVE)
                    await this.markAsExhausted(modelName);
                    
                    if (!isLastModel) {
                        console.warn(`[Gemini Fallback] Model ${modelName} hết hạn mức (429). Đang chuyển sang model tiếp theo...`);
                        continue;
                    }
                }

                console.error(`[Gemini Error] Model ${modelName} gặp lỗi:`, error.message);
                if (isLastModel) break;
            }
        }

        throw lastError || new Error('Tất cả các model AI đều không thể phản hồi.');
    }

    /**
     * [HELPER] Lấy ngày hiện tại theo múi giờ VN (YYYY-MM-DD)
     */
    private getTodayVN(): string {
        return new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }).split(' ')[0];
    }

    /**
     * [HELPER] Lấy hoặc khởi tạo bản ghi hạn mức trong DB. Xử lý logic Reset.
     */
    private async getUsage(modelName: string): Promise<AiUsage> {
        let usage = await this.aiUsageRepository.findOne({ where: { modelName } });
        const today = this.getTodayVN();
        const now = new Date();

        if (!usage) {
            usage = this.aiUsageRepository.create({
                modelName,
                currentRPM: 0,
                currentRPD: 0,
                resetDayAt: today,
                lastRequestAt: now,
            });
            return await this.aiUsageRepository.save(usage);
        }

        let needsSave = false;
        const currentMinuteId = Math.floor(now.getTime() / 60000);

        // Logic Reset Ngày (00:00 VN)
        if (usage.resetDayAt !== today) {
            usage.currentRPD = 0;
            usage.currentRPM = 0;
            usage.resetDayAt = today;
            usage.lastMinuteId = currentMinuteId;
            needsSave = true;
        }

        // Logic Reset Phút (RPM) - Nếu sang phút mới thì reset RPM
        if (usage.lastMinuteId !== currentMinuteId) {
            usage.currentRPM = 0;
            usage.lastMinuteId = currentMinuteId;
            needsSave = true;
        }

        if (needsSave) {
            return await this.aiUsageRepository.save(usage);
        }

        return usage;
    }

    /**
     * [PROACTIVE] Kiểm tra xem model có còn hạn mức không trước khi gọi API Google.
     */
    private async checkAvailability(modelName: string): Promise<boolean> {
        const usage = await this.getUsage(modelName);
        const limits = AI_LIMITS[modelName];

        if (!limits) return true; // Nếu không cấu hình limit thì cho qua

        if (usage.currentRPD >= limits.rpd) {
            console.warn(`[Quota] Model ${modelName} đã hết hạn mức ngày (RPD: ${usage.currentRPD}/${limits.rpd})`);
            return false;
        }

        if (usage.currentRPM >= limits.rpm) {
            console.warn(`[Quota] Model ${modelName} đang bận (RPM: ${usage.currentRPM}/${limits.rpm})`);
            return false;
        }

        return true;
    }

    /**
     * [TRACKING] Cập nhật bộ đếm sau khi gọi AI thành công.
     */
    private async recordUsage(modelName: string): Promise<void> {
        const usage = await this.getUsage(modelName);
        usage.currentRPM += 1;
        usage.currentRPD += 1;
        usage.lastRequestAt = new Date();
        await this.aiUsageRepository.save(usage);
    }

    /**
     * [REACTIVE] Xử lý khi gặp lỗi 429 từ Google - Cập nhật DB để các request sau tự động nhảy model.
     */
    private async markAsExhausted(modelName: string): Promise<void> {
        const usage = await this.getUsage(modelName);
        const limits = AI_LIMITS[modelName];
        if (limits) {
            usage.currentRPM = limits.rpm; // Giả lập đã đầy RPM để nhảy fallback
            usage.lastRequestAt = new Date();
            await this.aiUsageRepository.save(usage);
        }
    }

    /**
     * [GENERIC] Gửi bất kỳ prompt tùy ý nào hỗ trợ nhóm model LIGHT.
     */
    async generateContent(prompt: string): Promise<any> {
        return this.generateWithFallback(prompt, AI_MODELS.LIGHT);
    }
}
