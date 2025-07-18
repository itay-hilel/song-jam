import { SongLine } from '../../domain/songLine/songLineModel';

export interface SongLineRepository {
  addSongLine(sessionId: string, line: SongLine): Promise<SongLine>;
  getSongLines(sessionId: string): Promise<SongLine[]>;
  updateSongLine(sessionId: string, lineId: string, updatedLine: SongLine): Promise<SongLine>;
  deleteSongLine(sessionId: string, lineId: string): Promise<void>;
  reorderSongLines(sessionId: string, lineIds: string[]): Promise<SongLine[]>;
}