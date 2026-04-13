import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback_secret',
        });
    }

    async validate(payload: any) {
        // Trả về object chứa thông tin cơ bản. 
        // Lưu ý: @GetUser sẽ lấy object này từ req.user
        return { 
            id: payload.userId, 
            role: payload.role,
            email: payload.email // Thêm email nếu cần
        };
    }
}
