import { Injectable, HttpException, HttpStatus, Inject, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { UsageLimitAi } from './entities/usage-limit-ai.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Redis } from 'ioredis';

export enum UsageAction {
  PRACTICE_ESSAY = 'PRACTICE_ESSAY',
  ANALYZE_WORD_STRUCTURE = 'ANALYZE_WORD_STRUCTURE',
  ANALYZE_WORD_FAMILY = 'ANALYZE_WORD_FAMILY',
}

@Injectable()
export class UsageLimitAiService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;

  constructor(
    @InjectRepository(UsageLimitAi)
    private readonly usageRepository: Repository<UsageLimitAi>,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST', '127.0.0.1');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    this.redisClient = new Redis(port, host);
  }

  onModuleDestroy() {
    this.redisClient.disconnect();
  }

  /**
   * Kiểm tra hạn mức và ghi lại lượt sử dụng AI tập trung.
   */
  async checkAndRecordUsage(
    userId?: string,
    visitorId?: string,
    ip?: string,
    action: UsageAction = UsageAction.PRACTICE_ESSAY,
    userRole?: string,
  ): Promise<{
    limit: number;
    used: number;
    remaining: number;
    usageRecordId: string;
  }> {
    // 1. Chuẩn hóa IP: Đảm bảo IPv4 và IPv6 (ví dụ ::1 và 127.0.0.1) được xử lý nhất quán
    // Tránh việc cùng một máy nhưng được tính nhiều lượt do khác định dạng IP.
    const normalizedIp = this.normalizeIp(ip);

    // Sử dụng cơ chế cửa sổ 24 giờ cuốn chiếu (Rolling Window)
    // thay vì mốc 0h sáng cố định để tránh lỗi lệch múi giờ giữa App và DB.
    const timeWindowStart = Date.now() - 24 * 60 * 60 * 1000;

    // Xác định hạn mức dựa trên Role và Action
    const isGuest = !userId; // Nếu không có userId thì là khách vãng lai
    const isAdmin = userRole === 'admin'; // Nếu là admin thì không giới hạn lượt dùng

    // Nếu là Admin thì không giới hạn lượt dùng
    if (isAdmin) {
      const record = await this.recordUsage(userId, visitorId, ip, action);
      return { limit: 999, used: 0, remaining: 999, usageRecordId: record.id }; // Admin thì không giới hạn số lượt
    }

    const limit = this.getLimit(action, isGuest);
    // Xác định Redis Key dựa trên thông tin định danh
    let redisKey = '';
    if (userId) {
      redisKey = `rate_limit:${action}:user_${userId}`;
    } else if (visitorId) {
      redisKey = `rate_limit:${action}:visitor_${visitorId}`;
    } else if (normalizedIp) {
      redisKey = `rate_limit:${action}:ip_${normalizedIp}`;
    } else {
      redisKey = `rate_limit:${action}:unknown`;
    }

    // 1. Xóa các lượt truy cập cũ hơn 24 giờ
    await this.redisClient.zremrangebyscore(redisKey, '-inf', timeWindowStart.toString());

    // 2. Đếm số lượng request hiện tại
    const currentUsageCount = await this.redisClient.zcard(redisKey);

    // 3. Kiểm tra chéo hạn mức
    if (currentUsageCount >= limit) {
      const userLimit = this.getLimit(action, false);
      const actionLabel = this.getActionLabel(action);
      const message = isGuest
        ? `Bạn đã hết lượt ${actionLabel} hôm nay (${currentUsageCount}/${limit} lượt). Hãy đăng nhập để nhận thêm lượt!`
        : `Bạn đã hết lượt ${actionLabel} hôm nay (${currentUsageCount}/${limit} lượt). Vui lòng quay lại vào ngày mai!`;

      throw new HttpException(
        { message, limit, userLimit },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 4. Nếu hợp lệ, lưu vào MySQL để lấy Record ID (dành cho việc Refund sau này nếu cần)
    const record = await this.recordUsage(
      userId,
      visitorId,
      normalizedIp,
      action,
    );

    // 5. Thêm vào Redis ZSET
    const now = Date.now();
    await this.redisClient.zadd(redisKey, now, record.id.toString());
    await this.redisClient.expire(redisKey, 86400);

    // Trả về thông tin hạn mức
    const usedCount = currentUsageCount + 1;
    return {
      limit,
      used: usedCount,
      remaining: Math.max(0, limit - usedCount),
      usageRecordId: record.id,
    };
  }

  /**
   * Hoàn lại lượt dùng (Xóa bản ghi) nếu như có sự cố (ví dụ AI lỗi).
   */
  async refundUsage(usageRecordId?: string) {
    if (usageRecordId) {
      // 1. Tìm bản ghi gốc để lấy thông tin định danh
      const record = await this.usageRepository.findOne({
        where: { id: usageRecordId },
      });
      if (record) {
        let redisKey = '';
        if (record.userId)
          redisKey = `rate_limit:${record.action}:user_${record.userId}`;
        else if (record.visitorId)
          redisKey = `rate_limit:${record.action}:visitor_${record.visitorId}`;
        else if (record.ipAddress)
          redisKey = `rate_limit:${record.action}:ip_${record.ipAddress}`;

        // 2. Xóa lượt dùng khỏi Redis
        if (redisKey) {
          await this.redisClient.zrem(redisKey, usageRecordId.toString());
        }
        // 3. Xóa khỏi MySQL
        await this.usageRepository.delete(usageRecordId);
      }
    }
  }

  private getLimit(action: UsageAction, isGuest: boolean): number {
    switch (action) {
      case UsageAction.PRACTICE_ESSAY:
        return isGuest
          ? Number(this.configService.get('AI_LIMIT_PRACTICE_GUEST') || 2)
          : Number(this.configService.get('AI_LIMIT_PRACTICE_USER') || 6);
      case UsageAction.ANALYZE_WORD_STRUCTURE:
      case UsageAction.ANALYZE_WORD_FAMILY:
        return isGuest
          ? Number(this.configService.get('AI_LIMIT_VOCAB_GUEST') || 5)
          : Number(this.configService.get('AI_LIMIT_VOCAB_USER') || 10);
      default:
        return 0;
    }
  }

  private getActionLabel(action: UsageAction): string {
    switch (action) {
      case UsageAction.PRACTICE_ESSAY:
        return 'Luyện tập viết';
      case UsageAction.ANALYZE_WORD_STRUCTURE:
        return 'Phân tích cấu trúc';
      case UsageAction.ANALYZE_WORD_FAMILY:
        return 'Phân tích word family';
      default:
        return 'sử dụng AI';
    }
  }
  // tăng thêm 1 lần sử dụng bằng cách tăng thêm 1 bản ghi lượt dùng
  private async recordUsage(
    userId?: string,
    visitorId?: string,
    ip?: string,
    action?: string,
  ): Promise<UsageLimitAi> {
    return await this.usageRepository.save({
      userId,
      visitorId: userId ? undefined : visitorId,
      ipAddress: userId ? undefined : ip, // Chỉ lưu IP nếu là Guest
      action: action || 'UNKNOWN',
    });
  }

  /**
   * Chuẩn hóa địa chỉ IP:
   * - Chuyển IPv6 localhost (::1) về 127.0.0.1
   * - Loại bỏ tiền tố ::ffff: của IPv4-mapped IPv6
   */
  private normalizeIp(ip?: string): string | undefined {
    if (!ip) return undefined;
    const normalized = ip.trim();
    if (normalized === '::1') return '127.0.0.1';
    return normalized.replace(/^::ffff:/, '');
  }
}
