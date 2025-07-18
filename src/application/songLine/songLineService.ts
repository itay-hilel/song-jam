import { SongLine, buildSongLineEntity } from '../../domain/songLine/songLineModel';
import { SongLineRepository } from './songLineRepository';
import { Context } from '../../types';

export interface SongLineService {
  addSongLine(context: Context, sessionId: string, content: string): Promise<SongLine>;
  getSongLines(context: Context, sessionId: string): Promise<SongLine[]>;
  updateSongLine(context: Context, sessionId: string, lineId: string, content: string): Promise<SongLine>;
  deleteSongLine(context: Context, sessionId: string, lineId: string): Promise<void>;
  reorderSongLines(context: Context, sessionId: string, lineIds: string[]): Promise<SongLine[]>;
}

export class DefaultSongLineService implements SongLineService {
  constructor(private repository: SongLineRepository) {}

  async addSongLine(context: Context, sessionId: string, content: string): Promise<SongLine> {
    const songLine = buildSongLineEntity(content);
    return this.repository.addSongLine(sessionId, songLine);
  }

  async getSongLines(context: Context, sessionId: string): Promise<SongLine[]> {
    return this.repository.getSongLines(sessionId);
  }

  async updateSongLine(context: Context, sessionId: string, lineId: string, content: string): Promise<SongLine> {
    const updatedLine = buildSongLineEntity(content);
    updatedLine.id = lineId; // Keep the same ID
    updatedLine.updatedAt = new Date();
    return this.repository.updateSongLine(sessionId, lineId, updatedLine);
  }

  async deleteSongLine(context: Context, sessionId: string, lineId: string): Promise<void> {
    return this.repository.deleteSongLine(sessionId, lineId);
  }

  async reorderSongLines(context: Context, sessionId: string, lineIds: string[]): Promise<SongLine[]> {
    return this.repository.reorderSongLines(sessionId, lineIds);
  }
}