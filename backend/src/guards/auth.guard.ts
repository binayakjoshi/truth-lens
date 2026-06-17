import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const accessToken = request.cookies['truth-access-token'];

    if (!accessToken) {
      throw new UnauthorizedException('Access token not found.');
    }

    try {
      const decodedData = this.jwtService.verify(accessToken, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.userRepo.findOne({
        where: { id: decodedData.id },
      });

      if (!user || user.deletedAt) {
        const cookieOptions = {
          httpOnly: true,
          secure: true,
          sameSite: 'lax' as const,
        };

        response.clearCookie('truth-access-token', cookieOptions);
        response.clearCookie('truth-refresh-token', cookieOptions);

        throw new UnauthorizedException('User account no longer exists.');
      }

      request.user = {
        id: decodedData.id,
        email: decodedData.email,
        username: decodedData.username,
      };

      return true;
    } catch (err) {
      if (err?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Expired access token.');
      }

      throw new UnauthorizedException('Invalid access token.');
    }
  }
}
