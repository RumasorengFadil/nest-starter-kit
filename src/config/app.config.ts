import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.APP_PORT ?? '') || 3000,
  appUrl: process.env.APP_URL,
  frontEntUrl: process.env.APP_FRONTEND_URL,
}));
