import { Controller, Inject } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PracticeService } from './practice.service';
import { PracticeAttempt } from './entities/practice-attempt.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { UsageLimitAiService } from '../usage-limit-ai/usage-limit-ai.service';

@Controller()
export class PracticeWorker {
  constructor(
    private readonly practiceService: PracticeService,
    private readonly usageLimitService: UsageLimitAiService,
    @InjectRepository(PracticeAttempt)
    private readonly attemptRepository: Repository<PracticeAttempt>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) { }

  @EventPattern('evaluate_essay')
  async handleEvaluateEssay(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    const {
      submissionId,
      text,
      promptContent,
      userProfile,
      taskType,
      usageRecordId,
    } = data;

    const redisKey = `submission:${submissionId}`;
    const maxRetries = 3;
    let attemptCount = 0;

    while (attemptCount < maxRetries) {
      try {
        // 1. Cập nhật trạng thái Redis -> PROCESSING
        await this.cacheManager.set(
          redisKey,
          { status: 'PROCESSING', result: null },
          3600000,
        );

        // 2. Gọi AI xử lý chấm bài
        const aiResult = await this.practiceService.checkEnglish(
          text,
          promptContent,
          userProfile,
          taskType,
        );

        // 3. Cập nhật Database -> SUCCESS
        const attempt = await this.attemptRepository.findOne({
          where: { id: submissionId },
        });
        if (attempt) {
          Object.assign(attempt, {
            aiResponse: aiResult,
            overallScore: aiResult?.overallScore || 0,
            scoreTA: aiResult?.scoreTA || 0,
            scoreCC: aiResult?.scoreCC || 0,
            scoreLR: aiResult?.scoreLR || 0,
            scoreGRA: aiResult?.scoreGRA || 0,
            status: 'success',
          });
          await this.attemptRepository.save(attempt);
        }

        // 4. Cập nhật trạng thái Redis -> COMPLETED
        await this.cacheManager.set(
          redisKey,
          { status: 'COMPLETED', result: aiResult },
          3600000,
        );

        // Thành công -> Báo MQ xóa tin nhắn đi
        channel.ack(originalMsg);
        return; // Thoát vòng lặp

      } catch (error) {
        attemptCount++;
        console.error(`[Worker Error] Failed to evaluate essay ${submissionId} (Lần thử ${attemptCount}):`, error);

        if (attemptCount >= maxRetries) {
          // Xử lý lỗi tạch hẳn: Cập nhật Failed, Refund quota, đẩy vào DLQ
          const attempt = await this.attemptRepository.findOne({
            where: { id: submissionId },
          });
          if (attempt) {
            attempt.status = 'failed';
            await this.attemptRepository.save(attempt);
          }

          await this.cacheManager.set(
            redisKey,
            { status: 'FAILED', result: null },
            3600000,
          );

          if (usageRecordId) {
            await this.usageLimitService.refundUsage(usageRecordId);
          }

          // Đẩy vào Dead Letter Queue để lưu vết thủ công
          await channel.assertQueue('practice_dlq', { durable: true });
          channel.sendToQueue('practice_dlq', originalMsg.content);

          // Báo xóa tin nhắn khỏi hàng chờ chính
          channel.ack(originalMsg);
          return;
        }

        // Nếu chưa tới giới hạn, đổi trạng thái và chờ vài giây rồi thử lại
        await this.cacheManager.set(
          redisKey,
          { status: 'RETRYING', result: null },
          3600000,
        );
        await new Promise(resolve => setTimeout(resolve, 5000)); // Chờ 5s
      }
    }
  }
}
