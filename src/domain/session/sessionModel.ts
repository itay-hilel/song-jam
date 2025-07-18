import { SessionId, SessionStatus } from './sessionTypes';
import { Participant } from '../participant/participantModel';
import { SongLine } from '../songLine/songLineModel';

export interface Session {
  id: SessionId;
  name: string;
  participants: Participant[];
  songLines: SongLine[];
  status: SessionStatus;
  theme?: string;
  style?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function buildSessionEntity(payload: {
  name: string;
  theme?: string;
  style?: string;
}): Session {
  const now = new Date();
  return {
    id: generateSessionId(),
    name: payload.name,
    participants: [],
    songLines: [],
    status: SessionStatus.ACTIVE,
    theme: payload.theme,
    style: payload.style,
    createdAt: now,
    updatedAt: now,
  };
}

export function checkSessionInvariants(session: Session): void {
  if (!session.name || session.name.trim().length === 0) {
    throw new Error('Session name cannot be empty');
  }
  if (session.participants.length > 20) {
    throw new Error('Session cannot have more than 20 participants');
  }
}

function generateSessionId(): SessionId {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}