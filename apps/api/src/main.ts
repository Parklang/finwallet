// ============================================================
// FinWallet — Main Entry Point
// Section 2: Backend Architecture
// ============================================================
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('FinWallet');
  const app = await NestFactory.create(AppModule);

  // CORS (Section 5 — Security)
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global Validation Pipe (Section 5 — Security)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global Prefix
  app.setGlobalPrefix('api/v1');

  // Swagger Docs (Section 7 — DevOps)
  const config = new DocumentBuilder()
    .setTitle('FinWallet API')
    .setDescription('Personal Finance & E-Wallet Management System — REST API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.log(`🚀 FinWallet API running on: http://localhost:${port}/api/v1`);
  logger.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();
