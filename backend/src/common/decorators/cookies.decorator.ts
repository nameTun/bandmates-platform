import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Trích xuất dữ liệu từ Cookies của Request để sử dụng trong Controller
export const Cookies = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    // context là bối cảnh thực thi, ta chuyển nó sang HTTP để lấy được các thông tin từ Request (bao gồm cả cookies)
    const request = context.switchToHttp().getRequest();

    // Trả về giá trị của một cookie cụ thể nếu có key truyền vào, nếu không thì trả về toàn bộ danh sách cookie
    return data ? request.cookies?.[data] : request.cookies;
  },
);
