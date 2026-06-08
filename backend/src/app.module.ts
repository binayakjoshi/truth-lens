import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSource } from 'config/db.config';
import { PostgresConnectionCredentialsOptions } from 'typeorm/driver/postgres/PostgresConnectionCredentialsOptions.js';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
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
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
