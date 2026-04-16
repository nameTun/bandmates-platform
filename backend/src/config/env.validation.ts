import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

/**
 * Định nghĩa các môi trường chạy chính thức của hệ thống.
 */
enum Environment {
    Development = 'development',
    Production = 'production',
    Test = 'test',
}

/**
 * Schema định nghĩa và ràng buộc kiểu dữ liệu cho các biến môi trường (.env).
 */
class EnvironmentVariables {

    @IsEnum(Environment)
    NODE_ENV: Environment;

    @IsNumber()
    PORT: number;

    @IsString()
    DATABASE_HOST: string;

    @IsNumber()
    DATABASE_PORT: number;

    @IsString()
    DATABASE_USER: string;

    @IsString()
    DATABASE_PASSWORD: string;

    @IsString()
    DATABASE_NAME: string;

    @IsString()
    JWT_SECRET: string;
}

/**
 * Hàm thực hiện kiểm tra và ép kiểu các biến môi trường ngay khi khởi động.
 * Chuyển đổi dữ liệu thô (string) sang đối tượng Class (plainToInstance).
 * Thực hiện kiểm tra đồng bộ (validateSync) dựa trên các Decorator đã định nghĩa.
 * Ném lỗi và dừng ứng dụng nếu cấu hình không hợp lệ (Fail-fast).
 * 
 * @param config Bản ghi chứa các biến môi trường thô
 * @returns Đối tượng config đã được xác thực và ép kiểu
 */
export function validate(config: Record<string, unknown>) {
    const validatedConfig = plainToInstance(
        EnvironmentVariables,
        config,
        { enableImplicitConversion: true }, // Tự động convert string sang number khi có Decorator @IsNumber
    );
    const errors = validateSync(validatedConfig, { skipMissingProperties: false });

    if (errors.length > 0) {
        throw new Error(`Cấu hình môi trường không hợp lệ: ${errors.toString()}`);
    }
    return validatedConfig;
}
