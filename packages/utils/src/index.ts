import crypto from 'crypto';
import jwt, { SignOptions } from 'jsonwebtoken';

export const generateId = (): string => {
  return crypto.randomBytes(16).toString('hex');
};

export const hashPassword = async (password: string): Promise<string> => {
  const bcrypt = await import('bcrypt');
  const saltRounds = parseInt(process.env.SALT_ROUNDS || '10', 10);
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  const bcrypt = await import('bcrypt');
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (payload: any, secret: string, expiresIn: string | number): string => {
  return jwt.sign(payload, secret, { expiresIn } as SignOptions);
};

export const verifyToken = (token: string, secret: string): any => {
  return jwt.verify(token, secret);
};

export const sanitizeObject = <T>(obj: T, fieldsToOmit: string[]): T => {
  const sanitizedObj = { ...obj } as any;
  fieldsToOmit.forEach(field => {
    delete sanitizedObj[field];
  });
  return sanitizedObj;
};

export const paginateResults = <T>(
  items: T[],
  page: number,
  limit: number
): { data: T[]; pagination: { page: number; limit: number; totalPages: number; totalItems: number } } => {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / limit);
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const data = items.slice(startIndex, endIndex);
  
  return {
    data,
    pagination: {
      page,
      limit,
      totalPages,
      totalItems,
    },
  };
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const formatDate = (date: Date): string => {
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

export const maskEmail = (email: string): string => {
  const [username, domain] = email.split('@');
  if (!username || !domain) {
    return email;
  }
  if (username.length <= 2) {
    return `${username.charAt(0)}***@${domain}`;
  }
  return `${username.substring(0, 2)}***@${domain}`;
};

export const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

export const flattenObject = (obj: any, prefix: string = ''): any => {
  const flattened: any = {};
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(flattened, flattenObject(obj[key], prefix + key + '.'));
    } else {
      flattened[prefix + key] = obj[key];
    }
  }
  return flattened;
};
