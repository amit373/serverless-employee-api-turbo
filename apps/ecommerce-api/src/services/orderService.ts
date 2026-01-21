import { IOrder, OrderModel } from '@models/Order';
import { ProductModel } from '@models/Product';
import { CartModel } from '@models/Cart';
import { NotFoundException } from '@packages/errors';
import { logger } from '@packages/logger';

interface IOrderService {
  getAllOrders(userId: string, page: number, limit: number): Promise<{ orders: IOrder[]; total: number; page: number; pages: number }>;
  getOrderById(orderId: string): Promise<IOrder>;
  createOrder(userId: string, orderData: any): Promise<IOrder>;
  updateOrder(orderId: string, updateData: any): Promise<IOrder>;
  deleteOrder(orderId: string): Promise<void>;
}

export class OrderService implements IOrderService {
  async getAllOrders(userId: string, page: number, limit: number): Promise<{ orders: IOrder[]; total: number; page: number; pages: number }> {
    try {
      const skip = (page - 1) * limit;
      const total = await OrderModel.countDocuments({ userId });
      const orders = await OrderModel.find({ userId })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean();

      const pages = Math.ceil(total / limit);

      return {
        orders,
        total,
        page,
        pages,
      };
    } catch (error) {
      logger.error('Get all orders error:', error);
      throw error;
    }
  }

  async getOrderById(orderId: string): Promise<IOrder> {
    try {
      const order = await OrderModel.findById(orderId).lean();
      
      if (!order) {
        throw new NotFoundException('Order not found');
      }

      return order;
    } catch (error) {
      logger.error('Get order by ID error:', error);
      throw error;
    }
  }

  async createOrder(userId: string, orderData: any): Promise<IOrder> {
    try {
      // Calculate prices
      const itemsPrice = orderData.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
      const taxPrice = Number((0.15 * itemsPrice).toFixed(2)); // 15% tax
      const shippingPrice = itemsPrice > 100 ? 0 : 10; // Free shipping for orders over $100
      const totalPrice = itemsPrice + taxPrice + shippingPrice;

      // Create order object
      const order = new OrderModel({
        userId,
        orderItems: orderData.items,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      });

      const createdOrder = await order.save();

      // Update product stock
      for (const item of orderData.items) {
        const product = await ProductModel.findById(item.productId);
        if (product) {
          product.stock -= item.quantity;
          if (product.stock < 0) {
            product.stock = 0;
          }
          await product.save();
        }
      }

      // Clear user's cart after order creation
      await CartModel.findOneAndDelete({ userId });

      return createdOrder;
    } catch (error) {
      logger.error('Create order error:', error);
      throw error;
    }
  }

  async updateOrder(orderId: string, updateData: any): Promise<IOrder> {
    try {
      const updatedOrder = await OrderModel.findByIdAndUpdate(
        orderId,
        { ...updateData },
        { new: true, runValidators: true }
      );

      if (!updatedOrder) {
        throw new NotFoundException('Order not found');
      }

      return updatedOrder;
    } catch (error) {
      logger.error('Update order error:', error);
      throw error;
    }
  }

  async deleteOrder(orderId: string): Promise<void> {
    try {
      const deletedOrder = await OrderModel.findByIdAndDelete(orderId);

      if (!deletedOrder) {
        throw new NotFoundException('Order not found');
      }
    } catch (error) {
      logger.error('Delete order error:', error);
      throw error;
    }
  }
}

export default new OrderService();
