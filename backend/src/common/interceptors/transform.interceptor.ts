import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';

// Định nghĩa cấu trúc "Cái hộp" tiêu chuẩn mà chúng ta sẽ dùng để đóng gói mọi phản hồi thành công
export interface Response<T> {
  success: boolean;   
  statusCode: number; 
  message: string;     // Thông báo thân thiện gửi về cho người dùng Frontend
  data: T;             
  timestamp: string;   
  path: string;        // Đường dẫn API mà người dùng vừa truy cập
}

/**
 * TransformInterceptor chặn kết quả từ Controller và bọc vào một cấu trúc JSON đồng nhất trước khi gửi tới Client.
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext, // Chứa thông tin ngữ cảnh về Request và Handler (hàm xử lý) hiện tại
    next: CallHandler,         // Dùng để điều khiển luồng thực thi, gọi đến hàm xử lý tiếp theo (Controller)
  ): Observable<Response<T>> {
    const response = context.switchToHttp().getResponse();
    const request = context.switchToHttp().getRequest();
    const statusCode = response.statusCode;

    // Lấy thông tin tin nhắn từ Decorator @ResponseMessage đã gắn ở Controller.
    const message = this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE_KEY, [
      context.getHandler(), // Kiểm tra xem Decorator có gắn ở Level Hàm (Method) không
      context.getClass(),   // Nếu hàm không có thì kiểm tra ở Level Lớp (Controller)
    ]) || 'Thao tác thành công';

    // next.handle() sẽ thực hiện logic trong Controller để lấy dữ liệu.
    // RxJS dữ liệu thô đó thành cấu trúc Wrapper.
    return next.handle().pipe(
      map((data) => ({
        success: true,         // Vì Interceptor này chỉ bắt các case thành công, nên luôn là true
        statusCode,           
        message,               
        data,                 
        timestamp: new Date().toISOString(), 
        path: request.url,    
      })),
    );
  }
}
