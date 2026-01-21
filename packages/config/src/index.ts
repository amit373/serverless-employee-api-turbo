import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  PORT: z.preprocess((val) => {
    if (typeof val === 'string') {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? 3000 : parsed;
    }
    return typeof val === 'number' ? val : 3000;
  }, z.number()),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
  AWS_REGION: z.string().default('us-east-1'),
  STAGE: z.string().default('dev'),
});

export type EnvironmentVariables = z.infer<typeof envSchema>;

export const validateEnv = (): EnvironmentVariables => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const { fieldErrors } = error.flatten();
      const errorMessages = Object.entries(fieldErrors).map(([field, errors]) => 
        `${field}: ${errors && Array.isArray(errors) ? errors.join(', ') : String(errors || 'unknown error')}`
      );
      throw new Error(`Environment validation error:\n${errorMessages.join('\n')}`);
    }
    throw error;
  }
};

// Lazy-load env to avoid top-level execution issues with ESM
let _env: EnvironmentVariables | null = null;
const getEnv = (): EnvironmentVariables => {
  if (!_env) {
    _env = validateEnv();
  }
  return _env;
};

// Export getter function instead of executing immediately
export default getEnv;
