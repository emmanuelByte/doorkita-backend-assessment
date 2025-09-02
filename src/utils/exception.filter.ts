import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import { ApiResponse } from './api-response.util';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const path = request.url;
    const method = request.method;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    // Handle different types of exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const responseObj = exceptionResponse as Record<string, unknown>;

        // Check if this is a structured API response (from ValidationPipe)
        if (responseObj.success === false && responseObj.errors) {
          // Return the structured response as-is
          response.status(status).json(responseObj);
          return;
        }

        message = (responseObj.message as string) || exception.message;
      } else {
        message = exception.message;
      }
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Database query failed';

      // Handle unique constraint violations
      if (exception.message.includes('duplicate key')) {
        message = 'Resource already exists';
      }
    } else if (exception instanceof EntityNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = 'Resource not found';
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log the error
    this.logger.error(
      `${method} ${path} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : 'Unknown error',
    );

    // Create structured error response
    const errorResponse = ApiResponse.error({
      message,
      statusCode: status,
      path,
    });

    // Send the response
    response.status(status).json(errorResponse);
  }
}
