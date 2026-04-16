/**
 * Strategy xử lý xác thực Access Token (JWT) cho các yêu cầu API.
 * 
 * Passport sẽ tự động trích xuất Bearer Token từ Header, giải mã bằng Secret Key 
 * và gọi hàm `validate` nếu Token hợp lệ và còn hạn.
 */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false, // Từ chối Token đã hết hạn
            secretOrKey: configService.get<string>('JWT_SECRET') || 'secret',
        });
    }

    /**
     * Chuyển đổi nội dung Payload đã giải mã thành đối tượng đại diện cho User.
     * @param payload Dữ liệu đã được giải mã từ JWT
     * @returns Đối tượng sẽ được Passport gán vào `req.user`
     */
    async validate(payload: any) {
        return {
            id: payload.userId,
            role: payload.role,
            email: payload.email
        };
    }
}
