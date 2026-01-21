import { APIGatewayProxyEvent } from 'aws-lambda';
import { formatJSONResponse, validateBody, validateParams, validateQuery } from '@packages/middlewares';
import { createOrderSchema, idParamSchema, paginationSchema } from '@packages/validators';
import { HTTP_STATUS } from '@packages/constants';
import orderService from '../services/orderService';

export const getAllOrders = async (event: APIGatewayProxyEvent) => {
  // Extract userId from the authenticated token (would be set by auth middleware)
  const userId = event.requestContext.authorizer?.principalId;
  
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  const query = validateQuery(paginationSchema)(event);
  const page = query.page || 1;
  const limit = Math.min(query.limit || 10, 100); // Max limit of 100

  const result = await orderService.getAllOrders(userId, page, limit);
  
  return formatJSONResponse(result, HTTP_STATUS.OK);
};

export const getOrderById = async (event: APIGatewayProxyEvent) => {
  const params = validateParams(idParamSchema)(event);
  const order = await orderService.getOrderById(params.id);
  
  return formatJSONResponse({ order }, HTTP_STATUS.OK);
};

export const createOrder = async (event: APIGatewayProxyEvent) => {
  // Extract userId from the authenticated token (would be set by auth middleware)
  const userId = event.requestContext.authorizer?.principalId;
  
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  const body = validateBody(createOrderSchema)(event);
  const order = await orderService.createOrder(userId, body);
  
  return formatJSONResponse({ order }, HTTP_STATUS.CREATED);
};

export const updateOrder = async (event: APIGatewayProxyEvent) => {
  const params = validateParams(idParamSchema)(event);
  const body = validateBody(createOrderSchema)(event); // Using create schema for update as well
  const order = await orderService.updateOrder(params.id, body);
  
  return formatJSONResponse({ order }, HTTP_STATUS.OK);
};

export const deleteOrder = async (event: APIGatewayProxyEvent) => {
  const params = validateParams(idParamSchema)(event);
  await orderService.deleteOrder(params.id);
  
  return formatJSONResponse({ message: 'Order deleted successfully' }, HTTP_STATUS.OK);
};
