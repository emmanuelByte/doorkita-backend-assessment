import { HttpStatus } from '@nestjs/common';

export interface ValidationError {
  field: string;
  value: string;
  constraints: Record<string, string>;
}

export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ValidationError[];
  statusCode: number;
  timestamp: string;
  path?: string;
}

export interface PaginatedResponse<T = any> extends IApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class ApiResponse {
  /**
   * Create a successful API response
   */
  static success<T = unknown>({
    data,
    message,
    statusCode,
    path = undefined,
  }: {
    data?: T;
    message: string;
    statusCode: number;
    path?: string;
  }): IApiResponse<T> {
    return {
      success: true,
      message,
      data,
      statusCode,
      timestamp: new Date().toISOString(),
      path,
    };
  }

  /**
   * Create an error API response
   */
  static error({
    errors,
    statusCode,
    path,
    message,
  }: {
    errors?: ValidationError[];
    statusCode: number;
    path?: string;
    message: string;
  }): IApiResponse {
    return {
      success: false,
      message,
      errors,
      statusCode,
      timestamp: new Date().toISOString(),
      path,
    };
  }

  /**
   * Create a paginated API response
   */
  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message: string,
    path?: string,
  ): PaginatedResponse<T> {
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message,
      data,
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      path,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Create a created response (201)
   */
  static created<T>({
    data,
    message,
    statusCode = HttpStatus.CREATED,
    path,
  }: {
    data: T;
    message: string;
    statusCode: number;
    path?: string;
  }): IApiResponse<T> {
    return this.success({
      data,
      message,
      statusCode,
      path,
    });
  }

  /**
   * Create a not found response (404)
   */
  static notFound({
    message,
    statusCode = HttpStatus.NOT_FOUND,
    path,
  }: {
    message: string;
    statusCode: number;
    path?: string;
  }): IApiResponse {
    return this.error({
      message,
      statusCode,
      path,
    });
  }

  /**
   * Create an unauthorized response (401)
   */
  static unauthorized({
    message,
    statusCode = HttpStatus.UNAUTHORIZED,
    path,
  }: {
    message: string;
    statusCode: number;
    path?: string;
  }): IApiResponse {
    return this.error({
      message,
      statusCode,
      path,
    });
  }

  /**
   * Create a forbidden response (403)
   */
  static forbidden({
    message,
    statusCode = HttpStatus.FORBIDDEN,
    path,
  }: {
    message: string;
    statusCode: number;
    path?: string;
  }): IApiResponse {
    return this.error({
      message,
      statusCode,
      path,
    });
  }

  /**
   * Create a validation error response (400)
   */
  static validationError({
    errors,
    statusCode = HttpStatus.BAD_REQUEST,
    path,
  }: {
    errors: ValidationError[];
    statusCode: number;
    path?: string;
  }): IApiResponse {
    return this.error({
      errors,
      message:
        errors.length > 0
          ? errors[0].constraints[Object.keys(errors[0].constraints)[0]]
          : 'Validation error',
      statusCode,
      path,
    });
  }

  /**
   * Create an internal server error response (500)
   */
  static internalError({
    message,
    statusCode = HttpStatus.INTERNAL_SERVER_ERROR,
    path,
  }: {
    message: string;
    statusCode: number;
    path?: string;
  }): IApiResponse {
    return this.error({
      message,
      statusCode,
      path,
    });
  }
}
