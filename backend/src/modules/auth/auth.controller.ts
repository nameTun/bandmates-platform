import { Controller, Get, Req, Res, UseGuards, Post, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import type { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';

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
        const tokens = await this.authService.login(req.user);

        // Set Refresh Token as HttpOnly Cookie
        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: false, // Developement environment, set true in prod
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Redirect to Frontend
        return res.redirect(`http://localhost:5173/login?status=success`);
    }

    @Get('facebook')
    @UseGuards(AuthGuard('facebook'))
    async facebookAuth(@Req() req: any) { }

    @Get('facebook/callback')
    @UseGuards(AuthGuard('facebook'))
    async facebookAuthRedirect(@Req() req: any, @Res() res: Response) {
        const tokens = await this.authService.login(req.user);

        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: false, 
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

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

        const tokens = await this.authService.refreshTokens(payload.sub, refreshToken);

        // Rotate Refresh Token
        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return { accessToken: tokens.accessToken };
    }

    @Post('logout')
    @UseGuards(AuthGuard('jwt'))
    async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
        await this.authService.logout(req.user.id);
        res.clearCookie('refreshToken');
        return { message: 'Logged out' };
    }
}
