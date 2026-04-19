import { NestFactory, HttpAdapterHost, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

/**
 * bootstrap() là hàm khởi động trung tâm của ứng dụng NestJS.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /**
   * Trust Proxy Configuration:
   * Quan trọng khi deploy lên Render, Vercel, hoặc VPS đứng sau Load Balancer/Nginx.
   * Giúp @Ip() lấy được IP thực của người dùng thay vì IP của Proxy.
   */
  const expressApp = app.getHttpAdapter().getInstance();
  if (typeof expressApp.set === 'function') {
    expressApp.set('trust proxy', 1);
  }

  /**
   * Global Validation Pipe:
   * Tự động kiểm tra dữ liệu đầu vào (DTO).
   * - whitelist: Tự động loại bỏ các thuộc tính lạ, ngăn chặn tấn công Overposting.
   * - transform: Tự động chuyển đổi kiểu dữ liệu (VD: từ string trong URL sang number trong code).
   */
  app.useGlobalPipes(
      new ValidationPipe({
          whitelist: true, 
          transform: true, 
      })
  );

  /**
   * Centralized Error Handling:
   * Sử dụng Global Filter để đảm bảo mọi lỗi trong hệ thống đều được format về một chuẩn JSON duy nhất.
   */
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  // Global Response Wrapper (Transform Interceptor)
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new TransformInterceptor(reflector));

  /**
   * Security Middlewares:
   * - helmet: Thiết lập 15 lớp bảo mật HTTP header (ngăn chặn XSS, Clickjacking...).
   * - cookie-parser: Cần thiết để Backend có thể đọc được Refresh Token từ HttpOnly Cookie.
   */
  app.use(helmet());
  app.use(cookieParser());

  /**
   * CORS Configuration:
   */
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Linh hoạt theo biến môi trường
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
