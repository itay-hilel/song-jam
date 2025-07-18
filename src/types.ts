
export interface Context {
  userId?: string;
  sessionId?: string;
  timestamp: Date;
}

export interface CreateSessionPayload {
  name: string;
  theme?: string;
  style?: string;
  duration?: number;
}

export interface ExportResult {
  success: boolean;
  message?: string;
  url?: string;
  data?: any;
}

export interface OpenAIAPIRequest {
  prompt: string;
  maxTokens: number;
  temperature: number;
}

export interface OpenAIAPIResponse {
  choices: Array<{ text: string }>;
}
