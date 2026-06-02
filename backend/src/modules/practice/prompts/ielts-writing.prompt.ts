import { Schema, SchemaType } from '@google/generative-ai';

export const IELTS_WRITING_SYSTEM_INSTRUCTION = `Bạn là một chuyên gia chấm thi IELTS Writing khách quan và chuyên nghiệp. 
Nhiệm vụ của bạn là đánh giá bài làm của học viên dựa trên các tiêu chí chính thức của IELTS một cách súc tích, đi thẳng vào vấn đề chuyên môn.

--- QUY TẮC BẮT BUỘC (STRICT PROTOCOL) ---
1. Tuân thủ PENALTY RULES & STRICT CHECK: Trong mỗi tiêu chí, nếu có mục "PENALTY RULES" hoặc "STRICT CHECK", bạn PHẢI ưu tiên kiểm tra trước. Nếu vi phạm, điểm số của tiêu chí đó PHẢI bị khống chế (Capped) theo quy định.
2. GAP ANALYSIS (Lộ trình cải thiện): Thực hiện theo hướng dẫn "ACTIONABLE MENTOR FEEDBACK" ở tiêu chí GRA. Bạn hãy đưa ra đúng 3 bước hành động (Step 1, 2, 3) và đặt phần này ở cuối trường "general" trong JSON phản hồi.
3. Phong cách và Ngôn ngữ: 
   - Xưng hô: Sử dụng phong cách chuyên nghiệp, khách quan. Không dùng các từ ngữ quá thân mật (em, mình, thầy).
   - Ngôn ngữ: Phần nhận xét (feedback) và giải thích lỗi (explanation) dùng TIẾNG VIỆT. Bài mẫu (betterVersion) dùng TIẾNG ANH.`;

export const IELTS_WRITING_RESPONSE_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    scoreTA: { type: SchemaType.NUMBER },
    scoreCC: { type: SchemaType.NUMBER },
    scoreLR: { type: SchemaType.NUMBER },
    scoreGRA: { type: SchemaType.NUMBER },
    overallScore: { type: SchemaType.NUMBER },
    feedback: {
      type: SchemaType.OBJECT,
      properties: {
        general: {
          type: SchemaType.STRING,
          description: 'Nhận xét tổng quát súc tích và 3 bước hành động (Tiếng Việt)',
        },
        ta: { type: SchemaType.STRING, description: 'Nhận xét tiêu chí TA (Tiếng Việt)' },
        cc: { type: SchemaType.STRING, description: 'Nhận xét tiêu chí CC (Tiếng Việt)' },
        lr: { type: SchemaType.STRING, description: 'Nhận xét tiêu chí LR (Tiếng Việt)' },
        gra: { type: SchemaType.STRING, description: 'Nhận xét tiêu chí GRA (Tiếng Việt)' },
      },
      required: ['general', 'ta', 'cc', 'lr', 'gra'],
    },
    corrections: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          original: { type: SchemaType.STRING },
          corrected: { type: SchemaType.STRING },
          explanation: { type: SchemaType.STRING },
          type: {
            type: SchemaType.STRING,
            description: 'Phân loại lỗi',
            // Mặc dù OpenAPI schema chuẩn có enum, nhưng Schema của Gemini API không chính thức hỗ trợ thuộc tính enum qua Type.STRING một cách đồng nhất trên mọi model, tốt nhất cứ để STRING và ghi chú
            // Nếu dùng enum: ['grammar', 'vocabulary', 'punctuation']
          },
        },
        required: ['original', 'corrected', 'explanation', 'type'],
      },
    },
    betterVersion: { type: SchemaType.STRING },
  },
  required: [
    'scoreTA',
    'scoreCC',
    'scoreLR',
    'scoreGRA',
    'overallScore',
    'feedback',
    'corrections',
    'betterVersion',
  ],
};

export function buildIeltsWritingUserPrompt(
  taskType: string,
  promptContent: string,
  text: string,
  studentContext: string,
  criteriaInstructions: string,
  aiTargetBand: number,
): string {
  return `--- BỐI CẢNH ---
LOẠI TASK: ${taskType.replace('_', ' ').toUpperCase()}
CÂU HỎI ĐỀ BÀI: "${promptContent || 'IELTS Writing Prompt'}"
BÀI LÀM CỦA HỌC VIÊN: "${text}"${studentContext ? '\n      --- HỒ SƠ HỌC VIÊN ---' + studentContext : ''}

--- HƯỚNG DẪN CHẤM ĐIỂM CHI TIẾT ---
Hãy áp dụng các quy định và mô tả Band sau đây để đánh giá từng tiêu chí một cách nghiêm ngặt:

${
  criteriaInstructions ||
  `
1. TASK ACHIEVEMENT/RESPONSE: Evaluate how fully the response addresses the prompt and maintains a clear position.
2. COHERENCE AND COHESION: Check for logical flow, paragraphing, and the effective use of linking words.
3. LEXICAL RESOURCE: Assess vocabulary range, precision, and correct use of collocations.
4. GRAMMATICAL RANGE AND ACCURACY: Check for sentence variety and frequency of error-free sentences.
`
}

- Yêu cầu bổ sung: Nâng cấp các câu văn trong bài làm của học viên để tiệm cận mức Band ${aiTargetBand}.`;
}
