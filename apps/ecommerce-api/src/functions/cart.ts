import { APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';
import { connectDB } from '@packages/db';
import { catchErrors } from '@packages/middlewares';
import { HTTP_STATUS } from '@packages/constants';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '@controllers';

export const handler: APIGatewayProxyHandler = catchErrors(async (event: APIGatewayProxyEvent) => {
  await connectDB();

  // Route based on the path and method
  const { path = '', httpMethod, pathParameters } = event;
  const cartItemPattern = /^\/cart\/.+$/;

  switch (true) {
    case path === '/cart' && httpMethod === 'GET':
      return getCart(event);
    case path === '/cart' && httpMethod === 'POST':
      return addToCart(event);
    case path === '/cart' && httpMethod === 'PUT':
      return updateCartItem(event);
    case cartItemPattern.test(path) && httpMethod === 'DELETE' && Boolean(pathParameters?.id):
      return removeFromCart(event);
    case path === '/cart/clear' && httpMethod === 'POST':
      return clearCart(event);
    default:
      return {
        statusCode: HTTP_STATUS.NOT_FOUND,
        body: JSON.stringify({ message: 'Route not found' }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      };
  }
});
