import { APIGatewayProxyEvent } from 'aws-lambda';
import { formatJSONResponse } from '@packages/middlewares';
import { validateBody } from '@packages/middlewares';
import { loginSchema, createUserSchema } from '@packages/validators';
import { IUser } from '../models/User';
import authService from '../services/authService';

export const login = async (event: APIGatewayProxyEvent) => {
  const body = validateBody(loginSchema)(event);
  const result = await authService.login(body.email, body.password);
  
  return formatJSONResponse(result, 200);
};

export const register = async (event: APIGatewayProxyEvent) => {
  const body = validateBody(createUserSchema)(event);
  // Filter out undefined values to satisfy exactOptionalPropertyTypes
  const userData: Partial<IUser> = {
    email: body.email,
    password: body.password,
    firstName: body.firstName,
    lastName: body.lastName,
  };
  if (body.phone) {
    userData.phone = body.phone;
  }
  const user = await authService.register(userData);
  
  return formatJSONResponse({ user }, 201);
};

export const logout = async (event: APIGatewayProxyEvent) => {
  // Extract user ID from token
  const userId = event.requestContext.authorizer?.principalId;
  
  if (!userId) {
    // Try to extract from Authorization header if not in authorizer
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { verifyToken } = await import('@packages/utils');
      try {
        const decoded = verifyToken(token, process.env.JWT_SECRET!);
        const extractedUserId = decoded.userId;
        if (extractedUserId) {
          await authService.logout(extractedUserId);
          return formatJSONResponse({ message: 'Logged out successfully' }, 200);
        }
      } catch {
        // Token invalid, but still return success for logout
      }
    }
    throw new Error('User not authenticated');
  }
  
  await authService.logout(userId);
  
  return formatJSONResponse({ message: 'Logged out successfully' }, 200);
};
