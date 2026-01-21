import mongoose, { ConnectOptions } from 'mongoose';
import { MONGODB_CONNECTION } from '@packages/constants';
import { logger } from '@packages/logger';

let isConnected = false;

export const connectDB = async (): Promise<void> => {
  if (isConnected) {
    logger.info('MongoDB connection already established');
    return;
  }

  try {
    const options: ConnectOptions = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: MONGODB_CONNECTION.TIMEOUT || 30000,
      socketTimeoutMS: MONGODB_CONNECTION.TIMEOUT || 30000,
      bufferCommands: false,
    };

    const connectionString = process.env.MONGODB_URI || '';
    
    if (!connectionString) {
      throw new Error('MONGODB_URI environment variable is required');
    }

    const conn = await mongoose.connect(connectionString, options);
    
    // Wait for connection to be ready
    await mongoose.connection.db.admin().ping();

    isConnected = conn.connections[0]?.readyState === 1 || conn.connection.readyState === 1;
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('MongoDB disconnected');
  }
};

export { mongoose };
