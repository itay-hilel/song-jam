// src/infrastructure/database/postgres/songLineAdapter.ts
import { SongLine } from '../../../domain/songLine/songLineModel';
import { SongLineRepository } from '../../../application/songLine/songLineRepository';
import { Pool } from 'pg';

export class PostgresSongLineAdapter implements SongLineRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async create(songLine: SongLine): Promise<SongLine> {
        const result = await this.pool.query(
            'INSERT INTO song_lines (id, content, session_id) VALUES ($1, $2, $3) RETURNING *',
            [songLine.id, songLine.content, songLine.sessionId]
        );
        return result.rows[0];
    }

    async findById(id: string): Promise<SongLine | null> {
        const result = await this.pool.query('SELECT * FROM song_lines WHERE id = $1', [id]);
        return result.rows.length ? result.rows[0] : null;
    }

    async update(songLine: SongLine): Promise<SongLine> {
        const result = await this.pool.query(
            'UPDATE song_lines SET content = $1 WHERE id = $2 RETURNING *',
            [songLine.content, songLine.id]
        );
        return result.rows[0];
    }

    async delete(id: string): Promise<void> {
        await this.pool.query('DELETE FROM song_lines WHERE id = $1', [id]);
    }

    async findBySessionId(sessionId: string): Promise<SongLine[]> {
        const result = await this.pool.query('SELECT * FROM song_lines WHERE session_id = $1', [sessionId]);
        return result.rows;
    }
}