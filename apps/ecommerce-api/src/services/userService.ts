import { IUser } from '../models/User';
import { UserModel } from '../models/User';
import { BadRequestException, NotFoundException } from '@packages/errors';
import { logger } from '@packages/logger';

interface IUserService {
  getAllUsers(page: number, limit: number): Promise<{ users: IUser[]; total: number; page: number; pages: number }>;
  getUserById(id: string): Promise<IUser>;
  createUser(userData: Partial<IUser>): Promise<IUser>;
  updateUser(id: string, userData: Partial<IUser>): Promise<IUser>;
  deleteUser(id: string): Promise<void>;
}

export class UserService implements IUserService {
  async getAllUsers(page: number, limit: number): Promise<{ users: IUser[]; total: number; page: number; pages: number }> {
    try {
      const skip = (page - 1) * limit;
      const total = await UserModel.countDocuments();
      const users = await UserModel.find()
        .skip(skip)
        .limit(limit)
        .select('-password')
        .lean();

      const pages = Math.ceil(total / limit);

      return {
        users,
        total,
        page,
        pages,
      };
    } catch (error) {
      logger.error('Get all users error:', error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<IUser> {
    try {
      const user = await UserModel.findById(id).select('-password').lean();
      
      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      logger.error('Get user by ID error:', error);
      throw error;
    }
  }

  async createUser(userData: Partial<IUser>): Promise<IUser> {
    try {
      // Check if user already exists
      if (!userData.email) {
        throw new BadRequestException('Email is required');
      }
      const existingUser = await UserModel.findOne({ email: userData.email });
      
      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }

      const newUser = new UserModel(userData);
      const savedUser = await newUser.save();

      // Remove password from response
      const { password: _, ...userWithoutPassword } = savedUser.toObject() as any;

      return userWithoutPassword;
    } catch (error) {
      logger.error('Create user error:', error);
      throw error;
    }
  }

  async updateUser(id: string, userData: Partial<IUser>): Promise<IUser> {
    try {
      // Check if user exists
      const existingUser = await UserModel.findById(id);
      
      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      // Check if email is being updated and if it already exists
      if (userData.email && userData.email !== existingUser.email) {
        const emailExists = await UserModel.findOne({ email: userData.email, _id: { $ne: id } });
        
        if (emailExists) {
          throw new BadRequestException('User with this email already exists');
        }
      }

      const updatedUser = await UserModel.findByIdAndUpdate(
        id,
        { ...userData },
        { new: true, runValidators: true }
      ).select('-password');

      if (!updatedUser) {
        throw new NotFoundException('User not found');
      }

      return updatedUser;
    } catch (error) {
      logger.error('Update user error:', error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      const deletedUser = await UserModel.findByIdAndDelete(id);

      if (!deletedUser) {
        throw new NotFoundException('User not found');
      }
    } catch (error) {
      logger.error('Delete user error:', error);
      throw error;
    }
  }
}

export default new UserService();
