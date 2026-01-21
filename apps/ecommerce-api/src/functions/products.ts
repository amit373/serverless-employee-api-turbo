import { APIGatewayProxyHandler, APIGatewayProxyEvent } from 'aws-lambda';
import { connectDB } from '@packages/db';
import { catchErrors } from '@packages/middlewares';
import { HTTP_STATUS } from '@packages/constants';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from '@controllers';

export const handler: APIGatewayProxyHandler = catchErrors(async (event: APIGatewayProxyEvent) => {
  await connectDB();

  // Route based on the path and method
  const { path = '', httpMethod, pathParameters } = event;
  const productIdPattern = /^\/products\/.+$/;

  switch (true) {
    case path === '/products' && httpMethod === 'GET':
      return getAllProducts(event);
    case path === '/products' && httpMethod === 'POST':
      return createProduct(event);
    case productIdPattern.test(path) && httpMethod === 'GET' && Boolean(pathParameters?.id):
      return getProductById(event);
    case productIdPattern.test(path) && httpMethod === 'PUT' && Boolean(pathParameters?.id):
      return updateProduct(event);
    case productIdPattern.test(path) && httpMethod === 'DELETE' && Boolean(pathParameters?.id):
      return deleteProduct(event);
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
