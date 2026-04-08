import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Override hàm này để không ném lỗi (throw Exception) khi không có token hợp lệ
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      return null; // Guest: req.user sẽ là null
    }
    // Thành viên: req.user sẽ chứa thông tin giải mã từ token
    return user;
  }
}
