import { Session } from '../../domain/session/sessionModel';

export interface SessionRepository {
  createSession(session: Session): Promise<Session>;
  getSessionById(sessionId: string): Promise<Session | null>;
  updateSession(session: Session): Promise<Session>;
  deleteSession(sessionId: string): Promise<void>;
  getAllSessions(): Promise<Session[]>;
}