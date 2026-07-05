import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { COOKIE_NAMES, COOKIE_OPTIONS } from '../constants/cookie';

@Injectable()
export class CookieInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();
    return next.handle().pipe(
      map((result) => {
        const accessToken = response.locals?.accessToken;
        const refreshToken = response.locals?.refreshToken;

        const verificationToken = response.locals?.verificationToken;
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
        if (verificationToken)
          response.cookie(
            COOKIE_NAMES.VERIFICATION_TOKEN,
            verificationToken,
            COOKIE_OPTIONS.VERIFICATION,
          );
        return result;
      }),
    );
  }
}
