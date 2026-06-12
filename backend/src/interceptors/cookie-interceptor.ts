import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { COOKIE_NAMES, COOKIE_OPTIONS } from '../common/cookie';

@Injectable()
export class CookieInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();
    return next.handle().pipe(
      map((result) => {
        const accessToken = response.locals?.accessToken;
        const refreshToken = response.locals?.refreshToken;
        const verificationEmail = response.locals?.verificationEmail;
        if (accessToken)
          response.cookie(
            COOKIE_NAMES.ACCESS_TOKEN,
            accessToken,
            COOKIE_OPTIONS.ACCESS,
          );

        if (refreshToken)
          response.cookie(
            COOKIE_NAMES.REFRESH_TOKEN,
            refreshToken,
            COOKIE_OPTIONS.REFRESH,
          );
        if (verificationEmail)
          response.cookie(
            COOKIE_NAMES.VERIFICATION_EMAIL,
            verificationEmail,
            COOKIE_OPTIONS.VERIFICATION_EMAIL,
          );

        return result;
      }),
    );
  }
}
