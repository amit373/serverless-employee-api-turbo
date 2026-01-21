import { ProductModel } from '../models/Product';
import { BadRequestException, NotFoundException } from '@packages/errors';
import { logger } from '@packages/logger';

interface IInventoryService {
  updateStock(productId: string, quantity: number): Promise<any>;
  checkStock(productId: string, requiredQuantity: number): Promise<boolean>;
  getLowStockProducts(threshold: number): Promise<any[]>;
  reserveStock(productId: string, quantity: number): Promise<boolean>;
  releaseStock(productId: string, quantity: number): Promise<boolean>;
}

export class InventoryService implements IInventoryService {
  async updateStock(productId: string, quantity: number): Promise<any> {
    try {
      logger.info(`Updating stock for product ${productId}`, { quantity });

      const product = await ProductModel.findById(productId);
      if (!product) {
        throw new NotFoundException('Product not found');
      }

      // Update stock
      product.stock = quantity;
      await product.save();

      logger.info(`Stock updated successfully for product ${productId}`, { newStock: quantity });

      return {
        productId: product._id,
        name: product.name,
        newStock: product.stock,
        updatedAt: product.updatedAt,
      };
    } catch (error) {
      logger.error(`Failed to update stock for product ${productId}`, error);
      throw error;
    }
  }

  async checkStock(productId: string, requiredQuantity: number): Promise<boolean> {
    try {
      const product = await ProductModel.findById(productId);
      if (!product) {
        throw new NotFoundException('Product not found');
      }

      const hasSufficientStock = product.stock >= requiredQuantity;
      
      logger.info(`Stock check for product ${productId}`, {
        required: requiredQuantity,
        available: product.stock,
        hasSufficient: hasSufficientStock
      });

      return hasSufficientStock;
    } catch (error) {
      logger.error(`Failed to check stock for product ${productId}`, error);
      throw error;
    }
  }

  async getLowStockProducts(threshold: number = 10): Promise<any[]> {
    try {
      logger.info(`Fetching low stock products with threshold ${threshold}`);

      const lowStockProducts = await ProductModel.find({
        stock: { $lte: threshold, $gt: 0 },
        isActive: true,
      }).select('name stock category').lean();

      logger.info(`Found ${lowStockProducts.length} low stock products`);

      return lowStockProducts;
    } catch (error) {
      logger.error('Failed to fetch low stock products', error);
      throw error;
    }
  }

  async reserveStock(productId: string, quantity: number): Promise<boolean> {
    try {
      logger.info(`Reserving stock for product ${productId}`, { quantity });

      const product = await ProductModel.findById(productId);
      if (!product) {
        throw new NotFoundException('Product not found');
      }

      if (product.stock < quantity) {
        throw new BadRequestException(`Insufficient stock. Available: ${product.stock}, Required: ${quantity}`);
      }

      // In a real implementation, you might want to track reserved stock separately
      // For now, we'll just check if it's available
      return true;
    } catch (error) {
      logger.error(`Failed to reserve stock for product ${productId}`, error);
      throw error;
    }
  }

  async releaseStock(productId: string, quantity: number): Promise<boolean> {
    try {
      logger.info(`Releasing stock for product ${productId}`, { quantity });

      // In a real implementation, this would add back reserved stock
      // For now, we'll just return true
      return true;
    } catch (error) {
      logger.error(`Failed to release stock for product ${productId}`, error);
      throw error;
    }
  }
}

export default new InventoryService();
