import { Session, buildSessionEntity, checkSessionInvariants } from '../../domain/session/sessionModel';
import { Participant } from '../../domain/participant/participantModel';
import { SongLine, buildSongLineEntity } from '../../domain/songLine/songLineModel';
import { SessionRepository } from './sessionRepository';
import { LLMStrategy } from '../../strategy/llm/llmStrategy';
import { ExportStrategy } from '../../strategy/export/exportStrategy';
import { Context, CreateSessionPayload, ExportResult } from '../../types';

export interface SessionService {
  create(context: Context, payload: CreateSessionPayload): Promise<Session>;
  join(context: Context, sessionId: string, participant: Participant): Promise<Session>;
  addSongLine(context: Context, sessionId: string, prompt: string): Promise<Session>;
  reorderLines(context: Context, sessionId: string, lineIds: string[]): Promise<Session>;
  exportToSono(context: Context, sessionId: string): Promise<ExportResult>;
  getSession(context: Context, sessionId: string): Promise<Session | null>;
}

export class DefaultSessionService implements SessionService {
  constructor(
    private sessionRepository: SessionRepository,
    private llmStrategy: LLMStrategy,
    private exportStrategy: ExportStrategy
  ) {}

  async create(context: Context, payload: CreateSessionPayload): Promise<Session> {
    const session = buildSessionEntity(payload);
    checkSessionInvariants(session);
    return await this.sessionRepository.createSession(session);
  }

  async join(context: Context, sessionId: string, participant: Participant): Promise<Session> {
    const session = await this.sessionRepository.getSessionById(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Check if participant already exists
    const existingParticipant = session.participants.find((p: Participant) => p.id === participant.id);
    if (existingParticipant) {
      return session;
    }

    session.participants.push(participant);
    session.updatedAt = new Date();
    
    return await this.sessionRepository.updateSession(session);
  }

  async addSongLine(context: Context, sessionId: string, prompt: string): Promise<Session> {
    const session = await this.sessionRepository.getSessionById(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Generate song line using LLM
    const generatedText = await this.llmStrategy.generateSongLine(context, prompt, {
      theme: session.theme,
      style: session.style
    });
    
    const songLine = buildSongLineEntity(generatedText);
    session.songLines.push(songLine);
    session.updatedAt = new Date();

    return await this.sessionRepository.updateSession(session);
  }

  async reorderLines(context: Context, sessionId: string, lineIds: string[]): Promise<Session> {
    const session = await this.sessionRepository.getSessionById(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Reorder song lines based on provided IDs
    const reorderedLines = lineIds
      .map(id => session.songLines.find((line: SongLine) => line.id === id))
      .filter(Boolean) as SongLine[];

    session.songLines = reorderedLines;
    session.updatedAt = new Date();

    return await this.sessionRepository.updateSession(session);
  }

  async exportToSono(context: Context, sessionId: string): Promise<ExportResult> {
    return await this.exportStrategy.exportSong(sessionId);
  }

  async getSession(context: Context, sessionId: string): Promise<Session | null> {
    return await this.sessionRepository.getSessionById(sessionId);
  }
}