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
        
        // [STAGE 4] Tính toán Target Band + 1.0 (Mặc định 8.0 nếu là khách)
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
                focusInstructions = `\nHọc viên đặc biệt muốn cải thiện các kỹ năng: ${foci}. Hãy phân tích cực kỳ chi tiết các lỗi liên quan đến những phần này.`;
            }
        }

        const ieltsPrompt = `
      Bạn là một chuyên gia chấm thi IELTS Writing khách quan và chuyên nghiệp. 
      Nhiệm vụ của bạn là đánh giá bài làm của học viên dựa trên các tiêu chí chính thức của IELTS một cách súc tích, đi thẳng vào vấn đề chuyên môn.

      --- BỐI CẢNH ---
      CÂU HỎI ĐỀ BÀI: "${promptContent || 'IELTS General Writing'}"
      BÀI LÀM CỦA HỌC VIÊN: "${text}"${studentContext ? '\n      --- HỒ SƠ HỌC VIÊN ---' + studentContext : ''}

      --- HƯỚNG DẪN QUAN TRỌNG (STRICT) ---
      1. Phong cách và Ngôn ngữ: 
         - Xưng hô: Sử dụng cách xưng hô trung tính, chuyên nghiệp (ví dụ: "Chào [Tên]", hoặc "Về bài viết của bạn..."). Tuyệt đối KHÔNG xưng "em", "thầy", "mình" hay các từ ngữ quá thân mật, lan man.
         - Ngôn ngữ: Bài mẫu (betterVersion) và các câu sửa lỗi (corrected) dùng TIẾNG ANH. Phần nhận xét và giải thích (explanation) dùng TIẾNG VIỆT súc tích.
      
      2. Tiêu chí chấm điểm: Chấm từ 0 - 9.0 cho 4 tiêu chí chính thức của IELTS.

      3. Nâng cấp câu văn (Sentence Improvement): 
         - Sửa các lỗi sai về ngữ pháp và từ vựng.
         - ĐẶC BIỆT: Tìm các câu dù đúng ngữ pháp nhưng còn đơn điệu hoặc chưa tự nhiên. Hãy viết lại chúng một cách chuyên nghiệp và học thuật hơn để khớp với chuẩn Band ${userTargetBand}. Đưa các câu này vào danh sách "corrections".

      4. Nhận xét mục tiêu: Phân tích bài làm đã tiệm cận mức Band ${userTargetBand} chưa. Tuyệt đối KHÔNG nhắc đến con số Band ${aiTargetBand} trong toàn bộ văn bản phản hồi gửi cho người dùng.

      --- ĐỊNH DẠNG PHẢN HỒI (JSON DUY NHẤT) ---
      {
        "scoreTA": number,
        "scoreCC": number,
        "scoreLR": number,
        "scoreGRA": number,
        "overallScore": number,
        "feedback": {
          "general": "Nhận xét tổng quát súc tích, nêu rõ bài làm đang ở mức nào so với Band ${userTargetBand} mục tiêu. (Tiếng Việt)",
          "ta": "Nhận xét tiêu chí TA (Tiếng Việt)",
          "cc": "Nhận xét tiêu chí CC (Tiếng Việt)",
          "lr": "Nhận xét tiêu chí LR (Tiếng Việt)",
          "gra": "Nhận xét tiêu chí GRA (Tiếng Việt)"
        },
        "corrections": [
            {
                "original": "...",
                "corrected": "câu đã nâng cấp để đạt Band ${userTargetBand}",
                "explanation": "Giải thích ngắn gọn tại sao câu này giúp đạt điểm cao hơn (Tiếng Việt)",
                "type": "grammar" | "vocabulary" | "punctuation"
            }
        ],
        "betterVersion": "Một bài viết hoàn chỉnh đạt chuẩn mức độ Band ${aiTargetBand + 0.5} (Dùng tiếng Anh chuyên nghiệp, nhưng không được ghi số điểm vào nội dung bài viết)"
      }
    `;

        return this.aiService.generateWithFallback(ieltsPrompt, AI_MODELS.HEAVY);
    }
}
