import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { OtpRecord } from 'src/users/entities/otp-record.entity';

@Module({
  controllers: [AuthController],
  providers: [AuthService],

  imports: [TypeOrmModule.forFeature([User, OtpRecord])],
})
export class AuthModule {}
