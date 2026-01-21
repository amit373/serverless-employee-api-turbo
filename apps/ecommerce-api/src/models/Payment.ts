import { Schema, model, Document } from 'mongoose';

export interface IPayment extends Document {
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  transactionId: string;
  paymentGateway?: string;
  gatewayResponse?: any;
  refundedAmount?: number;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>({
  orderId: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    required: true,
    default: 'pending',
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  paymentGateway: {
    type: String,
  },
  gatewayResponse: {
    type: Schema.Types.Mixed,
  },
  refundedAmount: {
    type: Number,
    default: 0,
  },
  refundedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

export const PaymentModel = model<IPayment>('Payment', paymentSchema);
