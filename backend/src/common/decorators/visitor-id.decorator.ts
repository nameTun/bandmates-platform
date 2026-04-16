import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Lấy ID định danh của người dùng vãng lai (Guest) từ Request Header
export const VisitorId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    // Chuyển bối cảnh sang HTTP để truy cập vào các thành phần của Request như Headers
    const request = context.switchToHttp().getRequest();

    // Tìm và trả về giá trị của header 'x-visitor-id' do phía Frontend gửi lên để quản lý hạn mức sử dụng (Guest Quota)
    // Nếu không có header 'x-visitor-id' thì trả về null
    return request.headers['x-visitor-id'];
  },
);
