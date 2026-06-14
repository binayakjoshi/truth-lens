import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';

import { User } from '../../users/entities/user.entity';
import { AuthService } from '../services/auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackURL = process.env.GOOGLE_CALLBACK_URL;

    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error(
        'Missing Google OAuth env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL must all be set',
      );
    }

    super({ clientID, clientSecret, callbackURL, scope: ['email', 'profile'] });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Promise<User> {
    const { id, name, emails } = profile;

    if (!emails?.[0]?.value) throw new Error('Google account has no email');
    if (!name?.givenName) throw new Error('Google account has no first name');
    if (!name?.familyName) throw new Error('Google account has no last name');

    return this.authService.findOrCreateGoogleUser({
      googleId: id,
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName ?? '',
    });
  }
}
