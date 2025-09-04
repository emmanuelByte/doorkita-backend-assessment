import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditLogInterceptor } from './audit-logs/audit-log.interceptor';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { AuditLog } from './audit-logs/entities/audit-log.entity';
import { AuthModule } from './auth/auth.module';
import { securityConfig } from './config/security.config';
import { SeederModule } from './database/seeder/seeder.module';
import { LabOrder } from './lab-orders/entities/lab-order.entity';
import { LabOrdersModule } from './lab-orders/lab-orders.module';
import { Result } from './results/entities/result.entity';
import { ResultsModule } from './results/results.module';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { HealthController } from './utils/health.controller';
import { CustomLoggerService } from './utils/logger.service';
import { CustomThrottlerGuard } from './utils/rate-limit.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot(securityConfig.throttler),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST') || 'localhost',
        port: configService.get('DATABASE_PORT') || 5432,
        username: configService.get('DATABASE_USER') || 'postgres',
        password: configService.get('DATABASE_PASSWORD') || 'postgres123',
        database: configService.get('DATABASE_NAME') || 'doorkita_db',
        entities: [User, LabOrder, Result, AuditLog],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') === 'development',
      }),
    }),
    AuthModule,
    UsersModule,
    LabOrdersModule,
    ResultsModule,
    AuditLogsModule,
    SeederModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    CustomLoggerService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}
