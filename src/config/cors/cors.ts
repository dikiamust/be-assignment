import { Logger } from '@nestjs/common';

export const CorsConfig = () => {
  const logger = new Logger('CorsConfig');
  logger.debug(`CORS_ORIGIN_WHITELIST: ${process.env.CORS_ORIGIN_WHITELIST}`);
  return {
    origin: process.env.CORS_ORIGIN_WHITELIST.split(','),
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    preflightContinue: false,
  };
};
