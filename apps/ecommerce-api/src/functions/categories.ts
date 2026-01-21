import { APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';
import { connectDB } from '@packages/db';
import { catchErrors } from '@packages/middlewares';
import { HTTP_STATUS } from '@packages/constants';
import { getAllCategories, createCategory } from '@controllers';

export const handler: APIGatewayProxyHandler = catchErrors(async (event: APIGatewayProxyEvent) => {
  await connectDB();

  // Route based on the path and method
  const { path, httpMethod } = event;

  switch (true) {
    case path === '/categories' && httpMethod === 'GET':
      return getAllCategories(event);
    case path === '/categories' && httpMethod === 'POST':
      return createCategory(event);
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
