import { Injectable, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    // Tạo cặp Access Token và Refresh Token
    async getTokens(userId: string, email: string) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(
                { sub: userId, email },
                {
                    secret: this.configService.get<string>('JWT_SECRET'),
                    expiresIn: '15m', // Access Token ngắn hạn
                },
            ),
            this.jwtService.signAsync(
                { sub: userId, email },
                {
                    secret: this.configService.get<string>('JWT_REFRESH_SECRET') || this.configService.get<string>('JWT_SECRET'),
                    expiresIn: '7d', // Refresh Token dài hạn
                },
            ),
        ]);

        return {
            accessToken,
            refreshToken,
        };
    }

    // Login: Tạo 2 token và lưu Refresh Token vào DB
    async login(user: User) {
        const tokens = await this.getTokens(user.id, user.email);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        return tokens;
    }

    // Logout: Xóa Refresh Token trong DB
    async logout(userId: string) {
        return this.usersService.update(userId, { currentRefreshToken: null });
    }

    // Refresh Token: Kiểm tra token cũ, revoke nếu cần và cấp mới
    async refreshTokens(userId: string, refreshToken: string) {
        const user = await this.usersService.findOneById(userId);
        if (!user || !user.currentRefreshToken) {
            throw new ForbiddenException('Access Denied');
        }

        // So sánh token gửi lên với token trong DB
        // Ở production nên dùng argon2.verify(user.currentRefreshToken, refreshToken)
        if (refreshToken !== user.currentRefreshToken) {
            throw new ForbiddenException('Access Denied');
        }

        const tokens = await this.getTokens(user.id, user.email);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        return tokens;
    }

    async updateRefreshToken(userId: string, refreshToken: string) {
        // Ở production nên hash token trước khi lưu: const hash = await argon2.hash(refreshToken);
        await this.usersService.update(userId, { currentRefreshToken: refreshToken });
    }

    async validateGoogleUser(details: { email: string; name: string; googleId: string }): Promise<User> {
        const user = await this.usersService.findOneByEmail(details.email);
        if (user) return user;
        return this.usersService.create({
            email: details.email,
            name: details.name,
            googleId: details.googleId,
        });
    }

    async validateFacebookUser(details: { email: string; name: string; facebookId: string }): Promise<User> {
        const user = await this.usersService.findOneByEmail(details.email);
        if (user) {
            // Nếu có user trùng email (vd đã Sign up bằng tay hoặc Google), tự động link tài khoản facebook
            // Lưu ý: Ở đây ta bỏ qua việc update user.facebookId nếu đã có để code ngắn gọn,
            // hoặc lý tưởng là gọi this.usersService.update(...)
            return user;
        }
        return this.usersService.create({
            email: details.email,
            name: details.name,
            facebookId: details.facebookId,
        });
    }
}
