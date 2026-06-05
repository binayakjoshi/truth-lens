import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.cookies['truth-access-token'];

    if (!accessToken)
      throw new UnauthorizedException('Access token not found.');

    try {
      const payload: any = this.jwtService.verify(accessToken, {
        secret: process.env.JWT_SECRET,
      });

      request.user = {
        id: payload.id,
        role: payload.role,
        tenantId: payload.tenantId,
      };
      return true;
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Expired access token.');
      }
      throw new UnauthorizedException('Invalid access token.');
    }
  }
}
