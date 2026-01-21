import { logger } from '@packages/logger';
import { PaymentModel, IPayment } from '../models/Payment';
import { OrderModel } from '../models/Order';
import { generateId } from '@packages/utils';
import { NotFoundException, BadRequestException } from '@packages/errors';

interface IPaymentService {
  processPayment(orderId: string, userId: string, amount: number, paymentMethod: string): Promise<IPayment>;
  refundPayment(paymentId: string, refundAmount?: number): Promise<IPayment>;
  verifyPayment(paymentId: string): Promise<IPayment>;
  getPaymentByOrderId(orderId: string): Promise<IPayment | null>;
}

export class PaymentService implements IPaymentService {
  async processPayment(orderId: string, userId: string, amount: number, paymentMethod: string): Promise<IPayment> {
    try {
      logger.info(`Processing payment for order ${orderId}`, { amount, paymentMethod });

      // Verify order exists
      const order = await OrderModel.findById(orderId);
      if (!order) {
        throw new NotFoundException('Order not found');
      }

      // Check if payment already exists
      const existingPayment = await PaymentModel.findOne({ orderId });
      if (existingPayment && existingPayment.status === 'completed') {
        throw new BadRequestException('Payment already processed for this order');
      }

      // Generate transaction ID
      const transactionId = `txn_${generateId()}`;

      // Create payment record
      const payment = new PaymentModel({
        orderId,
        userId,
        amount,
        currency: 'USD',
        paymentMethod,
        status: 'processing',
        transactionId,
      });

      // Simulate payment processing (in production, integrate with payment gateway)
      // For now, we'll mark it as completed after a brief delay simulation
      await payment.save();

      // Update payment status to completed
      payment.status = 'completed';
      await payment.save();

      // Update order payment status
      order.paymentResult = {
        id: payment._id.toString(),
        status: 'completed',
        update_time: new Date().toISOString(),
        email_address: userId, // In production, get from user model
      };
      order.isPaid = true;
      order.paidAt = new Date();
      await order.save();

      logger.info(`Payment processed successfully for order ${orderId}`, { paymentId: payment._id, transactionId });

      return payment;
    } catch (error) {
      logger.error(`Payment processing failed for order ${orderId}`, error);
      throw error;
    }
  }

  async refundPayment(paymentId: string, refundAmount?: number): Promise<IPayment> {
    try {
      logger.info(`Processing refund for payment ${paymentId}`);

      const payment = await PaymentModel.findById(paymentId);
      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      if (payment.status === 'refunded') {
        throw new BadRequestException('Payment already refunded');
      }

      if (payment.status !== 'completed') {
        throw new BadRequestException('Can only refund completed payments');
      }

      const amountToRefund = refundAmount || payment.amount;

      if (amountToRefund > payment.amount) {
        throw new BadRequestException('Refund amount cannot exceed payment amount');
      }

      payment.status = 'refunded';
      payment.refundedAmount = amountToRefund;
      payment.refundedAt = new Date();
      await payment.save();

      // Update order status
      const order = await OrderModel.findById(payment.orderId);
      if (order) {
        order.isPaid = false;
        await order.save();
      }

      logger.info(`Refund processed successfully for payment ${paymentId}`, { refundAmount: amountToRefund });

      return payment;
    } catch (error) {
      logger.error(`Refund processing failed for payment ${paymentId}`, error);
      throw error;
    }
  }

  async verifyPayment(paymentId: string): Promise<IPayment> {
    try {
      logger.info(`Verifying payment ${paymentId}`);

      const payment = await PaymentModel.findById(paymentId);
      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      logger.info(`Payment verification completed for ${paymentId}`, { 
        paymentId: payment._id, 
        status: payment.status,
        transactionId: payment.transactionId 
      });

      return payment;
    } catch (error) {
      logger.error(`Payment verification failed for ${paymentId}`, error);
      throw error;
    }
  }

  async getPaymentByOrderId(orderId: string): Promise<IPayment | null> {
    try {
      const payment = await PaymentModel.findOne({ orderId }).lean();
      return payment;
    } catch (error) {
      logger.error(`Get payment by order ID error:`, error);
      throw error;
    }
  }
}

export default new PaymentService();
