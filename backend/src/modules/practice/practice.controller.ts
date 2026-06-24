import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  HttpStatus,
  HttpException,
  HttpCode,
  Ip,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfilesService } from '../user-profiles/user-profiles.service';
import { CheckTextDto } from './dto/check-text.dto';
import { PracticeAttempt } from './entities/practice-attempt.entity';
import { Prompt } from '../prompts/entities/prompt.entity';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { VisitorId } from '../../common/decorators/visitor-id.decorator';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import {
  UsageLimitAiService,
  UsageAction,
} from '../usage-limit-ai/usage-limit-ai.service';
import { TaskType } from '../../common/enums/task-type.enum';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ClientProxy } from '@nestjs/microservices';
import { PRACTICE_QUEUE } from '../queue/queue.module';

@Controller('practice')
export class PracticeController {
  constructor(
    private readonly userProfilesService: UserProfilesService,
    private readonly usageLimitService: UsageLimitAiService,
    @InjectRepository(PracticeAttempt)
    private readonly attemptRepository: Repository<PracticeAttempt>,
    @InjectRepository(Prompt)
    private readonly promptRepository: Repository<Prompt>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject(PRACTICE_QUEUE) private readonly queueClient: ClientProxy,
  ) { }

  @Post('check')
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  async checkEnglish(
    @Body() dto: CheckTextDto,
    @GetUser() user: User | null,
    @VisitorId() visitorId: string,
    @Ip() ip: string,
  ) {
    const realUserId = user?.id || (user as any)?.userId;

    // 1. Kiểm tra hạn mức sử dụng (Trừ Quota đồng bộ)
    const usage = await this.usageLimitService.checkAndRecordUsage(
      realUserId,
      visitorId,
      ip,
      UsageAction.PRACTICE_ESSAY,
      user?.role,
    );
    // Tự động đếm số từ (Word Count)
    const wordCount = dto.text.trim().split(/\\s+/).length;
    const timeSpent = dto.timeSpent || 0;

    // 2. Lấy nội dung đề bài (nếu có)
    let promptContent = '';
    let promptEntity = null;
    if (dto.promptId) {
      promptEntity = await this.promptRepository.findOne({
        where: { id: dto.promptId },
      });
      if (promptEntity) {
        promptContent = promptEntity.content;
      }
    }

    // 3. Lấy thông tin Profile
    let userProfile = null;
    if (user && user.id) {
      try {
        userProfile = await this.userProfilesService.getProfile(user.id);
      } catch (e) {
        console.warn('Không lấy được profile để cá nhân hóa AI.');
      }
    }

    // 4. KHỞI TẠO BẢN GHI PENDING trong MySQL
    const attempt = this.attemptRepository.create({
      originalText: dto.text,
      wordCount: wordCount,
      timeSpent: timeSpent,
      prompt: promptEntity,
      status: 'pending',
    });

    if (realUserId) {
      attempt.user = { id: realUserId } as any;
    } else if (visitorId) {
      attempt.visitorId = visitorId;
    }

    await this.attemptRepository.save(attempt);
    const submissionId = attempt.id;

    try {
      // 5. LƯU TRẠNG THÁI PENDING VÀO REDIS (TTL 1 giờ)
      const redisKey = `submission:${submissionId}`;
      await this.cacheManager.set(
        redisKey,
        { status: 'PENDING', result: null },
        3600000, // 1 hour in ms
      );

      // 6. BẮN MESSAGE VÀO RABBITMQ
      const taskType = promptEntity?.taskType || TaskType.TASK_2;
      this.queueClient.emit('evaluate_essay', {
        submissionId,
        text: dto.text,
        promptContent,
        userProfile,
        taskType,
        usageRecordId: usage.usageRecordId,
      }).subscribe({
        error: (err) => console.error('RabbitMQ Emit Error:', err),
      });

      // 7. TRẢ VỀ HTTP 202 ACCEPTED (do @HttpCode() ở trên hàm xử lý)
      return {
        submissionId,
        usage,
        message: 'Bài luận đã được gửi để xử lý.',
      };
    } catch (e) {
      console.error('Lỗi khi nộp bài:', e);
      // Xoá attempt nếu lỗi
      await this.attemptRepository.delete(submissionId);
      // Trả lại usage
      await this.usageLimitService.refundUsage(usage.usageRecordId);
      throw new HttpException('Lỗi hệ thống khi nộp bài', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('check/:submissionId')
  @UseGuards(OptionalJwtAuthGuard)
  async getCheckStatus(
    @Param('submissionId') submissionId: string,
    @GetUser() user: User | null,
    @VisitorId() visitorId: string,
  ) {
    const redisKey = `submission:${submissionId}`;
    const cacheData: any = await this.cacheManager.get(redisKey);

    if (cacheData) {
      return {
        submissionId,
        status: cacheData.status,
        result: cacheData.result,
      };
    }

    // Fallback: Lấy từ MySQL nếu Redis hết hạn
    const attempt = await this.attemptRepository.findOne({
      where: { id: submissionId },
      relations: ['user'], // Cần load quan hệ user để check quyền
    });

    if (!attempt) {
      throw new HttpException('Không tìm thấy bài nộp.', HttpStatus.NOT_FOUND);
    }

    // Validate quyền truy cập
    const realUserId = user?.id || (user as any)?.userId;
    const isOwner = realUserId
      ? attempt.user?.id === realUserId
      : attempt.visitorId === visitorId;

    if (!isOwner) {
      throw new HttpException(
        'Không có quyền truy cập kết quả này.',
        HttpStatus.FORBIDDEN,
      );
    }

    let result = null;
    if (attempt.status === 'success') {
      result = attempt.aiResponse;
    }

    return {
      submissionId: attempt.id,
      status: attempt.status.toUpperCase(),
      result,
    };
  }
}
