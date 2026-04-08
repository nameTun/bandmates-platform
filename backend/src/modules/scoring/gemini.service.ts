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

    async checkEnglish(text: string, promptContent?: string): Promise<any> {
        const ieltsPrompt = `
      You are an expert IELTS Writing Examiner with 10+ years of experience. 
      Your task is to accurately grade a student's IELTS Writing response based on the official IELTS band descriptors.

      --- CONTEXT ---
      EXAM QUESTION: "${promptContent || 'IELTS General Writing'}"
      STUDENT'S SUBMISSION: "${text}"

      --- INSTRUCTIONS ---
      1. Analyze the student's submission against the 4 IELTS criteria:
         - Task Achievement/Response (TA/TR)
         - Coherence and Cohesion (CC)
         - Lexical Resource (LR)
         - Grammatical Range and Accuracy (GRA)
      2. Provide a score from 0 to 9.0 for each criterion (increments of 0.5).
      3. Calculate the Overall Band Score by averaging the four criteria and rounding to the nearest 0.5 (e.g., 6.25 -> 6.5, 6.75 -> 7.0).
      4. Provide specific feedback for each criterion.
      5. Identify specific errors in the text and provide corrections.
      6. Provide an "improvedVersion" that demonstrates a Band 9 level response.

      --- RESPONSE FORMAT (STRICT JSON) ---
      Return ONLY a JSON object with this structure:
      {
        "scoreTA": number,
        "scoreCC": number,
        "scoreLR": number,
        "scoreGRA": number,
        "overallScore": number,
        "feedback": {
          "general": "string",
          "ta": "detailed feedback for Task Achievement",
          "cc": "detailed feedback for Coherence and Cohesion",
          "lr": "detailed feedback for Lexical Resource",
          "gra": "detailed feedback for Grammar"
        },
        "corrections": [
          {
            "original": "error segment",
            "corrected": "fixed segment",
            "explanation": "why",
            "type": "grammar" | "vocabulary" | "punctuation"
          }
        ],
        "betterVersion": "Band 9 sample answer"
      }
    `;

        const result = await this.model.generateContent(ieltsPrompt);
        const response = await result.response;
        const textResponse = response.text();

        try {
            // Clean response string just in case AI adds markdown blocks
            const cleanJson = textResponse.replace(/```json|```/g, '').trim();
            return JSON.parse(cleanJson);
        } catch (e) {
            console.error('Gemini JSON Parse Error:', textResponse);
            throw new Error('AI returned invalid JSON format');
        }
    }
}
