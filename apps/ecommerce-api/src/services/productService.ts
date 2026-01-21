import { IProduct } from '../models/Product';
import { ProductModel } from '../models/Product';
import { NotFoundException } from '@packages/errors';
import { logger } from '@packages/logger';

interface IProductService {
  getAllProducts(page: number, limit: number, filters?: any): Promise<{ products: IProduct[]; total: number; page: number; pages: number }>;
  getProductById(id: string): Promise<IProduct>;
  createProduct(productData: Partial<IProduct>): Promise<IProduct>;
  updateProduct(id: string, productData: Partial<IProduct>): Promise<IProduct>;
  deleteProduct(id: string): Promise<void>;
}

export class ProductService implements IProductService {
  async getAllProducts(page: number, limit: number, filters: any = {}): Promise<{ products: IProduct[]; total: number; page: number; pages: number }> {
    try {
      const skip = (page - 1) * limit;
      const queryFilters: any = {};

      // Apply filters if provided
      if (filters.category) {
        queryFilters.category = filters.category;
      }
      
      if (filters.minPrice !== undefined) {
        queryFilters.price = { $gte: filters.minPrice, ...queryFilters.price };
      }
      
      if (filters.maxPrice !== undefined) {
        queryFilters.price = { ...queryFilters.price, $lte: filters.maxPrice };
      }
      
      if (filters.search) {
        queryFilters.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } },
          { tags: { $in: [new RegExp(filters.search, 'i')] } },
        ];
      }

      const total = await ProductModel.countDocuments(queryFilters);
      const products = await ProductModel.find(queryFilters)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean();

      const pages = Math.ceil(total / limit);

      return {
        products,
        total,
        page,
        pages,
      };
    } catch (error) {
      logger.error('Get all products error:', error);
      throw error;
    }
  }

  async getProductById(id: string): Promise<IProduct> {
    try {
      const product = await ProductModel.findById(id).lean();
      
      if (!product) {
        throw new NotFoundException('Product not found');
      }

      return product;
    } catch (error) {
      logger.error('Get product by ID error:', error);
      throw error;
    }
  }

  async createProduct(productData: Partial<IProduct>): Promise<IProduct> {
    try {
      const newProduct = new ProductModel(productData);
      const savedProduct = await newProduct.save();

      return savedProduct;
    } catch (error) {
      logger.error('Create product error:', error);
      throw error;
    }
  }

  async updateProduct(id: string, productData: Partial<IProduct>): Promise<IProduct> {
    try {
      const updatedProduct = await ProductModel.findByIdAndUpdate(
        id,
        { ...productData },
        { new: true, runValidators: true }
      );

      if (!updatedProduct) {
        throw new NotFoundException('Product not found');
      }

      return updatedProduct;
    } catch (error) {
      logger.error('Update product error:', error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      const deletedProduct = await ProductModel.findByIdAndDelete(id);

      if (!deletedProduct) {
        throw new NotFoundException('Product not found');
      }
    } catch (error) {
      logger.error('Delete product error:', error);
      throw error;
    }
  }
}

export default new ProductService();
