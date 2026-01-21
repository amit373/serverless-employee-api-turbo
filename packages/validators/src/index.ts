import { z } from 'zod';

// User validation schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Product validation schemas
export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be a positive number'),
  category: z.string().min(1, 'Category is required'),
  stock: z.number().int().nonnegative('Stock must be a non-negative integer'),
  images: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
});

export const updateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').optional(),
  description: z.string().optional(),
  price: z.number().positive('Price must be a positive number').optional(),
  category: z.string().min(1, 'Category is required').optional(),
  stock: z.number().int().nonnegative('Stock must be a non-negative integer').optional(),
  images: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

// Category validation schemas
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  parentId: z.string().optional(),
});

// Cart validation schemas
export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});

export const updateCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});

// Order validation schemas
export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1, 'Product ID is required'),
      quantity: z.number().int().positive('Quantity must be a positive integer'),
    })
  ),
  shippingAddress: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'Zip code is required'),
    country: z.string().min(1, 'Country is required'),
  }),
  paymentMethod: z.enum(['credit_card', 'paypal', 'stripe']),
});

// Query validation schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});

export const productQuerySchema = paginationSchema.extend({
  category: z.string().optional(),
  minPrice: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
  maxPrice: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'price', 'createdAt', 'updatedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Common validation schemas
export const idParamSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

export const stringIdSchema = z.string().min(1, 'ID is required');

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartInput = z.infer<typeof updateCartSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
export type IdParamInput = z.infer<typeof idParamSchema>;
