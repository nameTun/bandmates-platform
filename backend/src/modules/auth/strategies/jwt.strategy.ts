/**
 * Strategy xử lý xác thực Access Token (JWT) cho các yêu cầu API.
 * 
 * Passport sẽ tự động trích xuất Bearer Token từ Header, giải mã bằng Secret Key 
 * và gọi hàm `validate` nếu Token hợp lệ và còn hạn.
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        configService: ConfigService,
        private usersService: UsersService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'secret',
        });
    }

    async validate(payload: any) {
        // Đây là "ngòi nổ" để chặn người dùng ngay lập tức
        const user = await this.usersService.findUserById(payload.userId);
        
        if (!user || !user.isActive) {
            throw new UnauthorizedException('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
        }

        return {
            id: user.id,
            role: user.role,
            email: user.email
        };
    }
}
