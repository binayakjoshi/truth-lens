import { config } from 'dotenv';
import { User } from 'src/users/entities/user.entity';
import { DataSource, LoggerOptions } from 'typeorm';

import { CustomNamingStrategy } from './strategy';

config();

const isDev = process.env.ENVIRONMENT === 'development';

const loggingOptions: LoggerOptions = isDev
  ? ['error', 'warn']
  : ['error', 'warn', 'query'];

export const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: false,
  logging: loggingOptions,
  logger: 'advanced-console',
  migrations: ['dist/src/database/migrations/**/*.js'],
  migrationsRun: false,
  namingStrategy: new CustomNamingStrategy(),
  entities: [User],
});
