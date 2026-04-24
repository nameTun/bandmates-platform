import { Response } from 'express';

export const setCookies = (res: Response, refreshToken: string) => {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction,           // true on production (HTTPS required)
        sameSite: isProduction ? 'none' : 'lax', // 'none' allows cross-site cookies (Vercel ↔ Render)
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};

export const clearCookie = (res: Response) => {
    res.clearCookie('refreshToken');
};
