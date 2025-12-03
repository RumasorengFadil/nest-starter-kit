import * as Joi from 'joi';

export const validationSchema = Joi.object({
  //APP
  APP_ENV: Joi.string().valid('local','development', 'production', 'test').required(),
  APP_PORT: Joi.number().default(3000),
  APP_URL: Joi.string().default('http://localhost:3000'),
  APP_FRONTEND_URL: Joi.string().default('http://localhost:8000'),

  // DB
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow('').optional(),
  DB_DATABASE: Joi.string().required(),

  // UPLOAD
  UPLOAD_PATH: Joi.string().default('./uploads'),

  // AUTH
  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRATION: Joi.string().default('900s'),
  JWT_REFRESH_EXPIRATION: Joi.string().default('30d'),

  // GOOGLE
  GOOGLE_CLIENT_ID: Joi.string().optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().optional(),
  GOOGLE_CALLBACK_URL: Joi.string().default(
    'http://localhost:8000/auth/google/callback',
  ),

  // SMTP
  SMTP_USER: Joi.string().required(),
  SMTP_PASS: Joi.string().required(),
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.string().required(),
  JWT_VERIFICATION_SECRET: Joi.string().required(),
});
