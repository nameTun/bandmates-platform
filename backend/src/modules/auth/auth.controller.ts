import { Controller, Get, Req, Res, UseGuards, Post, UnauthorizedException, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import type { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { setAuthCookies, clearAuthCookies } from '../../common/utils/cookie.util';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private jwtService: JwtService
    ) { }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req: any) { }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
        // Login -> Get Tokens
        const { tokens } = await this.authService.login(req.user);

        // Set Refresh Token as HttpOnly Cookie
        setAuthCookies(res, tokens.refreshToken);

        // Redirect to Frontend
        return res.redirect(`http://localhost:5173/login?status=success`);
    }

    @Get('facebook')
    @UseGuards(AuthGuard('facebook'))
    async facebookAuth(@Req() req: any) { }

    @Get('facebook/callback')
    @UseGuards(AuthGuard('facebook'))
    async facebookAuthRedirect(@Req() req: any, @Res() res: Response) {
        const { tokens } = await this.authService.login(req.user);

        setAuthCookies(res, tokens.refreshToken);

        return res.redirect(`http://localhost:5173/login?status=success`);
    }

    @Post('refresh')
    async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies['refreshToken'];
        if (!refreshToken) {
            throw new UnauthorizedException('No refresh token');
        }

        let payload;
        try {
            payload = this.jwtService.verify(refreshToken, { secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET });
        } catch (e) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const { tokens, user } = await this.authService.refreshTokens(payload.sub, refreshToken);

        // Rotate Refresh Token
        setAuthCookies(res, tokens.refreshToken);

        return { accessToken: tokens.accessToken, user };
    }

    @Post('logout')
    @UseGuards(AuthGuard('jwt'))
    async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
        await this.authService.logout(req.user.id);
        clearAuthCookies(res);
        return { message: 'Logged out' };
    }

    @Post('register')
    async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
        const { tokens, user } = await this.authService.registerLocal(dto);

        setAuthCookies(res, tokens.refreshToken);

        return { accessToken: tokens.accessToken, user };
    }

    @Post('login')
    async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const { tokens, user } = await this.authService.loginLocal(dto);

        setAuthCookies(res, tokens.refreshToken);

        return { accessToken: tokens.accessToken, user };
    }
}
