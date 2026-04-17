import { Injectable } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { AI_MODELS } from '../../config/ai-models.config';
import { UserProfile } from '../user-profiles/entities/user-profile.entity';

import { ScoringCriteriaService } from '../scoring-criteria/scoring-criteria.service';
import { TaskType } from '../../common/enums/task-type.enum';

@Injectable()
export class ScoringService {
    constructor(
        private aiService: AiService,
        private criteriaService: ScoringCriteriaService
    ) {}

    /**
     * [IELTS SCORING] Chấm điểm bài IELTS Writing.
     * Hỗ trợ cá nhân hóa dựa trên dữ liệu User Profile.
     */
    async checkEnglish(
        text: string, 
        promptContent?: string, 
        userProfile?: UserProfile | null,
        taskType: TaskType = TaskType.TASK_2
    ): Promise<any> {
        let studentContext = '';
        
        // Tính toán Target Band + 1.0 (Mặc định 8.0 nếu là khách)
        const userTargetBand = userProfile?.targetBand ? Number(userProfile.targetBand) : 7.0;
        const aiTargetBand = Math.min(userTargetBand + 1.0, 9.0);

        if (userProfile) {
            const userName = userProfile.displayName || 'học viên';
            studentContext += `\n- Tên học viên: ${userName}`;
            studentContext += `\n- Mục tiêu hiện tại: Band ${userTargetBand}`;
            studentContext += `\n- Target Band cho phản hồi này: Band ${aiTargetBand}`;

            if (userProfile.weakestSkill && userProfile.weakestSkill.length > 0) {
                const foci = userProfile.weakestSkill.join(', ');
                studentContext += `\n- Các trọng tâm cần cải thiện: ${foci}`;
            }
        }

        // ── LẤY TIÊU CHÍ CHẤM ĐIỂM TỪ DATABASE ──
        const criteria = await this.criteriaService.findByTaskType(taskType);
        
        // Tạo chuỗi hướng dẫn tiêu chí cho AI
        const criteriaInstructions = Object.entries(criteria)
            .map(([key, desc]) => `[CRITERIA: ${key}]\n${desc}`)
            .join('\n\n');

        const ieltsPrompt = `
      Bạn là một chuyên gia chấm thi IELTS Writing khách quan và chuyên nghiệp. 
      Nhiệm vụ của bạn là đánh giá bài làm của học viên dựa trên các tiêu chí chính thức của IELTS một cách súc tích, đi thẳng vào vấn đề chuyên môn.

      --- BỐI CẢNH ---
      LOẠI TASK: ${taskType.replace('_', ' ').toUpperCase()}
      CÂU HỎI ĐỀ BÀI: "${promptContent || 'IELTS Writing Prompt'}"
      BÀI LÀM CỦA HỌC VIÊN: "${text}"${studentContext ? '\n      --- HỒ SƠ HỌC VIÊN ---' + studentContext : ''}

      --- HƯỚNG DẪN CHẤM ĐIỂM CHI TIẾT ---
      Hãy áp dụng các quy định và mô tả Band sau đây để đánh giá từng tiêu chí một cách nghiêm ngặt:
      
      ${criteriaInstructions || `
      1. TASK ACHIEVEMENT/RESPONSE: Evaluate how fully the response addresses the prompt and maintains a clear position.
      2. COHERENCE AND COHESION: Check for logical flow, paragraphing, and the effective use of linking words.
      3. LEXICAL RESOURCE: Assess vocabulary range, precision, and correct use of collocations.
      4. GRAMMATICAL RANGE AND ACCURACY: Check for sentence variety and frequency of error-free sentences.
      `}

      --- QUY TẮC BẮT BUỘC (STRICT PROTOCOL) ---
      1. Tuân thủ PENALTY RULES & STRICT CHECK: Trong mỗi tiêu chí [CRITERIA] phía trên, nếu có mục "PENALTY RULES" hoặc "STRICT CHECK", bạn PHẢI ưu tiên kiểm tra trước. Nếu vi phạm, điểm số của tiêu chí đó PHẢI bị khống chế (Capped) theo quy định.
      2. GAP ANALYSIS (Lộ trình cải thiện): Thực hiện theo hướng dẫn "ACTIONABLE MENTOR FEEDBACK" ở tiêu chí GRA. Bạn hãy đưa ra đúng 3 bước hành động (Step 1, 2, 3) và đặt phần này ở cuối trường "general" trong JSON phản hồi.
      3. Phong cách và Ngôn ngữ: 
         - Xưng hô: Sử dụng phong cách chuyên nghiệp, khách quan. Không dùng các từ ngữ quá thân mật (em, mình, thầy).
         - Ngôn ngữ: Phần nhận xét (feedback) và giải thích lỗi (explanation) dùng TIẾNG VIỆT. Bài mẫu (betterVersion) dùng TIẾNG ANH.
      4. Sentence Improvement: Nâng cấp các câu văn trong bài làm của học viên để tiệm cận mức Band ${aiTargetBand}.

      --- ĐỊNH DẠNG PHẢN HỒI (JSON DUY NHẤT) ---
      {
        "scoreTA": number,
        "scoreCC": number,
        "scoreLR": number,
        "scoreGRA": number,
        "overallScore": number,
        "feedback": {
          "general": "Nhận xét tổng quát súc tích (Tiếng Việt)",
          "ta": "Nhận xét tiêu chí TA (Tiếng Việt)",
          "cc": "Nhận xét tiêu chí CC (Tiếng Việt)",
          "lr": "Nhận xét tiêu chí LR (Tiếng Việt)",
          "gra": "Nhận xét tiêu chí GRA (Tiếng Việt)"
        },
        "corrections": [
            {
                "original": "...",
                "corrected": "...",
                "explanation": "...",
                "type": "grammar" | "vocabulary" | "punctuation"
            }
        ],
        "betterVersion": "..."
      }
    `;

        return this.aiService.generateWithFallback(ieltsPrompt, AI_MODELS.HEAVY);
    }
}
