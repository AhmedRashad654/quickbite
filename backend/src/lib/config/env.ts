import path from 'path';
import { config } from 'dotenv';
import { z } from 'zod';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, '../../../.env') });


const schema = z.object({
  PORT: z.string().default('3000'),
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
  NODE_ENV:z.string().default('development'),
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
};
