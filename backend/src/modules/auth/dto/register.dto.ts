import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
    @IsNotEmpty({message:'Tên không được để trống'})
    @IsString()
    @MaxLength(50, { message: 'Tên quá dài, tối đa 50 ký tự' })
    // Cắt khoảng trắng 2 đầu để DB luôn sạch sẽ
    @Transform(({ value }) => value?.trim())
    name: string;

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
    // Ép buộc: Ít nhất 1 chữ hoa, 1 chữ thường, 1 số
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, { 
        message: 'Mật khẩu quá yếu! Vui lòng bao gồm chữ hoa, chữ thường và số.' 
    })
    password: string;
}
