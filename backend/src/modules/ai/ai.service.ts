import { AI_MODELS } from '../../config/ai-models.config';
import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
    private genAI: GoogleGenerativeAI;

    constructor(private configService: ConfigService) {
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

            try {
                const model = this.genAI.getGenerativeModel({ model: modelName });

                return await this.withRetry(async () => {
                    const result = await model.generateContent(prompt);
                    const response = await result.response;

                    if (!response || !response.candidates || response.candidates.length === 0) {
                        throw new Error('AI không thể phản hồi yêu cầu này.');
                    }

                    const textResponse = response.text();
                    try {
                        const cleanJson = textResponse.replace(/```json|```/g, '').trim();
                        return JSON.parse(cleanJson);
                    } catch (e: any) {
                        // Nếu là chấm bài mà JSON lỗi, có thể cần raw text hoặc báo lỗi định dạng
                        if (prompt.includes('STRICT JSON')) {
                            throw new Error('AI trả về định dạng JSON không hợp lệ.');
                        }
                        return { raw: textResponse };
                    }
                });
            } catch (error: any) {
                lastError = error;
                const status = error.status || (error.message?.includes('429') ? 429 : 0);

                if (status === 429 && !isLastModel) {
                    console.warn(`[Gemini Fallback] Model ${modelName} hết hạn mức (429). Đang chuyển sang model tiếp theo...`);
                    continue; // Thử model tiếp theo
                }

                // Nếu là lỗi khác hoặc là model cuối cùng, báo lỗi
                console.error(`[Gemini Error] Model ${modelName} gặp lỗi:`, error.message);
                if (isLastModel) break;
            }
        }

        throw lastError || new Error('Tất cả các model AI đều không thể phản hồi.');
    }

    /**
     * [GENERIC] Gửi bất kỳ prompt tùy ý nào hỗ trợ nhóm model LIGHT.
     */
    async generateContent(prompt: string): Promise<any> {
        return this.generateWithFallback(prompt, AI_MODELS.LIGHT);
    }
}
