export type ParticipantId = string;

export interface Participant {
  id: ParticipantId;
  name: string;
  sessionId: string;
  joinedAt: Date;
}