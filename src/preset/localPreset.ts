import { Application, PresetConfig } from './presetTypes';

// Infrastructure
import { MemorySessionAdapter } from '../infrastructure/database/memory/memorySessionAdapter';
import { MemorySongLineAdapter } from '../infrastructure/database/memory/memorySongLineAdapter';

// Strategies
import { MockLLMStrategy } from '../strategy/llm/mockStrategy';
import { MockExportStrategy } from '../strategy/export/mockStrategy';

// Services
import { DefaultSessionService } from '../application/session/sessionService';
import { DefaultSongLineService } from '../application/songLine/songLineService';
import { DefaultCollaborationService } from '../application/collaboration/collaborationService';

export interface LocalPresetConfig {
  server?: {
    port?: number;
    host?: string;
  };
  mockSettings?: {
    llmDelay?: { min: number; max: number };
    enableLogging?: boolean;
  };
}

export function createLocalPreset(config: LocalPresetConfig = {}): Application {
  console.log('🔧 Creating local development preset...');
  
  // Infrastructure layer - In-memory adapters for fast development
  const sessionRepository = new MemorySessionAdapter();
  const songLineRepository = new MemorySongLineAdapter();
  
  // Strategy layer - Mock implementations for development
  const llmStrategy = new MockLLMStrategy();
  const exportStrategy = new MockExportStrategy();
  
  // Service layer - Wire up dependencies
  const sessionService = new DefaultSessionService(
    sessionRepository,
    llmStrategy,
    exportStrategy
  );
  
  const songLineService = new DefaultSongLineService(songLineRepository);
  
  // Collaboration service with event broadcasting
  const collaborationService = new DefaultCollaborationService(
    sessionService,
    async (sessionId, event) => {
      // In local mode, just log events (no real WebSocket broadcasting)
      if (config.mockSettings?.enableLogging) {
        console.log(`🔔 Event for session ${sessionId}:`, event);
      }
    }
  );
  
  console.log('✅ Local preset created successfully');
  console.log('📝 Using in-memory storage - data will not persist');
  console.log('🤖 Using mock LLM strategy - no external API calls');
  
  return {
    sessionService,
    songLineService,
    collaborationService,
    
    // Cleanup function for testing
    cleanup: async () => {
      console.log('🧹 Cleaning up local preset...');
      // Nothing to clean up for in-memory adapters
    }
  };
}