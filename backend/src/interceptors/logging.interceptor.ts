import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    const method = req.method;
    const url = req.originalUrl || req.url;
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.log(`${method} ${url} ${Date.now() - start}ms`);
        },
        error: (err) => {
          this.logger.error(
            `${method} ${url} ${Date.now() - start}ms`,
            err?.stack || err?.message,
          );
        },
      }),
    );
  }
}
