import { Context } from '../../types';

export interface LLMPromptTemplate {
  system: string;
  user: string;
}

export interface LLMGenerationOptions {
  maxTokens?: number;
  temperature?: number;
  theme?: string;
  style?: string;
}

export interface LLMStrategy {
  generateSongLine(context: Context, prompt: string, options?: LLMGenerationOptions): Promise<string>;
  enhanceLine(context: Context, line: string, options?: LLMGenerationOptions): Promise<string>;
  generateVerse(context: Context, theme: string, existingLines: string[], options?: LLMGenerationOptions): Promise<string[]>;
}