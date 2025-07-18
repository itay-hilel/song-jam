import { Participant, ParticipantId } from './participantTypes';

export function buildParticipantEntity(payload: {
  name: string;
  sessionId: string;
}): Participant {
  return {
    id: generateParticipantId(),
    name: payload.name.trim(),
    sessionId: payload.sessionId,
    joinedAt: new Date(),
  };
}

function generateParticipantId(): ParticipantId {
  return 'participant_' + Math.random().toString(36).substring(2, 15);
}

// Re-export the types for convenience
export { Participant, ParticipantId };