import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSource } from 'config/db.config';
import { PostgresConnectionCredentialsOptions } from 'typeorm/driver/postgres/PostgresConnectionCredentialsOptions.js';

import { AnalysisModule } from './analysis/analysis.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { OtpModule } from './otp/otp.module';
import { RedisModule } from './redis/redis.module';
import { UsersModule } from './users/users.module';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...(dataSource.options as PostgresConnectionCredentialsOptions),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'defaultSecret',
      signOptions: { expiresIn: '60m' },
    }),
    ScheduleModule.forRoot(),
    UsersModule,
    AuthModule,
    EmailModule,
    AnalysisModule,
    RedisModule,
    OtpModule,
  ],
})
export class AppModule {}
