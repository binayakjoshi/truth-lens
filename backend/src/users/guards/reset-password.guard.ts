import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { COOKIE_NAMES } from 'src/auth/constants/cookie';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

export class ResetPasswordGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const verificationToken = request.cookies[COOKIE_NAMES.VERIFICATION_TOKEN];

    if (!verificationToken)
      throw new UnauthorizedException('Cannot find verification token');

    try {
      const decodedData = this.jwtService.verify(verificationToken, {
        secret: process.env.JWT_SECRET,
      });
      if (!decodedData)
        throw new UnauthorizedException('Invalid or expired token.');

      const user = await this.userRepo.findOne({
        where: {
          id: decodedData.id,
        },
      });

      if (!user || user.deletedAt) {
        const cookieOptions = {
          httpOnly: true,
          secure: true,
          sameSite: 'lax' as const,
        };

        response.clearCookie(COOKIE_NAMES.VERIFICATION_TOKEN, cookieOptions);

        throw new UnauthorizedException('User account no longer exists.');
      }

      request.user = {
        id: decodedData.id,
        email: decodedData.email,
        username: decodedData.username,
      };

      return true;
    } catch (err) {
      if (err?.name === 'TokenExpiredError')
        throw new UnauthorizedException('Expired  token.');

      throw new UnauthorizedException('Invalid  token.');
    }
  }
}
