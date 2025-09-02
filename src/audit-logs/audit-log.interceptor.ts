import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { IUserRequest } from 'src/types/express';
import { AuditLogsService } from './audit-logs.service';
import { AuditAction, ResourceType } from './entities/audit-log.entity';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<IUserRequest>();
    const response = context.switchToHttp().getResponse<Response>();
    const startTime = Date.now();
    const user = request.user!;
    // Extract user information from JWT
    const userId = user?.id;
    const userRole = user?.role;

    // Extract request information
    const method = request.method;
    const url = request.url;

    // Extract IP address and user agent - using Express Request properties
    const ipAddress = request.ip || (request.socket?.remoteAddress as string);
    const userAgent = request.headers['user-agent'] as string;

    // Determine action and resource type from the request
    const { action, resourceType, resourceId } = this.parseRequest(
      method,
      url,
      request.body,
    );

    return next.handle().pipe(
      tap({
        next: (data: unknown) => {
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          const statusCode = response.statusCode;

          // Log the successful request
          this.auditLogsService
            .logUserAction(
              userId,
              userRole,
              action,
              resourceType,
              resourceId,
              `${method} ${url}`,
              { responseData: data } as unknown as object,
              ipAddress,
              userAgent,
              url,
              method,
              statusCode,
              responseTime,
            )
            .catch((error) => {
              console.error('Failed to log audit entry:', error);
            });
        },
        error: (error: HttpException) => {
          const endTime = Date.now();
          const responseTime = endTime - startTime;

          const statusCode = error.getStatus() || 500;
          // Log the failed request
          this.auditLogsService
            .logUserAction(
              userId,
              userRole,
              action,
              resourceType,
              resourceId,
              `${method} ${url} - ERROR: ${error.message}`,
              { error: error.message, stack: error.stack },
              ipAddress,
              userAgent,
              url,
              method,
              statusCode,
              responseTime,
            )
            .catch((logError) => {
              console.error('Failed to log audit entry:', logError);
            });
        },
      }),
    );
  }

  private parseRequest(
    method: string,
    url: string,
    _body: unknown,
  ): { action: AuditAction; resourceType: ResourceType; resourceId?: string } {
    // Parse URL to determine resource type and ID
    const urlParts = url.split('/').filter(Boolean);

    // Default values
    let action = AuditAction.READ;
    let resourceType = ResourceType.AUTH;
    let resourceId: string | undefined;

    // Determine action based on HTTP method
    switch (method) {
      case 'POST':
        action = AuditAction.CREATE;
        break;
      case 'GET':
        action = AuditAction.READ;
        break;
      case 'PATCH':
      case 'PUT':
        action = AuditAction.UPDATE;
        break;
      case 'DELETE':
        action = AuditAction.DELETE;
        break;
    }

    // Determine resource type and ID from URL
    if (urlParts.includes('auth')) {
      resourceType = ResourceType.AUTH;
      if (urlParts.includes('login')) {
        action = AuditAction.LOGIN;
      } else if (urlParts.includes('register')) {
        action = AuditAction.REGISTER;
      }
    } else if (urlParts.includes('users')) {
      resourceType = ResourceType.USER;
      if (urlParts.length > 1) {
        resourceId = urlParts[1];
      }
    } else if (urlParts.includes('lab-orders')) {
      resourceType = ResourceType.LAB_ORDER;
      if (urlParts.length > 1) {
        resourceId = urlParts[1];
      }
      if (urlParts.includes('assign')) {
        action = AuditAction.ASSIGN;
      }
    } else if (urlParts.includes('results')) {
      resourceType = ResourceType.RESULT;
      if (urlParts.length > 1) {
        resourceId = urlParts[1];
      }
      if (method === 'POST') {
        action = AuditAction.UPLOAD;
      }
    } else if (urlParts.includes('audit-logs')) {
      resourceType = ResourceType.AUDIT_LOG;
      if (urlParts.length > 1) {
        resourceId = urlParts[1];
      }
    }

    return { action, resourceType, resourceId };
  }
}
