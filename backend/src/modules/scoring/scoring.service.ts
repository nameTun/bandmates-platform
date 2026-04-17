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
      Hãy áp dụng các quy tắc sau đây để đánh giá từng tiêu chí:
      
      ${criteriaInstructions || 'Sử dụng tiêu chuẩn IELTS Writing chuẩn để đánh giá TA, CC, LR, GRA.'}

      --- HƯỚNG DẪN QUAN TRỌNG (STRICT) ---
      1. Phong cách và Ngôn ngữ: 
         - Xưng hô: Sử dụng cách xưng hô trung tính, chuyên nghiệp (ví dụ: "Chào [Tên]", hoặc "Về bài viết của bạn..."). Tuyệt đối KHÔNG xưng "em", "thầy", "mình" hay các từ ngữ quá thân mật, lan man.
         - Ngôn ngữ: Bài mẫu (betterVersion) và các câu sửa lỗi (corrected) dùng TIẾNG ANH. Phần nhận xét và giải thích (explanation) dùng TIẾNG VIỆT súc tích.
      
      2. Điểm số: Chấm từ 0 - 9.0 cho 4 tiêu chí chính thức.
      3. Nâng cấp câu văn (Sentence Improvement): Viết lại câu để khớp với chuẩn Band ${userTargetBand}.
      4. Nhận xét mục tiêu: Phân tích bài làm đã tiệm cận mức Band ${userTargetBand} chưa. 

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
