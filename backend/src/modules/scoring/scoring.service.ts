import { Injectable } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { AI_MODELS } from '../../config/ai-models.config';
import { UserProfile } from '../user-profiles/entities/user-profile.entity';

@Injectable()
export class ScoringService {
    constructor(private aiService: AiService) {}

    /**
     * [IELTS SCORING] Chấm điểm bài IELTS Writing.
     * Hỗ trợ cá nhân hóa dựa trên dữ liệu User Profile.
     */
    async checkEnglish(text: string, promptContent?: string, userProfile?: UserProfile | null): Promise<any> {
        let studentContext = '';
        let focusInstructions = '';

        // [STAGE 4] Cá nhân hóa Prompt nếu có Profile
        if (userProfile) {
            const userName = userProfile.displayName || 'Student';
            studentContext += `\n- Student Name: ${userName}`;

            if (userProfile.targetBand) {
                studentContext += `\n- Target Band: ${userProfile.targetBand}`;
            }

            if (userProfile.weakestSkill && userProfile.weakestSkill.length > 0) {
                const foci = userProfile.weakestSkill.join(', ');
                studentContext += `\n- Focus Areas to Improve: ${foci}`;
                focusInstructions = `\nCRITICAL INSTRUCTION: The student specifically wants to improve on: ${foci}. Please put extra emphasis and detail in your feedback regarding these areas.`;
            }
        }

        const ieltsPrompt = `
      You are an expert IELTS Writing Examiner with 10+ years of experience. 
      Your task is to accurately grade a student's IELTS Writing response based on the official IELTS band descriptors.

      --- CONTEXT ---
      EXAM QUESTION: "${promptContent || 'IELTS General Writing'}"
      STUDENT'S SUBMISSION: "${text}"${studentContext ? '\n      --- STUDENT PROFILE ---' + studentContext : ''}

      --- INSTRUCTIONS ---
      1. Analyze the student's submission against the 4 IELTS criteria:
         - Task Achievement/Response (TA/TR)
         - Coherence and Cohesion (CC)
         - Lexical Resource (LR)
         - Grammatical Range and Accuracy (GRA)
      2. Provide a score from 0 to 9.0 for each criterion (increments of 0.5).
      3. Calculate the Overall Band Score by averaging the four criteria and rounding to the nearest 0.5 (e.g., 6.25 -> 6.5, 6.75 -> 7.0).
      4. Provide specific feedback for each criterion. ${studentContext ? 'Begin your general feedback by greeting the student by name.' : ''}${focusInstructions}
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
        "improvedVersion": "Band 9 sample answer"
      }
    `;

        return this.aiService.generateWithFallback(ieltsPrompt, AI_MODELS.HEAVY);
    }
}
