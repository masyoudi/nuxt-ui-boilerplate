import { resolve } from 'node:path';
import { config } from 'dotenv';

interface ConfigApp {
  env: string;
  host: string;
  port: number;
}

const dotenv = config({ path: resolve('config/.env') });

export const app: ConfigApp = {
  env: String(dotenv.parsed?.NODE_ENV),
  host: String(dotenv.parsed?.HOST),
  port: Number.parseInt(String(dotenv.parsed?.PORT), 10)
};

export const isDev = process.env.NODE_ENV === 'development';

export const isProd = process.env.NODE_ENV === 'production';

export default {
  app,
  isDev,
  isProd
};
