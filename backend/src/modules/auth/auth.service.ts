import { Injectable, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { TokenService } from './token.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private tokenService: TokenService,
    ) { }

    // Login
    async login(user: User) {
        const tokens = await this.tokenService.getTokens(user);
        await this.updateRefreshToken(user.id, tokens.refreshToken);

        // Ensure sensitive fields are never returned to client
        const { password, refreshToken, ...safeUser } = user;
        return { tokens, user: safeUser };
    }

    // Logout: Xóa Refresh Token trong DB
    async logoutUser(userId: string) {
        return this.usersService.updateUser(userId, { refreshToken: null });
    }

    // Refresh Token: Kiểm tra token cũ, revoke nếu cần và cấp mới
    async refreshTokens(userId: string, token: string) {
        // Dùng hàm chuyên dụng để lấy cả cột refreshToken (select: false)
        const user = await this.usersService.findUserByIdWithRefreshToken(userId);
        if (!user || !user.refreshToken) {
            throw new ForbiddenException("Không xác thực được người dùng!");
        }

        // So sánh token gửi lên với token trong DB
        // Ở production nên dùng argon2.verify(user.refreshToken, refreshToken)
        if (token !== user.refreshToken) {
            throw new ForbiddenException('Không xác thực được người dùng!');
        }

        const tokens = await this.tokenService.getTokens(user);
        await this.updateRefreshToken(user.id, tokens.refreshToken);

        const { password, refreshToken, ...safeUser } = user;
        return { tokens, user: safeUser };
    }

    async updateRefreshToken(userId: string, refreshToken: string) {
        // Ở production nên hash token trước khi lưu: const hash = await argon2.hash(refreshToken);
        await this.usersService.updateUser(userId, { refreshToken: refreshToken });
    }

    async validateGoogleUser(details: { email: string; name: string; googleId: string }): Promise<User> {
        const user = await this.usersService.findUserByEmail(details.email);
        if (user) return user;
        return this.usersService.createUser({
            email: details.email,
            name: details.name,
            googleId: details.googleId,
        });
    }

    async validateFacebookUser(details: { email: string; name: string; facebookId: string }): Promise<User> {
        const user = await this.usersService.findUserByEmail(details.email);
        if (user) {
            // Nếu có user trùng email (vd đã Sign up bằng tay hoặc Google), tự động link tài khoản facebook
            // Lưu ý: Ở đây ta bỏ qua việc update user.facebookId nếu đã có để code ngắn gọn,
            // hoặc lý tưởng là gọi this.usersService.update(...)
            return user;
        }
        return this.usersService.createUser({
            email: details.email,
            name: details.name,
            facebookId: details.facebookId,
        });
    }

    async registerUser(dto: RegisterDto) {
        const existingUser = await this.usersService.findUserByEmail(dto.email);
        if (existingUser) {
            throw new ForbiddenException('Email này đã được sử dụng!');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.usersService.createUser({
            email: dto.email,
            name: dto.name,
            password: hashedPassword,
        });

        return this.login(user); // returns { accessToken, refreshToken } and sets refreshToken in DB
    }

    async loginUser(dto: LoginDto) {
        // Need to explicitly request password for verification
        const user = await this.usersService.findUserByEmailWithPassword(dto.email);

        if (!user || !user.password) {
            throw new UnauthorizedException('Email hoặc password không đúng!');
        }

        const isMatch = await bcrypt.compare(dto.password, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('Email hoặc password không đúng!');
        }

        return this.login(user);
    }
}
