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

        // Chuyển đổi tường minh để tránh mất dữ liệu quan hệ (profile) do cơ chế Instance của TypeORM
        const safeUser = {
            id: user.id,
            email: user.email,
            role: user.role,
            profile: user.profile ? {
                id: user.profile.id,
                displayName: user.profile.displayName,
                isOnboardingCompleted: user.profile.isOnboardingCompleted,
                avatarUrl: user.profile.avatarUrl
            } : null
        };

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
        if (token !== user.refreshToken) {
            throw new ForbiddenException('Không xác thực được người dùng!');
        }

        // Kiểm tra xem người dùng có bị khóa tài khoản hay không
        if (!user.isActive) {
            throw new UnauthorizedException('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
        }

        const tokens = await this.tokenService.getTokens(user);
        await this.updateRefreshToken(user.id, tokens.refreshToken);

        const safeUser = {
            id: user.id,
            email: user.email,
            role: user.role,
            profile: user.profile ? {
                id: user.profile.id,
                displayName: user.profile.displayName,
                isOnboardingCompleted: user.profile.isOnboardingCompleted,
                avatarUrl: user.profile.avatarUrl
            } : null
        };

        return { tokens, user: safeUser };
    }

    async updateRefreshToken(userId: string, refreshToken: string) {
        // Ở production nên hash token trước khi lưu: const hash = await argon2.hash(refreshToken);
        await this.usersService.updateUser(userId, { refreshToken: refreshToken });
    }

    async validateGoogleUser(details: { email: string; name: string; googleId: string; avatarUrl?: string }): Promise<User> {
        const user = await this.usersService.findUserByEmail(details.email);
        
        if (user) {
            // 1. Link Google ID nếu người dùng chưa có
            if (!user.googleId) {
                await this.usersService.updateUser(user.id, { googleId: details.googleId });
                user.googleId = details.googleId;
            }
            // 2. Đồng bộ Avatar nếu người dùng chưa có
            if (!user.profile?.avatarUrl && details.avatarUrl) {
                await this.usersService.updateProfile(user.id, { avatarUrl: details.avatarUrl });
                if (user.profile) user.profile.avatarUrl = details.avatarUrl;
            }

            // Kiểm tra trạng thái hoạt động
            if (!user.isActive) {
                throw new UnauthorizedException('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
            }

            return user;
        }

        return this.usersService.createUser({
            email: details.email,
            name: details.name,
            googleId: details.googleId,
            avatarUrl: details.avatarUrl
        });
    }

    async validateFacebookUser(details: { email: string; name: string; facebookId: string; avatarUrl?: string }): Promise<User> {
        const user = await this.usersService.findUserByEmail(details.email);
        
        if (user) {
            // 1. Link Facebook ID nếu người dùng chưa có
            if (!user.facebookId) {
                await this.usersService.updateUser(user.id, { facebookId: details.facebookId });
                user.facebookId = details.facebookId;
            }
            // 2. Đồng bộ Avatar nếu người dùng chưa có
            if (!user.profile?.avatarUrl && details.avatarUrl) {
                await this.usersService.updateProfile(user.id, { avatarUrl: details.avatarUrl });
                if (user.profile) user.profile.avatarUrl = details.avatarUrl;
            }

            // Kiểm tra trạng thái hoạt động
            if (!user.isActive) {
                throw new UnauthorizedException('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
            }

            return user;
        }

        return this.usersService.createUser({
            email: details.email,
            name: details.name,
            facebookId: details.facebookId,
            avatarUrl: details.avatarUrl
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

        // Kiểm tra trạng thái hoạt động
        if (!user.isActive) {
            throw new UnauthorizedException('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
        }

        const isMatch = await bcrypt.compare(dto.password, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('Email hoặc password không đúng!');
        }

        return this.login(user);
    }
}
