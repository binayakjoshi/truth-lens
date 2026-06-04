import { Module } from '@nestjs/common';

import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSource } from 'config/db.config';
import { PostgresConnectionCredentialsOptions } from 'typeorm/driver/postgres/PostgresConnectionCredentialsOptions.js';
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
  ],
})
export class AppModule {}
