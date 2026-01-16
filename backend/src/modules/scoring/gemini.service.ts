import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
        this.genAI = new GoogleGenerativeAI(apiKey);

        // Sử dụng model Gemini 1.5 Flash (nhanh và rẻ) hoặc Pro.
        // config responseMimeType: 'application/json' để ép Gemini trả về JSON.
        this.model = this.genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: { responseMimeType: "application/json" }
        });
    }

    async checkEnglish(text: string): Promise<any> {
        const prompt = `
      You are an strict English teacher. Analyze the following text submitted by a student.
      Text: "${text}"

      Return the analysis in the following STRICT JSON format:
      {
        "score": number (0-100),
        "feedback": "General feedback on grammar and vocabulary",
        "corrections": [
            {
                "original": "segment of text containing error",
                "corrected": "corrected segment",
                "explanation": "why it was wrong"
            }
        ],
        "betterVersion": "Rewrite the text to be more native-like"
      }
    `;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();

        // Parse JSON từ kết quả trả về
        try {
            return JSON.parse(textResponse);
        } catch (e) {
            throw new Error('AI returned invalid JSON format');
        }
    }
}
