import { Session } from '../../../domain/session/sessionModel';
import { SessionRepository } from '../../../application/session/sessionRepository';

export class MemorySessionAdapter implements SessionRepository {
    private sessions: Map<string, Session> = new Map();

    async createSession(session: Session): Promise<Session> {
        this.sessions.set(session.id, session);
        return session;
    }

    async getSessionById(sessionId: string): Promise<Session | null> {
        return this.sessions.get(sessionId) || null;
    }

    async updateSession(session: Session): Promise<Session> {
        this.sessions.set(session.id, session);
        return session;
    }

    async deleteSession(sessionId: string): Promise<void> {
        this.sessions.delete(sessionId);
    }

    async getAllSessions(): Promise<Session[]> {
        return Array.from(this.sessions.values());
    }
}