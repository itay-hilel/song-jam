import { SongLine } from '../../../domain/songLine/songLineModel';
import { SongLineId } from '../../../domain/songLine/songLineTypes';
import { SongLineRepository } from '../../../application/songLine/songLineRepository';

export class MemorySongLineAdapter implements SongLineRepository {
    // Map sessionId -> songLineId -> songLine
    private sessionSongLines: Map<string, Map<SongLineId, SongLine>> = new Map();

    async addSongLine(sessionId: string, line: SongLine): Promise<SongLine> {
        if (!this.sessionSongLines.has(sessionId)) {
            this.sessionSongLines.set(sessionId, new Map());
        }
        
        const sessionLines = this.sessionSongLines.get(sessionId)!;
        sessionLines.set(line.id, line);
        return line;
    }

    async getSongLines(sessionId: string): Promise<SongLine[]> {
        const sessionLines = this.sessionSongLines.get(sessionId);
        if (!sessionLines) {
            return [];
        }
        
        return Array.from(sessionLines.values())
            .sort((a, b) => a.order - b.order);
    }

    async updateSongLine(sessionId: string, lineId: string, updatedLine: SongLine): Promise<SongLine> {
        const sessionLines = this.sessionSongLines.get(sessionId);
        if (!sessionLines || !sessionLines.has(lineId)) {
            throw new Error(`Song line ${lineId} not found in session ${sessionId}`);
        }
        
        sessionLines.set(lineId, updatedLine);
        return updatedLine;
    }

    async deleteSongLine(sessionId: string, lineId: string): Promise<void> {
        const sessionLines = this.sessionSongLines.get(sessionId);
        if (sessionLines) {
            sessionLines.delete(lineId);
        }
    }

    async reorderSongLines(sessionId: string, lineIds: string[]): Promise<SongLine[]> {
        const sessionLines = this.sessionSongLines.get(sessionId);
        if (!sessionLines) {
            return [];
        }

        const reorderedLines: SongLine[] = [];
        lineIds.forEach((lineId, index) => {
            const line = sessionLines.get(lineId);
            if (line) {
                line.order = index;
                line.updatedAt = new Date();
                reorderedLines.push(line);
            }
        });

        return reorderedLines;
    }

    // Helper method for cleanup
    async clearSession(sessionId: string): Promise<void> {
        this.sessionSongLines.delete(sessionId);
    }

    // Helper method for getting all data (useful for debugging)
    async getAllSessionData(): Promise<Map<string, SongLine[]>> {
        const result = new Map<string, SongLine[]>();
        for (const [sessionId, sessionLines] of this.sessionSongLines.entries()) {
            result.set(sessionId, Array.from(sessionLines.values()));
        }
        return result;
    }
}