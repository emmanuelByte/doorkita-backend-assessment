import { HttpException, HttpStatus } from '@nestjs/common';

export class ResourceNotFoundException extends HttpException {
  constructor(resource: string, id?: string | number) {
    const message = id
      ? `${resource} with ID ${id} not found`
      : `${resource} not found`;
    super(message, HttpStatus.NOT_FOUND);
  }
}

export class DuplicateResourceException extends HttpException {
  constructor(resource: string, field: string, value: string) {
    const message = `${resource} with ${field} '${value}' already exists`;
    super(message, HttpStatus.CONFLICT);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message: string = 'Unauthorized access') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: string = 'Access forbidden') {
    super(message, HttpStatus.FORBIDDEN);
  }
}

export class ValidationException extends HttpException {
  constructor(message: string = 'Validation failed', errors?: string[]) {
    super(
      {
        message,
        errors,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class BusinessLogicException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(message, statusCode);
  }
}
