import { Application, PresetConfig } from './presetTypes';

// Infrastructure - Production adapters (to be implemented later)
// import { PostgresSessionAdapter } from '../infrastructure/database/postgres/sessionAdapter';
// import { PostgresSongLineAdapter } from '../infrastructure/database/postgres/songLineAdapter';

// For now, use memory adapters as fallback until Postgres is implemented
import { MemorySessionAdapter } from '../infrastructure/database/memory/memorySessionAdapter';
import { MemorySongLineAdapter } from '../infrastructure/database/memory/memorySongLineAdapter';

// Strategies - Real implementations
import { OpenAIStrategy } from '../strategy/llm/openaiStrategy';
import { SonoStrategy } from '../strategy/export/sonoStrategy';
import { OpenAIClient } from '../infrastructure/external/openaiClient';

// Services
import { DefaultSessionService } from '../application/session/sessionService';
import { DefaultSongLineService } from '../application/songLine/songLineService';
import { DefaultCollaborationService } from '../application/collaboration/collaborationService';

export interface ProductionPresetConfig {
  server: {
    port: number;
    host: string;
  };
  openai: {
    apiKey: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
  };
  sono?: {
    apiKey: string;
    baseUrl: string;
  };
  database?: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    ssl: boolean;
  };
}

export function createProductionPreset(config: ProductionPresetConfig): Application {
  console.log('🚀 Creating production preset...');
  
  // Validate required configuration
  if (!config.openai?.apiKey) {
    throw new Error('OpenAI API key is required for production preset');
  }
  
  // Infrastructure layer
  let sessionRepository;
  let songLineRepository;
  
  if (config.database) {
    // TODO: Implement PostgreSQL adapters
    console.log('⚠️  PostgreSQL adapters not yet implemented, falling back to memory adapters');
    console.log('🔄 Consider implementing PostgresSessionAdapter and PostgresSongLineAdapter');
    sessionRepository = new MemorySessionAdapter();
    songLineRepository = new MemorySongLineAdapter();
  } else {
    console.log('📝 Using memory storage for production (not recommended for scale)');
    sessionRepository = new MemorySessionAdapter();
    songLineRepository = new MemorySongLineAdapter();
  }
  
  // Strategy layer - Real external services
  const openaiClient = new OpenAIClient(config.openai.apiKey);
  const llmStrategy = new OpenAIStrategy(openaiClient, {
    defaultMaxTokens: config.openai.maxTokens || 60,
    defaultTemperature: config.openai.temperature || 0.7,
  });
  
  const exportStrategy = config.sono?.apiKey 
    ? (() => {
        const { SonoClient } = require('../infrastructure/external/sonoClient');
        const sonoClient = new SonoClient(config.sono.apiKey, config.sono.baseUrl);
        return new SonoStrategy(sonoClient);
      })()
    : (() => {
        console.log('⚠️  No Sono API configuration provided, song export will be limited');
        const { MockExportStrategy } = require('../strategy/export/mockStrategy');
        return new MockExportStrategy();
      })();
  
  // Service layer
  const sessionService = new DefaultSessionService(
    sessionRepository,
    llmStrategy,
    exportStrategy
  );
  
  const songLineService = new DefaultSongLineService(songLineRepository);
  
  // Collaboration service with proper event broadcasting
  const collaborationService = new DefaultCollaborationService(
    sessionService,
    async (sessionId, event) => {
      // In production, this would integrate with the WebSocket manager
      console.log(`📡 Broadcasting event for session ${sessionId}:`, event.type);
    }
  );
  
  console.log('✅ Production preset created successfully');
  console.log(`🔗 OpenAI integration: ${config.openai.model || 'default'}`);
  console.log(`🎵 Song export: ${config.sono ? 'Sono API' : 'Mock'}`);
  console.log(`💾 Database: ${config.database ? 'PostgreSQL (fallback: memory)' : 'Memory'}`);
  
  return {
    sessionService,
    songLineService,
    collaborationService,
    
    // Cleanup function
    cleanup: async () => {
      console.log('🧹 Cleaning up production preset...');
      // Close database connections, cleanup resources, etc.
    }
  };
}