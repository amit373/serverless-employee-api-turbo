import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { ZodSchema } from 'zod';
import { BadRequestException } from '@packages/errors';
import { logger } from '@packages/logger';

export interface ValidatedEventAPIGatewayProxyEvent<T> extends Omit<APIGatewayProxyEvent, 'body'> {
  body: T;
}

export type ValidatedEventAPIGatewayProxyHandler<T, R> = (
  event: ValidatedEventAPIGatewayProxyEvent<T>,
  context: Context
) => Promise<APIGatewayProxyResult & R>;

export const formatJSONResponse = (response: any, statusCode: number = 200) => {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(response),
  };
};

export const formatErrorResponse = (error: any) => {
  logger.error('Error in API handler:', error);
  
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  const errorCode = error.errorCode || 'INTERNAL_ERROR';

  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      errorCode,
      statusCode,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    }),
  };
};

export const validateBody = <T>(schema: ZodSchema<T>) => {
  return (event: APIGatewayProxyEvent) => {
    try {
      const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
      return schema.parse(body);
    } catch (error: any) {
      if (error?.name === 'ZodError') {
        throw new BadRequestException(`Validation error: ${error.errors.map((e: any) => e.message).join(', ')}`);
      }
      throw new BadRequestException('Invalid request body');
    }
  };
};

export const validateQuery = <T>(schema: ZodSchema<T>) => {
  return (event: APIGatewayProxyEvent) => {
    try {
      return schema.parse(event.queryStringParameters || {});
    } catch (error: any) {
      if (error?.name === 'ZodError') {
        throw new BadRequestException(`Validation error: ${error.errors.map((e: any) => e.message).join(', ')}`);
      }
      throw new BadRequestException('Invalid query parameters');
    }
  };
};

export const validateParams = <T>(schema: ZodSchema<T>) => {
  return (event: APIGatewayProxyEvent) => {
    try {
      return schema.parse(event.pathParameters || {});
    } catch (error: any) {
      if (error?.name === 'ZodError') {
        throw new BadRequestException(`Validation error: ${error.errors.map((e: any) => e.message).join(', ')}`);
      }
      throw new BadRequestException('Invalid path parameters');
    }
  };
};

export const catchErrors = (handler: Function) => {
  return async (event: APIGatewayProxyEvent, context: Context) => {
    try {
      return await handler(event, context);
    } catch (error) {
      return formatErrorResponse(error);
    }
  };
};
