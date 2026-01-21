import { ICart, CartModel } from '../models/Cart';
import { ProductModel } from '../models/Product';
import { BadRequestException, NotFoundException } from '@packages/errors';
import { logger } from '@packages/logger';

interface ICartService {
  getCart(userId: string): Promise<ICart>;
  addToCart(userId: string, productId: string, quantity: number): Promise<ICart>;
  updateCartItem(userId: string, productId: string, quantity: number): Promise<ICart>;
  removeFromCart(userId: string, productId: string): Promise<ICart>;
  clearCart(userId: string): Promise<void>;
}

export class CartService implements ICartService {
  async getCart(userId: string): Promise<ICart> {
    try {
      let cart = await CartModel.findOne({ userId }).lean();
      
      if (!cart) {
        // Create empty cart if it doesn't exist
        cart = await new CartModel({ userId, items: [] }).save();
      }

      return cart;
    } catch (error) {
      logger.error('Get cart error:', error);
      throw error;
    }
  }

  async addToCart(userId: string, productId: string, quantity: number): Promise<ICart> {
    try {
      // Check if product exists
      const product = await ProductModel.findById(productId);
      if (!product) {
        throw new NotFoundException('Product not found');
      }

      if (quantity <= 0) {
        throw new BadRequestException('Quantity must be greater than 0');
      }

      if (product.stock < quantity) {
        throw new BadRequestException(`Only ${product.stock} items available in stock`);
      }

      // Find or create cart
      let cart = await CartModel.findOne({ userId });
      
      if (!cart) {
        cart = new CartModel({ userId, items: [] });
      }

      // Ensure items array exists
      if (!cart.items) {
        cart.items = [];
      }

      // Check if product already in cart
      const existingItemIndex = cart.items.findIndex(item => item.productId === productId);

      if (existingItemIndex > -1) {
        // Update quantity if product already in cart
        const existingItem = cart.items[existingItemIndex];
        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity;
          
          if (product.stock < newQuantity) {
            throw new BadRequestException(`Only ${product.stock} items available in stock`);
          }
          
          existingItem.quantity = newQuantity;
        }
      } else {
        // Add new item to cart
        cart.items.push({
          productId,
          quantity,
          price: product.price,
        });
      }

      return await cart.save();
    } catch (error) {
      logger.error('Add to cart error:', error);
      throw error;
    }
  }

  async updateCartItem(userId: string, productId: string, quantity: number): Promise<ICart> {
    try {
      if (quantity <= 0) {
        return await this.removeFromCart(userId, productId);
      }

      // Find cart
      const cart = await CartModel.findOne({ userId });
      if (!cart) {
        throw new NotFoundException('Cart not found');
      }

      // Find product
      const product = await ProductModel.findById(productId);
      if (!product) {
        throw new NotFoundException('Product not found');
      }

      if (product.stock < quantity) {
        throw new BadRequestException(`Only ${product.stock} items available in stock`);
      }

      // Ensure items array exists
      if (!cart.items) {
        cart.items = [];
      }

      // Find item in cart
      const itemIndex = cart.items.findIndex(item => item.productId === productId);
      if (itemIndex === -1) {
        throw new NotFoundException('Product not found in cart');
      }

      // Update quantity
      const item = cart.items[itemIndex];
      if (item) {
        item.quantity = quantity;
      }

      return await cart.save();
    } catch (error) {
      logger.error('Update cart item error:', error);
      throw error;
    }
  }

  async removeFromCart(userId: string, productId: string): Promise<ICart> {
    try {
      const cart = await CartModel.findOne({ userId });
      if (!cart) {
        throw new NotFoundException('Cart not found');
      }

      // Ensure items array exists and filter out the product to remove
      if (cart.items) {
        cart.items = cart.items.filter(item => item.productId !== productId);
      } else {
        cart.items = [];
      }

      return await cart.save();
    } catch (error) {
      logger.error('Remove from cart error:', error);
      throw error;
    }
  }

  async clearCart(userId: string): Promise<void> {
    try {
      await CartModel.findOneAndDelete({ userId });
    } catch (error) {
      logger.error('Clear cart error:', error);
      throw error;
    }
  }
}

export default new CartService();
