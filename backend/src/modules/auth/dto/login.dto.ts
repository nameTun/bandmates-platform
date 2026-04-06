import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
    @IsNotEmpty({ message: 'Email không được để trống' })
        @IsEmail({}, { message: 'Email không đúng định dạng' })
        @MaxLength(255)
        // Cắt khoảng trắng và đưa hết về chữ thường (nguyenvana@gmail.com)
        @Transform(({ value }) => value?.trim().toLowerCase())
        email: string;

    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
        @IsString()
        @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
        @MaxLength(32, { message: 'Mật khẩu không được vượt quá 32 ký tự' })
    password: string;
}
