import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global Validation Pipe
  app.useGlobalPipes(
      new ValidationPipe({
          whitelist: true, // loại bỏ các field không có trong DTO
          transform: true, // ép kiểu dữ liệu (vd: string -> number)
      })
  );

  // Global Exception Filter 
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  // Security Headers
  app.use(helmet());

  // Cookie Parser
  app.use(cookieParser());

  // CORS Setup
  app.enableCors({
    origin: 'http://localhost:5173', // Frontend URL
    credentials: true, // Allow cookies
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
