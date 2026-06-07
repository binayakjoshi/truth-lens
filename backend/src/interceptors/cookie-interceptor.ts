import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const isDev = process.env.NODE_ENV !== 'production';

const COOKIE_OPTIONS = {
  ACCESS: {
    httpOnly: true,
    sameSite: isDev ? ('lax' as const) : ('none' as const),
    secure: !isDev,
    maxAge: 15 * 60 * 1000,
    path: '/',
  },
  REFRESH: {
    httpOnly: true,
    sameSite: isDev ? ('lax' as const) : ('none' as const),
    secure: !isDev,

    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  },
};

@Injectable()
export class CookieInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((result) => {
        const accessToken = response.locals?.accessToken;
        const refreshToken = response.locals?.refreshToken;

        if (accessToken) {
          response.cookie(
            'truth-access-token',
            accessToken,
            COOKIE_OPTIONS.ACCESS,
          );
        }

        if (refreshToken) {
          response.cookie(
            'truth-refresh-token',
            refreshToken,
            COOKIE_OPTIONS.REFRESH,
          );
        }

        return result;
      }),
    );
  }
}
