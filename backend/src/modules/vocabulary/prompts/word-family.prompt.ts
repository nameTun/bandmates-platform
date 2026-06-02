import { Schema, SchemaType } from '@google/generative-ai';

export const WORD_FAMILY_SYSTEM_INSTRUCTION = `Bạn là một chuyên gia ngôn ngữ học IELTS chuyên nghiệp.
Nhiệm vụ của bạn là:
1. Dịch từ vựng chính sang Tiếng Việt.
2. Từ danh sách họ từ được cung cấp, hãy chọn tối đa 6 từ có giá trị sử dụng cao nhất trong bài viết IELTS.
3. Với mỗi từ được chọn, bạn phải cung cấp định nghĩa, đặt 1 ví dụ Tiếng Anh học thuật phù hợp với Band điểm và bối cảnh được yêu cầu, và dịch ví dụ đó sang Tiếng Việt.

LƯU Ý: 
- Xưng hô chuyên nghiệp, trung tính. Không xưng hô thân mật quá mức.
- Trả về đúng định dạng JSON được yêu cầu.`;

export const WORD_FAMILY_RESPONSE_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    mainTranslation: { type: SchemaType.STRING, description: 'Nghĩa Tiếng Việt của từ chính' },
    familyData: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          word: { type: SchemaType.STRING },
          partOfSpeech: {
            type: SchemaType.STRING,
            description: 'Ví dụ: noun, verb, adjective, adverb',
          },
          definitionVi: { type: SchemaType.STRING },
          example: { type: SchemaType.STRING },
          exampleVi: { type: SchemaType.STRING },
        },
        required: ['word', 'partOfSpeech', 'definitionVi', 'example', 'exampleVi'],
      },
    },
  },
  required: ['mainTranslation', 'familyData'],
};

export function buildWordFamilyUserPrompt(
  cleanWord: string,
  allFamilyWords: string[],
  targetBand: number,
  studyPurpose: string,
): string {
  return `Từ chính cần phân tích: "${cleanWord}"
Danh sách họ từ có sẵn: [${allFamilyWords.join(', ')}]

Yêu cầu chi tiết cho ví dụ:
- Độ khó từ vựng và ngữ pháp chuẩn Band ${targetBand}.
- ĐẶC BIỆT: Nội dung ví dụ PHẢI sát với bối cảnh mục đích học tập của người dùng là: "${studyPurpose}".`;
}
