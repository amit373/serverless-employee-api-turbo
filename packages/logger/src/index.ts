import winston, { Logger } from 'winston';

export const createLogger = (serviceName: string): Logger => {
  const logLevel = process.env.LOG_LEVEL || 'info';
  const isDevelopment = process.env.NODE_ENV === 'development';

  return winston.createLogger({
    level: logLevel,
    format: isDevelopment
      ? winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp(),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            return `${timestamp} [${level}] ${serviceName}: ${message}${
              Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : ''
            }`;
          })
        )
      : winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
    transports: [
      new winston.transports.Console({
        silent: process.env.NODE_ENV === 'test',
      }),
    ],
  });
};

export const logger = createLogger('ecommerce-api');
export default logger;
