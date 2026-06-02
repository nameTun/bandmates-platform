import { Injectable } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { AI_MODELS } from '../../config/ai-models.config';
import { UserProfile } from '../user-profiles/entities/user-profile.entity';
import { ScoringCriteriaService } from '../scoring-criteria/scoring-criteria.service';
import { TaskType } from '../../common/enums/task-type.enum';
import {
  IELTS_WRITING_SYSTEM_INSTRUCTION,
  IELTS_WRITING_RESPONSE_SCHEMA,
  buildIeltsWritingUserPrompt,
} from './prompts/ielts-writing.prompt';

@Injectable()
export class PracticeService {
  constructor(
    private aiService: AiService,
    private criteriaService: ScoringCriteriaService,
  ) {}

  /**
   * [IELTS SCORING] Chấm điểm bài IELTS Writing.
   * Hỗ trợ cá nhân hóa dựa trên dữ liệu User Profile.
   */
  async checkEnglish(
    text: string,
    promptContent?: string,
    userProfile?: UserProfile | null,
    taskType: TaskType = TaskType.TASK_2,
  ): Promise<any> {
    let studentContext = '';

    // Tính toán Target Band + 1.0 (Mặc định 8.0 nếu là khách)
    const userTargetBand = userProfile?.targetBand
      ? Number(userProfile.targetBand)
      : 7.0;
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

    const userPrompt = buildIeltsWritingUserPrompt(
      taskType,
      promptContent || '',
      text,
      studentContext,
      criteriaInstructions,
      aiTargetBand,
    );

    return this.aiService.generateWithFallback(userPrompt, AI_MODELS.HEAVY, {
      systemInstruction: IELTS_WRITING_SYSTEM_INSTRUCTION,
      responseSchema: IELTS_WRITING_RESPONSE_SCHEMA,
    });
  }
}
