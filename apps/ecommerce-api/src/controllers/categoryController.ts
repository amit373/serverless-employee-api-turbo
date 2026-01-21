import { APIGatewayProxyEvent } from 'aws-lambda';
import { formatJSONResponse } from '@packages/middlewares';
import { HTTP_STATUS } from '@packages/constants';
import { ProductModel } from '@models/Product';
import { logger } from '@packages/logger';

export const getAllCategories = async (_event: APIGatewayProxyEvent) => {
  try {
    // Get distinct categories from products
    const categories = await ProductModel.distinct('category', { isActive: true });
    
    return formatJSONResponse({ categories }, HTTP_STATUS.OK);
  } catch (error) {
    logger.error('Get categories error:', error);
    throw error;
  }
};

export const createCategory = async (event: APIGatewayProxyEvent) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { name } = body;

    if (!name || typeof name !== 'string') {
      return formatJSONResponse(
        { message: 'Category name is required' },
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Categories are created implicitly when products are created with that category
    // This endpoint just validates the category name format
    return formatJSONResponse(
      { 
        message: 'Category will be created when a product with this category is added',
        category: name 
      },
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error('Create category error:', error);
    throw error;
  }
};
