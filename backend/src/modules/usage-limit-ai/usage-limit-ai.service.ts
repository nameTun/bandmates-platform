import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { UsageLimitAi } from './entities/usage-limit-ai.entity';

export enum UsageAction {
  PRACTICE_ESSAY = 'PRACTICE_ESSAY',
  ANALYZE_WORD_STRUCTURE = 'ANALYZE_WORD_STRUCTURE',
  ANALYZE_WORD_FAMILY = 'ANALYZE_WORD_FAMILY',
}

@Injectable()
export class UsageLimitAiService {
  constructor(
    @InjectRepository(UsageLimitAi)
    private readonly usageRepository: Repository<UsageLimitAi>,
  ) { }

  /**
   * Kiểm tra hạn mức và ghi lại lượt sử dụng AI tập trung.
   */
  async checkAndRecordUsage(
    userId?: string,
    visitorId?: string,
    ip?: string,
    action: UsageAction = UsageAction.PRACTICE_ESSAY,
    userRole?: string,
  ) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // 1. Xác định hạn mức dựa trên Role và Action
    const isGuest = !userId;
    const isAdmin = userRole === 'admin';

    // Nếu là Admin thì không giới hạn lượt dùng
    if (isAdmin) {
      await this.recordUsage(userId, visitorId, ip, action);
      return;
    }

    const limit = this.getLimit(action, isGuest);
    let count = 0;

    // 2. Đếm số lần đã sử dụng trong ngày
    if (userId) {
      // Thành viên cá nhân
      count = await this.usageRepository.count({
        where: { userId, action, createdAt: MoreThanOrEqual(startOfDay) },
      });
    } else {
      // Khách vãng lai (Double check bằng cả VisitorId và IP)
      const queryBuilder = this.usageRepository.createQueryBuilder('usage');
      count = await queryBuilder
        .where('usage.action = :action', { action })
        .andWhere('usage.createdAt >= :startOfDay', { startOfDay })
        .andWhere('(usage.visitorId = :visitorId OR usage.ipAddress = :ipAddress)', {
          visitorId: visitorId || 'unknown',
          ipAddress: ip || 'unknown',
        })
        .getCount();
    }

    // 3. Kiểm tra chéo hạn mức
    if (count >= limit) {
      const message = isGuest
        ? `Bạn đã hết lượt ${this.getActionLabel(action)} hôm nay (${count}/${limit} lượt). Hãy đăng nhập để nhận thêm lượt!`
        : `Bạn đã hết lượt ${this.getActionLabel(action)} hôm nay (${count}/${limit} lượt). Vui lòng quay lại vào ngày mai!`;

      throw new HttpException(message, HttpStatus.TOO_MANY_REQUESTS);
    }

    // 4. Ghi lại lượt sử dụng mới
    await this.recordUsage(userId, visitorId, ip, action);
  }

  private getLimit(action: UsageAction, isGuest: boolean): number {
    switch (action) {
      case UsageAction.PRACTICE_ESSAY:
        return isGuest ? 1 : 3;
      case UsageAction.ANALYZE_WORD_STRUCTURE:
      case UsageAction.ANALYZE_WORD_FAMILY:
        return isGuest ? 5 : 10;
      default:
        return 0;
    }
  }

  private getActionLabel(action: UsageAction): string {
    switch (action) {
      case UsageAction.PRACTICE_ESSAY: return 'Luyện tập viết';
      case UsageAction.ANALYZE_WORD_STRUCTURE: return 'phân tích cấu trúc từ';
      case UsageAction.ANALYZE_WORD_FAMILY: return 'làm giàu họ từ AI';
      default: return 'sử dụng AI';
    }
  }

  private async recordUsage(userId?: string, visitorId?: string, ip?: string, action?: string) {
    await this.usageRepository.save({
      userId,
      visitorId,
      ipAddress: ip,
      action: action || 'UNKNOWN',
    });
  }
}
