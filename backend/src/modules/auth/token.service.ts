import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TokenService {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}

    async getTokens(user: User) {
        // Access Token Payload: Minimal info, relies on explicit user object
        const accessTokenPayload = {
            sub: user.id,
            role: user.role, // Included if role-based access is implemented on UI
        };

        // Refresh Token Payload: Minimal info for security
        const refreshTokenPayload = {
            sub: user.id, role: user.role
        };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(accessTokenPayload, {
                secret: this.configService.get<string>('JWT_SECRET'),
                expiresIn: '15m',
            }),
            this.jwtService.signAsync(refreshTokenPayload, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                expiresIn: '7d',
            }),
        ]);

        return {
            accessToken,
            refreshToken,
        };
    }
}
