import { HTTP_STATUS, HTTP_MESSAGES, ERROR_CODES } from "@packages/constants";

export abstract class CustomError extends Error {
  abstract statusCode: number;
  abstract errorCode: string;

  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
  }

  toJSON() {
    return {
      message: this.message,
      statusCode: this.statusCode,
      errorCode: this.errorCode,
    };
  }
}

export class BadRequestException extends CustomError {
  statusCode = HTTP_STATUS.BAD_REQUEST;
  errorCode = ERROR_CODES.VALIDATION_ERROR;

  constructor(message: string = HTTP_MESSAGES.BAD_REQUEST) {
    super(message);
    Object.setPrototypeOf(this, BadRequestException.prototype);
  }
}

export class UnauthorizedException extends CustomError {
  statusCode = HTTP_STATUS.UNAUTHORIZED;
  errorCode = ERROR_CODES.AUTH_ERROR;

  constructor(message: string = HTTP_MESSAGES.UNAUTHORIZED) {
    super(message);
    Object.setPrototypeOf(this, UnauthorizedException.prototype);
  }
}

export class ForbiddenException extends CustomError {
  statusCode = HTTP_STATUS.FORBIDDEN;
  errorCode = ERROR_CODES.AUTH_ERROR;

  constructor(message: string = HTTP_MESSAGES.FORBIDDEN) {
    super(message);
    Object.setPrototypeOf(this, ForbiddenException.prototype);
  }
}

export class NotFoundException extends CustomError {
  statusCode = HTTP_STATUS.NOT_FOUND;
  errorCode = ERROR_CODES.BUSINESS_ERROR;

  constructor(message: string = HTTP_MESSAGES.NOT_FOUND) {
    super(message);
    Object.setPrototypeOf(this, NotFoundException.prototype);
  }
}

export class ConflictException extends CustomError {
  statusCode = HTTP_STATUS.CONFLICT;
  errorCode = ERROR_CODES.BUSINESS_ERROR;

  constructor(message: string = HTTP_MESSAGES.CONFLICT) {
    super(message);
    Object.setPrototypeOf(this, ConflictException.prototype);
  }
}

export class UnprocessableEntityException extends CustomError {
  statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
  errorCode = ERROR_CODES.VALIDATION_ERROR;

  constructor(message: string = HTTP_MESSAGES.UNPROCESSABLE_ENTITY) {
    super(message);
    Object.setPrototypeOf(this, UnprocessableEntityException.prototype);
  }
}

export class InternalServerErrorException extends CustomError {
  statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  errorCode = ERROR_CODES.DATABASE_ERROR;

  constructor(message: string = HTTP_MESSAGES.INTERNAL_SERVER_ERROR) {
    super(message);
    Object.setPrototypeOf(this, InternalServerErrorException.prototype);
  }
}
