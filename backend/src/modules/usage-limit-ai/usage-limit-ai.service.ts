import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
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
    private readonly configService: ConfigService,
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
  ): Promise<{ limit: number; used: number; remaining: number }> {
    // 1. Chuẩn hóa IP: Đảm bảo IPv4 và IPv6 (ví dụ ::1 và 127.0.0.1) được xử lý nhất quán
    // Tránh việc cùng một máy nhưng được tính nhiều lượt do khác định dạng IP.
    const normalizedIp = this.normalizeIp(ip);
    
    // Sử dụng cơ chế cửa sổ 24 giờ cuốn chiếu (Rolling Window) 
    // thay vì mốc 0h sáng cố định để tránh lỗi lệch múi giờ giữa App và DB.
    const timeWindowStart = new Date(Date.now() - 24 * 60 * 60 * 1000); 

    // Xác định hạn mức dựa trên Role và Action
    const isGuest = !userId; // Nếu không có userId thì là khách vãng lai
    const isAdmin = userRole === 'admin'; // Nếu là admin thì không giới hạn lượt dùng

    // Nếu là Admin thì không giới hạn lượt dùng
    if (isAdmin) {
      await this.recordUsage(userId, visitorId, ip, action);
      return { limit: 999, used: 0, remaining: 999 }; // Admin thì không giới hạn số lượt
    }

    const limit = this.getLimit(action, isGuest);
    let currentUsageCount = 0;

    // Đếm số lần đã sử dụng trong ngày
    if (userId) {
      // Thành viên đã đăng nhập: Đếm theo userId
      currentUsageCount = await this.usageRepository.count({
        where: { userId, action, createdAt: MoreThanOrEqual(timeWindowStart) },
      });
    } else {
      // Khách vãng lai: Đếm theo VisitorId HOẶC IP (Để tránh việc người dùng xóa cookie để lách luật)
      // Ghi chú: Trong TypeORM, khi truyền một Mảng [] cho 'where', nó sẽ tự động hiểu là phép toán HOẶC (OR)
      const conditions: any[] = [];

      // 1. Nếu có ID trình duyệt (visitorId), thêm vào danh sách kiểm tra
      if (visitorId) {
        conditions.push({ visitorId, action, createdAt: MoreThanOrEqual(timeWindowStart) });
      }

      // 2. Nếu có IP mạng, thêm vào danh sách kiểm tra để "bọc lót"
      if (normalizedIp) {
        conditions.push({ ipAddress: normalizedIp, action, createdAt: MoreThanOrEqual(timeWindowStart) });
      }

      // Chỉ thực hiện đếm nếu có ít nhất 1 thông tin định danh (VisitorId hoặc IP), nếu 2 người sử dụng chung ipAddress (ip mạng) thì sẽ bị ảnh hưởng
      if (conditions.length > 0) {
        currentUsageCount = await this.usageRepository.count({ where: conditions });
      }
    }

    // Kiểm tra chéo hạn mức
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

    // Ghi lại lượt sử dụng mới (sử dụng IP đã chuẩn hóa)
    await this.recordUsage(userId, visitorId, normalizedIp, action);

    // Trả về thông tin hạn mức sau khi đã cộng thêm lượt vừa dùng
    const usedCount = currentUsageCount + 1;
    return {
      limit,
      used: usedCount,
      remaining: Math.max(0, limit - usedCount),
    };
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
      case UsageAction.PRACTICE_ESSAY: return 'Luyện tập viết';
      case UsageAction.ANALYZE_WORD_STRUCTURE: return 'Phân tích cấu trúc';
      case UsageAction.ANALYZE_WORD_FAMILY: return 'Phân tích word family';
      default: return 'sử dụng AI';
    }
  }
  // tăng thêm 1 lần sử dụng bằng cách tăng thêm 1 bản ghi lượt dùng
  private async recordUsage(userId?: string, visitorId?: string, ip?: string, action?: string) {
    await this.usageRepository.save({
      userId,
      visitorId,
      ipAddress: ip, // IP đã được chuẩn hóa
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
    let normalized = ip.trim();
    if (normalized === '::1') return '127.0.0.1';
    return normalized.replace(/^::ffff:/, '');
  }
}
