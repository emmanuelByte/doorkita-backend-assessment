import { Injectable, LoggerService } from '@nestjs/common';
import { Response } from 'express';
import {
  AuditAction,
  ResourceType,
} from 'src/audit-logs/entities/audit-log.entity';
import { IUserRequest } from 'src/types/express';
import { UserRole } from 'src/users/entities/user.entity';
import { logger } from './logger.config';

@Injectable()
export class CustomLoggerService implements LoggerService {
  log(message: string, context?: string) {
    logger.info({ context }, message);
  }

  error(message: string, trace?: string, context?: string) {
    logger.error({ context, trace }, message);
  }

  warn(message: string, context?: string) {
    logger.warn({ context }, message);
  }

  debug(message: string, context?: string) {
    logger.debug({ context }, message);
  }

  verbose(message: string, context?: string) {
    logger.trace({ context }, message);
  }

  // Additional methods for structured logging
  info(message: string, meta?: Record<string, unknown>, context?: string) {
    logger.info({ context, ...meta }, message);
  }

  warnWithMeta(
    message: string,
    meta?: Record<string, unknown>,
    context?: string,
  ) {
    logger.warn({ context, ...meta }, message);
  }

  errorWithMeta(
    message: string,
    error?: Error,
    meta?: Record<string, unknown>,
    context?: string,
  ) {
    logger.error({ context, err: error, ...meta }, message);
  }

  // HTTP request logging
  logHttpRequest(req: IUserRequest, res: Response, responseTime?: number) {
    logger.info(
      {
        type: 'http',
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseTime,
        userAgent: req.headers['user-agent'] as string,
        ip: req.ip || req.connection?.remoteAddress,
        userId: req.user!.id,
        userRole: req.user!.role,
      },
      'HTTP Request',
    );
  }

  // Audit logging
  logAuditEvent(event: {
    userId: number;
    userRole: UserRole;
    action: AuditAction;
    resourceType: ResourceType;
    resourceId?: string;
    ipAddress?: string;
    userAgent?: string;
    statusCode?: number;
    responseTime?: number;
  }) {
    logger.info(
      {
        type: 'audit',
        ...event,
      },
      'Audit Event',
    );
  }
}
