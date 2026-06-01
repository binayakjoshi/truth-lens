import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import { dataSource } from 'config/db.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: [process.env.WEB_URL || ''],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use(cookieParser());
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });
  const port = process.env.PORT ?? 5000;
  try {
    await dataSource.initialize();
    console.log('Database connected successfully.');
  } catch (error) {
    console.log('Could not connect to the database', error);
  }
  app.getHttpAdapter().get('/api/health', (req: any, res: any) => {
    res.status(200).json({ status: 'ok' });
  });

  await app.listen(process.env.PORT ?? 5000);
  console.log(`backend is running on port ${port}.`);
}
bootstrap();
