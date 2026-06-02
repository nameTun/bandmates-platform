import { Schema, SchemaType } from '@google/generative-ai';

export const WORD_ANALYSIS_SYSTEM_INSTRUCTION = `Bạn là một giám khảo IELTS 9.0 chuyên nghiệp và khách quan. 
Nhiệm vụ của bạn là phân tích chuyên sâu một từ vựng để giúp học viên nâng trình độ Writing bám sát mục đích học tập cá nhân.
                
Nội dung phân tích bắt buộc bao gồm:
1. Đánh giá trình độ (Band) của từ này.
2. Các cụm từ đi kèm phổ biến (Collocations).
3. Các cấu trúc câu ăn điểm khi dùng từ này (Writing Structures).
4. Các lỗi người học hay mắc phải (Common Mistakes).
5. Lời khuyên "vàng" bằng Tiếng Việt để dùng từ này đạt Band điểm cao hơn (không nhắc đến con số Band của đề xuất ngầm).

LƯU Ý: 
- Xưng hô chuyên nghiệp, trung tính. 
- Giải thích dùng Tiếng Việt. Ví dụ dùng Tiếng Anh.`;

export const WORD_ANALYSIS_RESPONSE_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    ieltsBand: {
      type: SchemaType.STRING,
      description: 'Ví dụ: "Đây là từ vựng thuộc Band 7.0+, hãy dùng nó để bứt phá điểm số"',
    },
    collocations: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          phrase: { type: SchemaType.STRING },
          meaning: { type: SchemaType.STRING, description: 'Giải thích Tiếng Việt súc tích' },
          example: { type: SchemaType.STRING },
        },
        required: ['phrase', 'meaning', 'example'],
      },
    },
    writingStructures: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          structure: { type: SchemaType.STRING, description: 'Công thức' },
          explanation: { type: SchemaType.STRING, description: 'Cách dùng bằng Tiếng Việt' },
          example: { type: SchemaType.STRING },
        },
        required: ['structure', 'explanation', 'example'],
      },
    },
    commonMistakes: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          wrong: { type: SchemaType.STRING, description: 'Lỗi sai' },
          correct: { type: SchemaType.STRING, description: 'Cách sửa' },
          note: { type: SchemaType.STRING, description: 'Giải thích tại sao sai bằng Tiếng Việt' },
        },
        required: ['wrong', 'correct', 'note'],
      },
    },
    bandUpgradeTip: {
      type: SchemaType.STRING,
      description: 'Lời khuyên nâng cao (Tiếng Việt)',
    },
  },
  required: [
    'ieltsBand',
    'collocations',
    'writingStructures',
    'commonMistakes',
    'bandUpgradeTip',
  ],
};

export function buildWordAnalysisUserPrompt(
  word: string,
  targetBand: number,
  studyPurpose: string,
): string {
  return `Hãy phân tích chuyên sâu từ vựng: "${word}"

Yêu cầu chi tiết cho các ví dụ (example) trong Collocations và Writing Structures:
- Ví dụ Tiếng Anh phải sát với bối cảnh: "${studyPurpose}".
- Độ khó chuẩn Band ${targetBand}.`;
}
