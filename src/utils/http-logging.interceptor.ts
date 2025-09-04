import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IUserRequest } from 'src/types/express';
import { CustomLoggerService } from './logger.service';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: CustomLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<IUserRequest>();
    const response = context.switchToHttp().getResponse<Response>();
    const startTime = Date.now();

    // Log the incoming request
    this.logger.info(
      'Incoming HTTP Request',
      {
        method: request.method,
        url: request.url,
        userAgent: request.headers['user-agent'] as string,
        ip: request.ip || request.connection?.remoteAddress,
        userId: request?.user && request.user.id,
        userRole: request?.user && request.user.role,
      },
      'HTTP',
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const endTime = Date.now();
          const responseTime = endTime - startTime;

          // Log successful response
          this.logger.info(
            'HTTP Request Completed',
            {
              method: request.method,
              url: request.url,
              statusCode: response.status,
              responseTime,
              userId: request?.user && request.user.id,
              userRole: request?.user && request.user.role,
            },
            'HTTP',
          );
        },
        error: (error: HttpException) => {
          const endTime = Date.now();
          const responseTime = endTime - startTime;

          // Log error response
          this.logger.errorWithMeta(
            'HTTP Request Failed',
            error as Error,
            {
              method: request.method,
              url: request.url,
              statusCode: error.getStatus() || 500,
              responseTime,
              userId: request?.user && request.user.id,
              userRole: request?.user && request.user.role,
              error: error.message,
              stack: error.stack,
            },
            'HTTP',
          );
        },
      }),
    );
  }
}
