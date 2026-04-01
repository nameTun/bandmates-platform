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
        // Payload là nội dung đã decoded từ JWT token.
        // Chúng ta trả về object user để NestJS gắn vào request object (req.user).
        return { id: payload.userId, email: payload.email, googleId: payload.googleId };
    }
}
