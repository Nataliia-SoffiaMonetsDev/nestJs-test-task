import { createValidationPipe } from './validation.pipe';
import { ValidationPipe, ValidationError } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';

describe('Validation Pipe', () => {
    let validationPipe: ValidationPipe;

    beforeEach(() => {
        validationPipe = createValidationPipe();
    });

    it('should be defined', () => {
        expect(validationPipe).toBeDefined();
    });

    it('should throw a BadRequestException with a provided message', () => {
        const validationErrors: ValidationError[] = [
            {
                property: 'name',
                constraints: {
                    IsString: 'Name must be a string',
                    Length: 'Name must contain between 4 and 10 characters'
                },
            },
            {
                property: 'description',
                constraints: {
                    IsString: 'Description must be a string',
                    Length: 'Description must contain between 4 and 10 characters'
                },
            },
        ];

        try {
            validationPipe['exceptionFactory'](validationErrors);
        } catch (error) {
            expect(error).toBeInstanceOf(BadRequestException);
            expect(error.message).toEqual('Name must be a string, Name must contain between 4 and 10 characters, Description must be a string, Description must contain between 4 and 10 characters');
        }
    });

    it('should throw a BadRequestException with a default message', () => {
        const validationErrors: ValidationError[] = [];

        try {
            validationPipe['exceptionFactory'](validationErrors);
        } catch (error) {
            expect(error).toBeInstanceOf(BadRequestException);
            expect(error.message).toEqual('Validation failed');
        }
    });
    
});
