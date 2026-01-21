import { APIGatewayProxyEvent } from 'aws-lambda';
import { formatJSONResponse } from '@packages/middlewares';
import { validateBody, validateParams, validateQuery } from '@packages/middlewares';
import { createUserSchema, updateUserSchema, idParamSchema, paginationSchema } from '@packages/validators';
import { HTTP_STATUS } from '@packages/constants';
import { userService } from '@app/services';

export const getAllUsers = async (event: APIGatewayProxyEvent) => {
  const query = validateQuery(paginationSchema)(event);
  const page = query.page || 1;
  const limit = Math.min(query.limit || 10, 100); // Max limit of 100

  const result = await userService.getAllUsers(page, limit);
  
  return formatJSONResponse(result, HTTP_STATUS.OK);
};

export const getUserById = async (event: APIGatewayProxyEvent) => {
  const params = validateParams(idParamSchema)(event);
  const user = await userService.getUserById(params.id);
  
  return formatJSONResponse({ user }, HTTP_STATUS.OK);
};

export const createUser = async (event: APIGatewayProxyEvent) => {
  const body = validateBody(createUserSchema)(event);
  // Filter out undefined values to satisfy exactOptionalPropertyTypes
  const userData: Partial<import('../models/User').IUser> = {
    email: body.email,
    password: body.password,
    firstName: body.firstName,
    lastName: body.lastName,
  };
  if (body.phone) {
    userData.phone = body.phone;
  }
  const user = await userService.createUser(userData);
  
  return formatJSONResponse({ user }, HTTP_STATUS.CREATED);
};

export const updateUser = async (event: APIGatewayProxyEvent) => {
  const params = validateParams(idParamSchema)(event);
  const body = validateBody(updateUserSchema)(event);
  // Filter out undefined values
  const updateData: Partial<import('../models/User').IUser> = {};
  if (body.email !== undefined) updateData.email = body.email;
  if (body.firstName !== undefined) updateData.firstName = body.firstName;
  if (body.lastName !== undefined) updateData.lastName = body.lastName;
  if (body.phone !== undefined) updateData.phone = body.phone;
  const user = await userService.updateUser(params.id, updateData);
  
  return formatJSONResponse({ user }, HTTP_STATUS.OK);
};

export const deleteUser = async (event: APIGatewayProxyEvent) => {
  const params = validateParams(idParamSchema)(event);
  await userService.deleteUser(params.id);
  
  return formatJSONResponse({ message: 'User deleted successfully' }, HTTP_STATUS.OK);
};
