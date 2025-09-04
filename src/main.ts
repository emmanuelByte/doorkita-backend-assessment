import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { securityConfig } from './config/security.config';
import { GlobalExceptionFilter } from './utils/exception.filter';
import { HttpLoggingInterceptor } from './utils/http-logging.interceptor';
import { CustomLoggerService } from './utils/logger.service';
import { ValidationPipe } from './utils/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {});

  // Security middleware (with CSP disabled for Swagger UI)
  app.use(
    helmet({
      ...securityConfig.helmet,
      contentSecurityPolicy: false, // Disable CSP for Swagger UI compatibility
    }),
  );

  // CORS configuration
  app.enableCors(securityConfig.cors);

  // Rate limiting
  app.use(
    rateLimit({
      windowMs: securityConfig.rateLimit.windowMs,
      max: securityConfig.rateLimit.max,
      message: securityConfig.rateLimit.message,
      standardHeaders: securityConfig.rateLimit.standardHeaders,
      legacyHeaders: securityConfig.rateLimit.legacyHeaders,
    }),
  );

  // Slow down for brute force protection
  app.use(
    slowDown({
      windowMs: securityConfig.slowDown.windowMs,
      delayAfter: securityConfig.slowDown.delayAfter,
      delayMs: () => securityConfig.slowDown.delayMs,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe(new CustomLoggerService()));
  app.useGlobalInterceptors(
    new HttpLoggingInterceptor(new CustomLoggerService()),
  );

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Doorkita Healthcare API')
    .setDescription('A healthcare platform API for doctors, patients, and labs')
    .setVersion('1.0')
    .addServer('http://localhost:3000', 'Local Development')
    .addServer('https://doorkit-assessment.ddns.net', 'Production')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for references
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
