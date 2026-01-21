import { Schema, model, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description?: string;
  price: number;
  category: string;
  stock: number;
  images?: string[];
  tags?: string[];
  isActive: boolean;
  rating?: number;
  numReviews?: number;
  sellerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
  },
  images: [{
    type: String,
    validate: {
      validator: function(v: string[]) {
        return v.every(url => /^https?:\/\/.+\..+/.test(url));
      },
      message: 'All image URLs must be valid'
    }
  }],
  tags: [{
    type: String,
    trim: true,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  sellerId: {
    type: String,
    ref: 'User',
  },
}, {
  timestamps: true,
});

export const ProductModel = model<IProduct>('Product', productSchema);
