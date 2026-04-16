import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Lấy thông tin người dùng (User) từ Request sau khi đã qua bước xác thực
export const GetUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    // context là bối cảnh thực thi của request, ta chuyển nó sang HTTP để lấy được đối tượng Request từ Express
    const request = context.switchToHttp().getRequest();

    // Passport sẽ tự động gán thông tin user vào request.user nếu xác thực thành công
    if (!request.user) return null;

    // Trả về một thuộc tính cụ thể nếu được truyền vào (VD: @GetUser('email')), nếu không thì trả về cả object User
    return data ? request.user[data] : request.user;
  },
);
