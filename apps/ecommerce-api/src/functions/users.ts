import { APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';
import { connectDB } from '@packages/db';
import { catchErrors } from '@packages/middlewares';
import { HTTP_STATUS } from '@packages/constants';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from '@controllers';

export const handler: APIGatewayProxyHandler = catchErrors(async (event: APIGatewayProxyEvent) => {
  await connectDB();

  // Route based on the path and method
  const { path = '', httpMethod, pathParameters } = event;
  const userIdPattern = /^\/users\/.+$/;

  switch (true) {
    case path === '/users' && httpMethod === 'GET':
      return getAllUsers(event);
    case path === '/users' && httpMethod === 'POST':
      return createUser(event);
    case userIdPattern.test(path) && httpMethod === 'GET' && Boolean(pathParameters?.id):
      return getUserById(event);
    case userIdPattern.test(path) && httpMethod === 'PUT' && Boolean(pathParameters?.id):
      return updateUser(event);
    case userIdPattern.test(path) && httpMethod === 'DELETE' && Boolean(pathParameters?.id):
      return deleteUser(event);
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
