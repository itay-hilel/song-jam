import { Application } from './presetTypes';
import { createLocalPreset, LocalPresetConfig } from './localPreset';
import { createProductionPreset, ProductionPresetConfig } from './productionPreset';

export type PresetMode = 'local' | 'production';

export interface PresetFactoryConfig {
  mode: PresetMode;
  local?: LocalPresetConfig;
  production?: ProductionPresetConfig;
}

export class PresetFactory {
  static create(config: PresetFactoryConfig): Application {
    console.log(`🏗️  Creating ${config.mode} preset...`);
    
    switch (config.mode) {
      case 'local':
        return createLocalPreset(config.local || {});
        
      case 'production':
        if (!config.production) {
          throw new Error('Production configuration is required for production preset');
        }
        return createProductionPreset(config.production);
        
      default:
        throw new Error(`Unsupported preset mode: ${config.mode}`);
    }
  }
  
  static createFromEnvironment(): Application {
    const mode = (process.env.SERVER_RUNTIME as PresetMode) || 'local';
    
    console.log(`🌍 Creating preset from environment (${mode})...`);
    
    switch (mode) {
      case 'local':
        return PresetFactory.create({
          mode: 'local',
          local: {
            server: {
              port: parseInt(process.env.PORT || '3000'),
              host: process.env.HOST || 'localhost'
            },
            mockSettings: {
              enableLogging: process.env.NODE_ENV === 'development'
            }
          }
        });
        
      case 'production':
        return PresetFactory.create({
          mode: 'production',
          production: {
            server: {
              port: parseInt(process.env.PORT || '3000'),
              host: process.env.HOST || '0.0.0.0'
            },
            openai: {
              apiKey: process.env.OPENAI_API_KEY || '',
              model: process.env.OPENAI_MODEL,
              maxTokens: process.env.OPENAI_MAX_TOKENS ? parseInt(process.env.OPENAI_MAX_TOKENS) : undefined,
              temperature: process.env.OPENAI_TEMPERATURE ? parseFloat(process.env.OPENAI_TEMPERATURE) : undefined,
            },
            sono: process.env.SONO_API_KEY ? {
              apiKey: process.env.SONO_API_KEY,
              baseUrl: process.env.SONO_BASE_URL || 'https://api.sono.com'
            } : undefined,
            database: process.env.DATABASE_URL ? {
              host: process.env.DB_HOST || 'localhost',
              port: parseInt(process.env.DB_PORT || '5432'),
              user: process.env.DB_USER || 'postgres',
              password: process.env.DB_PASSWORD || '',
              database: process.env.DB_NAME || 'songjam',
              ssl: process.env.DB_SSL === 'true'
            } : undefined
          }
        });
        
      default:
        throw new Error(`Unsupported SERVER_RUNTIME: ${mode}`);
    }
  }
}

// Convenience exports
export const createPreset = PresetFactory.create;
export const createPresetFromEnvironment = PresetFactory.createFromEnvironment;
