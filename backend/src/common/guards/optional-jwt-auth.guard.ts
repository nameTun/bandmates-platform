/**
 * OptionalJwtAuthGuard: Một kỹ thuật xử lý phân tầng người dùng (Tiered access).
 */
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  
  handleRequest(err: any, user: any, info: any) {
    /**
     * Nếu có lỗi (Token sai) hoặc không có user (Không có token):
     * Chúng ta KHÔNG ném lỗi, mà trả về null.
     * Khi đó, Controller vẫn được thực thi, nhưng `req.user` sẽ là null.
     */
    if (err || !user) {
      return null; 
    }

    /**
     * Nếu Token hợp lệ:
     * Trả về user để Passport gán vào `req.user`.
     */
    return user;
  }
}
