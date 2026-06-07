import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { COOKIE_NAMES, COOKIE_OPTIONS } from 'src/common/cookie';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const refreshToken = request.cookies?.['truth-refresh-token'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found.');
    }

    try {
      const decodedData = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      });

      const user = await this.userRepo.findOne({
        where: {
          id: decodedData.id,
          isDeleted: false,
        },
      });

      if (!user) {
        response.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, COOKIE_OPTIONS.ACCESS);
        response.clearCookie(
          COOKIE_NAMES.REFRESH_TOKEN,
          COOKIE_OPTIONS.REFRESH,
        );

        throw new UnauthorizedException('User account no longer exists.');
      }

      request.user = {
        id: user.id,
        email: user.email,
        username: user.username,
      };

      request.refreshToken = refreshToken;

      return true;
    } catch (err) {
      response.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, COOKIE_OPTIONS.ACCESS);
      response.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, COOKIE_OPTIONS.REFRESH);

      if (err?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token expired.');
      }

      throw new UnauthorizedException('Invalid refresh token.');
    }
  }
}
