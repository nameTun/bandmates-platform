import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        console.log("--- Gemini Service Init ---");
        console.log("API Key loaded:", apiKey ? "YES (starts with " + apiKey.substring(0, 5) + "...)" : "NO");
        
        this.genAI = new GoogleGenerativeAI(apiKey || '');
        this.model = this.genAI.getGenerativeModel({
            model: 'gemini-flash-latest',
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
        
        // check phản hồi
        if (!response || !response.candidates || response.candidates.length === 0) {
            console.error('Gemini Error: No candidates returned', response);
            throw new Error('AI không thể phản hồi bài viết này (có thể do vi phạm chính sách an toàn).');
        }

        const textResponse = response.text();
        console.log("--- GEMINI DEBUG ---");
        console.log("Raw AI Response:", textResponse);

        try {
            // Clean response string just in case AI adds markdown blocks
            const cleanJson = textResponse.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(cleanJson);
            console.log("Parsed JSON Success!");
            return parsed;
        } catch (e) {
            console.error('Gemini JSON Parse Error:', e.message);
            console.error('Invalid Content:', textResponse);
            throw new Error('AI trả về định dạng dữ liệu không hợp lệ. Vui lòng thử lại.');
        }
    }
}
