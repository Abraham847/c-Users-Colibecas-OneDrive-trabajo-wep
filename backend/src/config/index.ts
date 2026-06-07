import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/cloudhost',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'default-jwt-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  },

  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID || '',
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
    mode: process.env.PAYPAL_MODE || 'sandbox',
  },

  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'noreply@cloudhost.com',
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  ai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.AI_MODEL || 'gpt-4-turbo',
  },

  cloudflare: {
    apiKey: process.env.CLOUDFLARE_API_KEY || '',
    email: process.env.CLOUDFLARE_EMAIL || '',
  },

  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local',
    aws: {
      accessKey: process.env.AWS_ACCESS_KEY_ID || '',
      secretKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      region: process.env.AWS_REGION || 'us-east-1',
      bucket: process.env.AWS_S3_BUCKET || 'cloudhost-files',
    },
  },
};
