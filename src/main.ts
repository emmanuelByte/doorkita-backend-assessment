import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './utils/exception.filter';
import { CustomLoggerService } from './utils/logger.service';
import { ValidationPipe } from './utils/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {});

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe(new CustomLoggerService()));

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Doorkita Healthcare API')
    .setDescription('A healthcare platform API for doctors, patients, and labs')
    .setVersion('1.0')
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
