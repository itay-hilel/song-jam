import { SessionService } from '../session/sessionService';
import { Participant, buildParticipantEntity } from '../../domain/participant/participantModel';
import { Context } from '../../types';

export interface CollaborationEvent {
  type: 'participant_joined' | 'participant_left' | 'song_line_added' | 'song_lines_reordered' | 'session_completed';
  sessionId: string;
  participantId?: string;
  data?: any;
  timestamp: Date;
}

export interface CollaborationService {
  joinSession(context: Context, sessionId: string, participantName: string): Promise<Participant>;
  leaveSession(context: Context, sessionId: string, participantId: string): Promise<void>;
  broadcastEvent(sessionId: string, event: CollaborationEvent): Promise<void>;
  getSessionParticipants(context: Context, sessionId: string): Promise<Participant[]>;
}

export class DefaultCollaborationService implements CollaborationService {
  constructor(
    private sessionService: SessionService,
    private eventBroadcaster?: (sessionId: string, event: CollaborationEvent) => Promise<void>
  ) {}

  async joinSession(context: Context, sessionId: string, participantName: string): Promise<Participant> {
    const participant = buildParticipantEntity({
      name: participantName,
      sessionId: sessionId
    });

    const session = await this.sessionService.join(context, sessionId, participant);
    
    // Broadcast participant joined event
    await this.broadcastEvent(sessionId, {
      type: 'participant_joined',
      sessionId,
      participantId: participant.id,
      data: { participant },
      timestamp: new Date()
    });

    return participant;
  }

  async leaveSession(context: Context, sessionId: string, participantId: string): Promise<void> {
    // Note: We'd need to add a removeParticipant method to SessionService for this
    // For now, we'll just broadcast the event
    await this.broadcastEvent(sessionId, {
      type: 'participant_left',
      sessionId,
      participantId,
      timestamp: new Date()
    });
  }

  async broadcastEvent(sessionId: string, event: CollaborationEvent): Promise<void> {
    if (this.eventBroadcaster) {
      await this.eventBroadcaster(sessionId, event);
    }
  }

  async getSessionParticipants(context: Context, sessionId: string): Promise<Participant[]> {
    const session = await this.sessionService.getSession(context, sessionId);
    return session?.participants || [];
  }
}