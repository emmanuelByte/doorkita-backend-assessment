import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { ApiResponse } from './api-response.util';
import { CustomLoggerService } from './logger.service';

// Priority order for validation decorators (highest to lowest)
const VALIDATION_PRIORITY = [
  'isNotEmpty',
  'isString',
  'isNumber',
  'isBoolean',
  'isEnum',
  'isDate',
  'isOptional',
  'isEmail',
  'minLength',
  'maxLength',
];

@Injectable()
export class ValidationPipe implements PipeTransform<unknown, unknown> {
  constructor(private readonly logger: CustomLoggerService) {}

  async transform(value: unknown, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value) as object;
    const errors = await validate(object);

    if (errors.length > 0) {
      const validationErrors = errors.map((error) => {
        const constraints = error.constraints as Record<string, string>;

        // Sort constraints based on priority order
        const sortedConstraints: Record<string, string> = {};
        const constraintKeys = Object.keys(constraints);

        // Sort constraint keys based on priority
        const sortedKeys = constraintKeys.sort((a, b) => {
          const aIndex = VALIDATION_PRIORITY.indexOf(a);
          const bIndex = VALIDATION_PRIORITY.indexOf(b);

          // If both are in priority list, sort by index
          if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
          }

          // If only one is in priority list, prioritize it
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;

          // If neither is in priority list, maintain original order
          return 0;
        });

        // Build sorted constraints object
        sortedKeys.forEach((key) => {
          sortedConstraints[key] = constraints[key];
        });

        return {
          field: error.property,
          value: error.value as string,
          constraints: sortedConstraints,
        };
      });

      // const errorMessage = 'Validation failed';

      // // Log validation errors for debugging
      // this.logger.errorWithMeta(
      //   errorMessage,
      //   undefined,
      //   { validationErrors },
      //   'ValidationPipe',
      // );

      throw new BadRequestException(
        ApiResponse.validationError({
          errors: validationErrors,
          statusCode: 400,
          path: '/auth/register',
        }),
      );
    }

    return object;
  }

  private toValidate(metatype: any): boolean {
    const types = [
      String,
      Boolean,
      Number,
      Array,
      Object,
      Function as unknown as any,
    ];
    return !types.includes(metatype);
  }
}
