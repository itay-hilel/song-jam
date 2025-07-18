import { ExportStrategy } from './exportStrategy';
import { ExportResult } from '../../types';

export class MockExportStrategy implements ExportStrategy {
  async exportSong(sessionId: string): Promise<ExportResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: `Mock export completed for session ${sessionId}`,
      url: `http://localhost:3000/mock-song-${sessionId}.mp3`,
      data: {
        sessionId,
        exportedAt: new Date().toISOString(),
        format: 'mp3',
        duration: '3:45'
      }
    };
  }
}
