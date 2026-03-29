import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

    catch(exception: unknown, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost;
        const ctx = host.switchToHttp();

        // Xác định HTTP Status Code
        const httpStatus =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        // Lấy chi tiết lỗi (message, error array từ class-validator nếu có)
        // Nếu là HttpException (như NotFound, BadRequest, Unauthorized...) thì lấy ra message chuẩn
        const exceptionResponse =
            exception instanceof HttpException
                ? exception.getResponse()
                : null;

        const message =
            exceptionResponse && typeof exceptionResponse === 'object' && 'message' in exceptionResponse
                ? (exceptionResponse as any).message
                : (exception instanceof Error ? exception.message : 'Internal Server Error');

        if (httpStatus === HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(`[Unhandled Exception] ${message}`, exception instanceof Error ? exception.stack : '');
        } else {
            this.logger.warn(`[HTTP ${httpStatus}] ${Array.isArray(message) ? message.join(', ') : message}`);
        }

        // Định dạng JSON trả về cho Frontend
        const responseBody = {
            statusCode: httpStatus,
            timestamp: new Date().toISOString(),
            path: httpAdapter.getRequestUrl(ctx.getRequest()),
            message: message, // Mảng (nếu lọt class-validator) hoặc chuỗi báo lỗi
        };

        // Trả response
        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
}
