import { APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';
import { connectDB } from '@packages/db';
import { catchErrors } from '@packages/middlewares';
import { HTTP_STATUS } from '@packages/constants';
import { getAllOrders, getOrderById, createOrder, updateOrder, deleteOrder } from '@controllers';

export const handler: APIGatewayProxyHandler = catchErrors(async (event: APIGatewayProxyEvent) => {
  await connectDB();

  // Route based on the path and method
  const { path = '', httpMethod, pathParameters } = event;
  const orderIdPattern = /^\/orders\/.+$/;

  switch (true) {
    case path === '/orders' && httpMethod === 'GET':
      return getAllOrders(event);
    case path === '/orders' && httpMethod === 'POST':
      return createOrder(event);
    case orderIdPattern.test(path) && httpMethod === 'GET' && Boolean(pathParameters?.id):
      return getOrderById(event);
    case orderIdPattern.test(path) && httpMethod === 'PUT' && Boolean(pathParameters?.id):
      return updateOrder(event);
    case orderIdPattern.test(path) && httpMethod === 'DELETE' && Boolean(pathParameters?.id):
      return deleteOrder(event);
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
