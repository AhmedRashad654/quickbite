import path from 'path';
import { config } from 'dotenv';
import { z } from 'zod';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, '../../../.env') });

const schema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.string().default('development'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().default('5432'),
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DB_POOL_MAX: z.string().default('10'),
  DB_MIGRATION_DIRECTORY: z.string(),
  DB_MIGRATION_EXTENSION: z.string(),

  ACCESS_SECRET: z.string(),
  REFRESH_SECRET: z.string(),
  ACCESS_EXPIRES_IN: z.string(),
  REFRESH_EXPIRES_IN: z.string(),

  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379'),
  REDIS_PASSWORD: z.string().default(''),

  MAILJET_API_KEY: z.string(),
  MAILJET_SECRET_KEY: z.string(),
  MAILJET_FROM_EMAIL: z.string(),
  MAILJET_FROM_NAME: z.string(),

  WS_HEARTBEAT_SEC: z.string().default('30'),

  KASHIER_BASE_URL: z.string().default('https://test-api.kashier.io'),
  KASHIER_FEP_BASE_URL: z.string().default('https://test-fep.kashier.io'),
  KASHIER_MERCHANT_ID: z.string(),
  KASHIER_API_KEY: z.string(),
  KASHIER_SECRET_KEY: z.string(),
  KASHIER_PAYMENT_TYPE: z.string().default('credit'),
  KASHIER_RETURN_URL: z.string(),
  KASHIER_WEBHOOK_URL: z.string(),

  PAYMENT_SESSION_TIMEOUT_MIN: z.string().default('15'),

  // Deliveries / agents
  ASSIGNMENT_TICK_SEC: z.string().default('10'),
  ASSIGNMENT_BATCH: z.string().default('20'),
  ASSIGNMENT_MAX_ATTEMPTS: z.string().default('3'),
  ASSIGNMENT_RADIUS_METERS: z.string().default('5000'),
  ASSIGNMENT_OFFER_TTL_SEC: z.string().default('30'),
  ASSIGNMENT_CANDIDATES: z.string().default('5'),
  PRESENCE_STALE_SEC: z.string().default('300'),
  ASSIGNMENT_CLAIM_TTL_SEC: z.string().default('300'),
  AGENT_EARNING_SHARE_BPS: z.string().default('8000'),
});

const parsed = schema.parse(process.env);

export const env = {
  port: Number(parsed.PORT),
  nodeEnv: parsed.NODE_ENV,
  db: {
    host: parsed.DB_HOST,
    port: Number(parsed.DB_PORT),
    username: parsed.DB_USERNAME,
    password: parsed.DB_PASSWORD,
    name: parsed.DB_NAME,
    poolMax: Number(parsed.DB_POOL_MAX),
    migrationDirectory: path.resolve(__dirname, '../../../', parsed.DB_MIGRATION_DIRECTORY),
    migrationExtension: parsed.DB_MIGRATION_EXTENSION,
  },
  jwt: {
    refreshSecret: parsed.REFRESH_SECRET,
    accessSecret: parsed.ACCESS_SECRET,
    accessExpiresIn: parsed.ACCESS_EXPIRES_IN,
    refreshExpiresIn: parsed.REFRESH_EXPIRES_IN,
  },
  redis: {
    host: parsed.REDIS_HOST,
    port: Number(parsed.REDIS_PORT),
    password: parsed.REDIS_PASSWORD,
  },
  cors: {
    origins: parsed.CORS_ORIGINS.split(','),
  },
  mailjet: {
    mailjetApiKey: parsed.MAILJET_API_KEY,
    mailjetSecretKey: parsed.MAILJET_SECRET_KEY,
    mailjetFromEmail: parsed.MAILJET_FROM_EMAIL,
    mailjetFormName: parsed.MAILJET_FROM_NAME,
  },
  ws: {
    heartbeatSec: Number(parsed.WS_HEARTBEAT_SEC),
  },
  payments: {
    sessionTimeoutMin: Number(parsed.PAYMENT_SESSION_TIMEOUT_MIN),
  },

  kashier: {
    baseUrl: parsed.KASHIER_BASE_URL,
    fepBaseUrl: parsed.KASHIER_FEP_BASE_URL,
    merchantId: parsed.KASHIER_MERCHANT_ID,
    apiKey: parsed.KASHIER_API_KEY,
    secretKey: parsed.KASHIER_SECRET_KEY,
    paymentType: parsed.KASHIER_PAYMENT_TYPE,
    returnUrl: parsed.KASHIER_RETURN_URL,
    webhookUrl: parsed.KASHIER_WEBHOOK_URL,
  },

  delivery: {
    assignmentTickSec: Number(parsed.ASSIGNMENT_TICK_SEC),
    batch: Number(parsed.ASSIGNMENT_BATCH),
    maxAttempts: Number(parsed.ASSIGNMENT_MAX_ATTEMPTS),
    radiusMeters: Number(parsed.ASSIGNMENT_RADIUS_METERS),
    offerTtlSec: Number(parsed.ASSIGNMENT_OFFER_TTL_SEC),
    candidates: Number(parsed.ASSIGNMENT_CANDIDATES),
    presenceStaleSec: Number(parsed.PRESENCE_STALE_SEC),
    claimTtlSec: Number(parsed.ASSIGNMENT_CLAIM_TTL_SEC),
    agentEarningShareBps: Number(parsed.AGENT_EARNING_SHARE_BPS),
  },
};
