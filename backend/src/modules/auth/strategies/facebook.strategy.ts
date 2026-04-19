import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
    constructor(
        configService: ConfigService,
        private authService: AuthService,
    ) {
        super({
            clientID: configService.get<string>('FACEBOOK_APP_ID') || 'placeholder_app_id',
            clientSecret: configService.get<string>('FACEBOOK_APP_SECRET') || 'placeholder_app_secret',
            callbackURL: configService.get<string>('FACEBOOK_CALLBACK_URL') || 'http://localhost:3000/auth/facebook/callback',
            scope: 'email',
            profileFields: ['emails', 'name', 'photos'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: Profile, done: (err: any, user: any, info?: any) => void): Promise<any> {
        const { name, emails, id, photos } = profile;
        const displayName = name ? `${name.givenName || ''} ${name.familyName || ''}`.trim() : 'Facebook User';
        
        const user = await this.authService.validateFacebookUser({
            email: emails && emails[0] ? emails[0].value : `${id}@facebook.com`,
            name: displayName,
            facebookId: id,
            avatarUrl: photos && photos[0] ? photos[0].value : undefined,
        });

        done(null, user);
    }
}
