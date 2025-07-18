import { ExportResult } from '../../types';

export interface ExportStrategy {
  exportSong(sessionId: string): Promise<ExportResult>;
}