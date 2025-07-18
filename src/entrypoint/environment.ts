import { config } from 'dotenv';

config();

export const environment = {
  server: {
    runtime: process.env.SERVER_RUNTIME || 'local',
    port: parseInt(process.env.PORT || '3000', 10),
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  externalAPIs: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
    },
    sono: {
      apiKey: process.env.SONO_API_KEY,
      apiUrl: process.env.SONO_API_URL,
    },
  },
  dataDir: process.env.DATA_DIR || '.data',
  nodeEnv: process.env.NODE_ENV || 'development',
};