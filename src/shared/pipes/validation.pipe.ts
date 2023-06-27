import { ValidationPipe, ValidationError, BadRequestException } from '@nestjs/common';

export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    exceptionFactory: (validationErrors: ValidationError[] = []) => {
      return new BadRequestException(
        validationErrors.map((error) => Object.values(error.constraints).join(', '))
      );
    },
  });
}