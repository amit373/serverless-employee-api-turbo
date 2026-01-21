import { APIGatewayProxyEvent } from 'aws-lambda';
import { formatJSONResponse } from '@packages/middlewares';
import { validateBody, validateParams, validateQuery } from '@packages/middlewares';
import { createProductSchema, updateProductSchema, idParamSchema, productQuerySchema } from '@packages/validators';
import { HTTP_STATUS } from '@packages/constants';
import { productService } from '@services';

export const getAllProducts = async (event: APIGatewayProxyEvent) => {
  // Use type assertion to handle Zod schema type compatibility
  const query = validateQuery(productQuerySchema as any)(event) as { page?: number; limit?: number; category?: string; minPrice?: number; maxPrice?: number; search?: string; sortBy?: string; sortOrder?: string };
  const page = query.page ?? 1;
  const limit = Math.min(query.limit ?? 10, 100); // Max limit of 100

  // Prepare filters
  const filters: any = {};
  if (query.category) filters.category = query.category;
  if (query.minPrice !== undefined) filters.minPrice = query.minPrice;
  if (query.maxPrice !== undefined) filters.maxPrice = query.maxPrice;
  if (query.search) filters.search = query.search;

  const result = await productService.getAllProducts(page, limit, filters);
  
  return formatJSONResponse(result, HTTP_STATUS.OK);
};

export const getProductById = async (event: APIGatewayProxyEvent) => {
  const params = validateParams(idParamSchema)(event);
  const product = await productService.getProductById(params.id);
  
  return formatJSONResponse({ product }, HTTP_STATUS.OK);
};

export const createProduct = async (event: APIGatewayProxyEvent) => {
  const body = validateBody(createProductSchema)(event);
  // Filter out undefined values to satisfy exactOptionalPropertyTypes
  const productData: Partial<import('../models/Product').IProduct> = {
    name: body.name,
    price: body.price,
    category: body.category,
    stock: body.stock,
  };
  if (body.description !== undefined) productData.description = body.description;
  if (body.images !== undefined) productData.images = body.images;
  if (body.tags !== undefined) productData.tags = body.tags;
  if (body.isActive !== undefined) productData.isActive = body.isActive;
  const product = await productService.createProduct(productData);
  
  return formatJSONResponse({ product }, HTTP_STATUS.CREATED);
};

export const updateProduct = async (event: APIGatewayProxyEvent) => {
  const params = validateParams(idParamSchema)(event);
  const body = validateBody(updateProductSchema)(event);
  // Filter out undefined values
  const updateData: Partial<import('../models/Product').IProduct> = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.price !== undefined) updateData.price = body.price;
  if (body.category !== undefined) updateData.category = body.category;
  if (body.stock !== undefined) updateData.stock = body.stock;
  if (body.images !== undefined) updateData.images = body.images;
  if (body.tags !== undefined) updateData.tags = body.tags;
  if (body.isActive !== undefined) updateData.isActive = body.isActive;
  const product = await productService.updateProduct(params.id, updateData);
  
  return formatJSONResponse({ product }, HTTP_STATUS.OK);
};

export const deleteProduct = async (event: APIGatewayProxyEvent) => {
  const params = validateParams(idParamSchema)(event);
  await productService.deleteProduct(params.id);
  
  return formatJSONResponse({ message: 'Product deleted successfully' }, HTTP_STATUS.OK);
};
