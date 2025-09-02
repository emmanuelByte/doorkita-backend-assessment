// API Response utilities
export type {
  IApiResponse as ApiResponse,
  IApiResponse as ApiResponseUtil,
  PaginatedResponse,
  ValidationError,
} from './api-response.util';

// Exception handling
export { GlobalExceptionFilter } from './exception.filter';
export { ValidationPipe } from './validation.pipe';

// Custom exceptions
export {
  BusinessLogicException,
  DuplicateResourceException,
  ForbiddenException,
  ResourceNotFoundException,
  UnauthorizedException,
  ValidationException,
} from './exceptions';

// Logging utilities
export { HttpLoggingInterceptor } from './http-logging.interceptor';
export { logger, loggerConfig } from './logger.config';
export { CustomLoggerService } from './logger.service';

// Role-based access control
export { ROLES_KEY, UseRoles } from './roles.decorator';
export { RolesGuard } from './roles.guard';
