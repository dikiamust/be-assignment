import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger as LoggerNest, ValidationPipe } from '@nestjs/common';
import { initSwagger } from './config/api-doc/swagger';
import { CorsConfig } from './config/cors/cors';
import { rateLimit } from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(CorsConfig());

  // Apply rate limiting middleware
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const isShowSwagger = process.env.SWAGGER_SHOW_API_SPEC === 'true';
  if (isShowSwagger) {
    initSwagger(app);
  }

  const port = process.env.PORT;
  await app.listen(port);

  const logger = new LoggerNest('bootstrap');

  logger.log(
    `Application is running on: ${await app.getUrl()} | Environment: ${
      process.env.NODE_ENV
    }`,
  );
}
bootstrap();
