import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

export const setCookies = (config: ConfigService, res: Response, refreshToken: string) => {
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: config.get<string>('NODE_ENV') === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};

export const clearCookie = (config: ConfigService, res: Response) => {
    res.clearCookie('refreshToken');
};
