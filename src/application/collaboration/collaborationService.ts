import { SessionService } from '../session/sessionService';
import { Participant, buildParticipantEntity } from '../../domain/participant/participantModel';
import { SongLine } from '../../domain/songLine/songLineModel';
import { Context } from '../../types';

export interface CollaborationEvent {
  type: 'participant_joined' | 'participant_left' | 'song_line_added' | 'song_lines_reordered' | 'session_completed';
  sessionId: string;
  participantId?: string;
  participant?: Participant;
  songLine?: SongLine;
  lineIds?: string[];
  exportResult?: any;
  data?: any;
  timestamp: Date;
}

export interface CollaborationService {
  joinSession(context: Context, sessionId: string, participantName: string): Promise<Participant>;
  leaveSession(context: Context, sessionId: string, participantId: string): Promise<void>;
  addSongLineRealtime(context: Context, sessionId: string, prompt: string): Promise<SongLine>;
  reorderLinesRealtime(context: Context, sessionId: string, lineIds: string[]): Promise<string[]>;
  completeSessionRealtime(context: Context, sessionId: string): Promise<any>;
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
      participant,
      timestamp: new Date()
    });

    return participant;
  }

  async leaveSession(context: Context, sessionId: string, participantId: string): Promise<void> {
    // Broadcast participant left event
    await this.broadcastEvent(sessionId, {
      type: 'participant_left',
      sessionId,
      participantId,
      timestamp: new Date()
    });
  }

  async addSongLineRealtime(context: Context, sessionId: string, prompt: string): Promise<SongLine> {
    // Add song line through session service
    const updatedSession = await this.sessionService.addSongLine(context, sessionId, prompt);
    const newSongLine = updatedSession.songLines[updatedSession.songLines.length - 1];

    // Broadcast song line added event
    await this.broadcastEvent(sessionId, {
      type: 'song_line_added',
      sessionId,
      songLine: newSongLine,
      timestamp: new Date()
    });

    return newSongLine;
  }

  async reorderLinesRealtime(context: Context, sessionId: string, lineIds: string[]): Promise<string[]> {
    // Reorder lines through session service
    await this.sessionService.reorderLines(context, sessionId, lineIds);

    // Broadcast lines reordered event
    await this.broadcastEvent(sessionId, {
      type: 'song_lines_reordered',
      sessionId,
      lineIds,
      timestamp: new Date()
    });

    return lineIds;
  }

  async completeSessionRealtime(context: Context, sessionId: string): Promise<any> {
    // Complete session through session service
    const exportResult = await this.sessionService.exportToSono(context, sessionId);

    // Broadcast session completed event
    await this.broadcastEvent(sessionId, {
      type: 'session_completed',
      sessionId,
      exportResult,
      timestamp: new Date()
    });

    return exportResult;
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