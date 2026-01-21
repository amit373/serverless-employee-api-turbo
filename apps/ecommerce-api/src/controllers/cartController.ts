import { APIGatewayProxyEvent } from 'aws-lambda';
import { formatJSONResponse } from '@packages/middlewares';
import { validateBody, validateParams } from '@packages/middlewares';
import { addToCartSchema, updateCartSchema, idParamSchema } from '@packages/validators';
import { HTTP_STATUS } from '@packages/constants';
import { cartService } from '@services';

export const getCart = async (event: APIGatewayProxyEvent) => {
  // Extract userId from the authenticated token (would be set by auth middleware)
  const userId = event.requestContext.authorizer?.principalId;
  
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  const cart = await cartService.getCart(userId);
  
  return formatJSONResponse({ cart }, HTTP_STATUS.OK);
};

export const addToCart = async (event: APIGatewayProxyEvent) => {
  // Extract userId from the authenticated token (would be set by auth middleware)
  const userId = event.requestContext.authorizer?.principalId;
  
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  const body = validateBody(addToCartSchema)(event);
  const cart = await cartService.addToCart(userId, body.productId, body.quantity);
  
  return formatJSONResponse({ cart }, HTTP_STATUS.OK);
};

export const updateCartItem = async (event: APIGatewayProxyEvent) => {
  // Extract userId from the authenticated token (would be set by auth middleware)
  const userId = event.requestContext.authorizer?.principalId;
  
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  const body = validateBody(updateCartSchema)(event);
  const cart = await cartService.updateCartItem(userId, body.productId, body.quantity);
  
  return formatJSONResponse({ cart }, HTTP_STATUS.OK);
};

export const removeFromCart = async (event: APIGatewayProxyEvent) => {
  // Extract userId from the authenticated token (would be set by auth middleware)
  const userId = event.requestContext.authorizer?.principalId;
  
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  const params = validateParams(idParamSchema)(event);
  const cart = await cartService.removeFromCart(userId, params.id);
  
  return formatJSONResponse({ cart }, HTTP_STATUS.OK);
};

export const clearCart = async (event: APIGatewayProxyEvent) => {
  // Extract userId from the authenticated token (would be set by auth middleware)
  const userId = event.requestContext.authorizer?.principalId;
  
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  await cartService.clearCart(userId);
  
  return formatJSONResponse({ message: 'Cart cleared successfully' }, HTTP_STATUS.OK);
};
