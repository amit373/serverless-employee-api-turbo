import { comparePassword, generateToken } from '@packages/utils';
import { JWT_CONFIG } from '@packages/constants';
import { UnauthorizedException } from '@packages/errors';
import { UserModel, IUser } from '../models/User';
import { logger } from '@packages/logger';

interface IAuthService {
  login(email: string, password: string): Promise<{ user: IUser; accessToken: string; refreshToken: string }>;
  register(userData: Partial<IUser>): Promise<IUser>;
  logout(userId: string): Promise<void>;
}

export class AuthService implements IAuthService {
  async login(email: string, password: string): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    try {
      // Find user by email
      const user = await UserModel.findOne({ email }).lean();
      
      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Compare password
      const isPasswordValid = await comparePassword(password, user.password);
      
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Update last login
      await UserModel.findByIdAndUpdate(user._id, { lastLogin: new Date() });

      // Generate tokens
      const accessToken = generateToken(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        JWT_CONFIG.EXPIRES_IN
      );

      const refreshToken = generateToken(
        { userId: user._id, email: user.email },
        process.env.JWT_REFRESH_SECRET!,
        JWT_CONFIG.REFRESH_EXPIRES_IN
      );

      // Remove password from user object
      const { password: _, ...userWithoutPassword } = user as any;

      return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  async register(userData: Partial<IUser>): Promise<IUser> {
    try {
      // Check if user already exists
      if (!userData.email) {
        throw new Error('Email is required');
      }
      const existingUser = await UserModel.findOne({ email: userData.email });
      
      if (existingUser) {
        throw new UnauthorizedException('User with this email already exists');
      }

      // Create new user
      const newUser = new UserModel(userData);
      const savedUser = await newUser.save();

      // Remove password from response
      const { password: _, ...userWithoutPassword } = savedUser.toObject() as any;

      return userWithoutPassword;
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  async logout(userId: string): Promise<void> {
    // In a real implementation, you might want to store refresh tokens in a database
    // and invalidate them upon logout
    logger.info(`User logged out: ${userId}`);
  }
}

export default new AuthService();
