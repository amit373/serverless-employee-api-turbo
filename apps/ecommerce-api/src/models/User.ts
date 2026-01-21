import { Schema, model, Document } from 'mongoose';
import { hashPassword } from '@packages/utils';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'customer' | 'admin';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function (_doc, ret: Record<string, any>) {
      if (ret && typeof ret === 'object' && 'password' in ret) {
        const { password, ...rest } = ret;
        return rest;
      }
      return ret;
    },
  },
});

// Hash password before saving
userSchema.pre('save', async function (next: any) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    this.password = await hashPassword(this.password);
    return next();
  } catch (error: any) {
    return next(error);
  }
});

// @ts-ignore - mongoose v9 type instantiation issue with strict TypeScript
export const UserModel = model<IUser>('User', userSchema);
