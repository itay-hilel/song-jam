// Application Services
import { SessionService } from '../application/session/sessionService';
import { SongLineService } from '../application/songLine/songLineService';
import { CollaborationService } from '../application/collaboration/collaborationService';

// Repository Interfaces
import { SessionRepository } from '../application/session/sessionRepository';
import { SongLineRepository } from '../application/songLine/songLineRepository';

// Strategy Interfaces
import { LLMStrategy } from '../strategy/llm/llmStrategy';
import { ExportStrategy } from '../strategy/export/exportStrategy';

// Infrastructure
import { SocketManager } from '../infrastructure/websocket/socketManager';

export interface Application {
  // Services
  sessionService: SessionService;
  songLineService: SongLineService;
  collaborationService: CollaborationService;
  
  // Infrastructure
  socketManager?: SocketManager;
  
  // For cleanup and testing
  cleanup?: () => Promise<void>;
}

export interface PresetConfig {
  mode: 'local' | 'production';
  server: ServerConfig;
  database?: DatabaseConfig;
  openai?: OpenAIConfig;
  sono?: SonoConfig;
}

export interface ServerConfig {
  port: number;
  host: string;
  cors: boolean;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl?: boolean;
}

export interface OpenAIConfig {
  apiKey: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

export interface SonoConfig {
  apiKey: string;
  baseUrl: string;
}

export interface PresetDependencies {
  // Repositories
  sessionRepository: SessionRepository;
  songLineRepository: SongLineRepository;
  
  // Strategies
  llmStrategy: LLMStrategy;
  exportStrategy: ExportStrategy;
  
  // Infrastructure
  socketManager?: SocketManager;
}