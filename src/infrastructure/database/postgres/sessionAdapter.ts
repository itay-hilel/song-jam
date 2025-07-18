import { Pool } from 'pg';
import { Session } from '../../../domain/session/sessionModel';
import { SessionRepository } from '../../../application/session/sessionRepository';

export class PostgresSessionAdapter implements SessionRepository {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
    });
  }

  async createSession(session: Session): Promise<Session> {
    const result = await this.pool.query(
      'INSERT INTO sessions (name, participants, song_lines, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [session.name, session.participants, session.songLines, session.status, session.createdAt, session.updatedAt]
    );
    return result.rows[0];
  }

  async getSessionById(sessionId: string): Promise<Session | null> {
    const result = await this.pool.query('SELECT * FROM sessions WHERE id = $1', [sessionId]);
    return result.rows.length ? result.rows[0] : null;
  }

  async updateSession(session: Session): Promise<Session> {
    const result = await this.pool.query(
      'UPDATE sessions SET name = $1, participants = $2, song_lines = $3, status = $4, updated_at = $5 WHERE id = $6 RETURNING *',
      [session.name, session.participants, session.songLines, session.status, session.updatedAt, session.id]
    );
    return result.rows[0];
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.pool.query('DELETE FROM sessions WHERE id = $1', [sessionId]);
  }

  async getAllSessions(): Promise<Session[]> {
    const result = await this.pool.query('SELECT * FROM sessions ORDER BY created_at DESC');
    return result.rows;
  }
}