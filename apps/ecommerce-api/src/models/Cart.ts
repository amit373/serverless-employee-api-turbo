import { Schema, model, Document } from 'mongoose';

export interface ICartItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface ICart extends Document {
  userId: string;
  items: ICartItem[];
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

const cartSchema = new Schema<ICart>({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  items: [{
    productId: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
    },
  }],
  total: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Pre-save middleware to calculate total
cartSchema.pre('save', function(next: any) {
  if (this.items && Array.isArray(this.items)) {
    this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }
  return next();
});

export const CartModel = model<ICart>('Cart', cartSchema);
