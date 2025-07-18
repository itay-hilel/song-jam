import { Session } from '../../domain/session/sessionModel';
import { SessionStatus } from '../../domain/session/sessionTypes';
import { Participant } from '../../domain/participant/participantModel';
import { SongLine } from '../../domain/songLine/songLineModel';

export class SessionEntity {
  id: string;
  name: string;
  participants: Participant[];
  songLines: SongLine[];
  status: SessionStatus;
  theme?: string;
  style?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(session: Session) {
    this.id = session.id;
    this.name = session.name;
    this.participants = session.participants;
    this.songLines = session.songLines;
    this.status = session.status;
    this.theme = session.theme;
    this.style = session.style;
    this.createdAt = session.createdAt;
    this.updatedAt = session.updatedAt;
  }

  addParticipant(participant: Participant): void {
    // Check if participant already exists
    const existingParticipant = this.participants.find(p => p.id === participant.id);
    if (!existingParticipant) {
      this.participants.push(participant);
      this.updatedAt = new Date();
    }
  }

  removeParticipant(participantId: string): void {
    this.participants = this.participants.filter(p => p.id !== participantId);
    this.updatedAt = new Date();
  }

  addSongLine(line: SongLine): void {
    this.songLines.push(line);
    this.updatedAt = new Date();
  }

  reorderSongLines(lineIds: string[]): void {
    const reorderedLines = lineIds
      .map(id => this.songLines.find(line => line.id === id))
      .filter(Boolean) as SongLine[];
    
    this.songLines = reorderedLines;
    this.updatedAt = new Date();
  }

  completeSession(): void {
    this.status = SessionStatus.COMPLETED;
    this.updatedAt = new Date();
  }

  archiveSession(): void {
    this.status = SessionStatus.ARCHIVED;
    this.updatedAt = new Date();
  }

  toSession(): Session {
    return {
      id: this.id,
      name: this.name,
      participants: this.participants,
      songLines: this.songLines,
      status: this.status,
      theme: this.theme,
      style: this.style,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}