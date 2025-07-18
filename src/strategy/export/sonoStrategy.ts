import { ExportStrategy } from './exportStrategy';
import { ExportResult } from '../../types';
import { SonoClient } from '../../infrastructure/external/sonoClient';

export class SonoStrategy implements ExportStrategy {
  private sonoClient: SonoClient;

  constructor(sonoClient: SonoClient) {
    this.sonoClient = sonoClient;
  }

  async exportSong(sessionId: string): Promise<ExportResult> {
    try {
      // In a real implementation, we'd fetch the session data first
      const songData = {
        sessionId,
        title: `Song from session ${sessionId}`,
        // This would be populated from actual session data
      };
      
      const result = await this.sonoClient.generateSong(songData);
      
      return {
        success: true,
        message: 'Song exported successfully via Sono API',
        url: result.url,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to export song: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}