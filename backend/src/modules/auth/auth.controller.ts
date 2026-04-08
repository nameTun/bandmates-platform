import { Controller, Get, Res, UseGuards, Post, UnauthorizedException, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { setCookies, clearCookie } from '../../common/utils/cookie.util';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Cookies } from '../../common/decorators/cookies.decorator';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private jwtService: JwtService
    ) { }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth() { }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@GetUser() user: any, @Res() res: Response) {
        // Login -> Get Tokens
        const { tokens } = await this.authService.login(user);

        // Set Refresh Token as HttpOnly Cookie
        setCookies(res, tokens.refreshToken);

        // Redirect to Frontend
        return res.redirect(`http://localhost:5173/login?status=success`);
    }

    @Get('facebook')
    @UseGuards(AuthGuard('facebook'))
    async facebookAuth() { }

    @Get('facebook/callback')
    @UseGuards(AuthGuard('facebook'))
    async facebookAuthRedirect(@GetUser() user: any, @Res() res: Response) {
        const { tokens } = await this.authService.login(user);

        setCookies(res, tokens.refreshToken);

        return res.redirect(`http://localhost:5173/login?status=success`);
    }

    @Post('refresh')
    async refresh(
        @Cookies('refreshToken') refreshToken: string, 
        @Res({ passthrough: true }) res: Response
    ) {
        if (!refreshToken) {
            throw new UnauthorizedException('No refresh token');
        }

        let payload;
        try {
            payload = this.jwtService.verify(
                refreshToken,
                {
                    secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
                });
        } catch (e) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        if (!payload || !payload.userId) {
            throw new UnauthorizedException('Invalid refresh token payload');
        }

        // 3. Tiến hành cấp lại token mới
        const { tokens, user } = await this.authService.refreshTokens(payload.userId, refreshToken);

        // Rotate Refresh Token
        setCookies(res, tokens.refreshToken);

        return { accessToken: tokens.accessToken, user };
    }

    @Post('logout')
    @UseGuards(AuthGuard('jwt'))
    async logout(@GetUser('id') userId: string, @Res({ passthrough: true }) res: Response) {
        await this.authService.logoutUser(userId);
        clearCookie(res);
        return { message: 'Logged out' };
    }

    @Post('register')
    async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
        const { tokens, user } = await this.authService.registerUser(dto);

        setCookies(res, tokens.refreshToken);

        return { accessToken: tokens.accessToken, user };
    }

    @Post('login')
    async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const { tokens, user } = await this.authService.loginUser(dto);

        setCookies(res, tokens.refreshToken);

        return { accessToken: tokens.accessToken, user };
    }
}
