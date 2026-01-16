import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        configService: ConfigService,
        private authService: AuthService,
    ) {
        // Config super() với các thông tin từ Google OAuth
        super({
            clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
            clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
            callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
            scope: ['email', 'profile'], // Yêu cầu quyền truy cập email và profile cơ bản
        } as any);
    }

    // Hàm validate sẽ được gọi khi Google trả về token thành công
    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        const { displayName, emails, id } = profile;

        // Gọi AuthService để tìm hoặc tạo user mới
        const user = await this.authService.validateGoogleUser({
            email: emails[0].value,
            name: displayName,
            googleId: id,
        });

        // done(null, user) sẽ gán user vào request object (req.user)
        done(null, user);
    }
}
