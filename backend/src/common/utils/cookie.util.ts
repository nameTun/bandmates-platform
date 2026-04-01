import { Response } from 'express';

export const setCookies = (res: Response, refreshToken: string) => {
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};

export const clearCookie = (res: Response) => {
    res.clearCookie('refreshToken');
};
