import { SongLine, SongLineId } from './songLineTypes';

export function buildSongLineEntity(content: string, order?: number): SongLine {
  const now = new Date();
  return {
    id: generateSongLineId(),
    content: content.trim(),
    order: order || 0,
    createdAt: now,
    updatedAt: now,
  };
}

function generateSongLineId(): SongLineId {
  return 'line_' + Math.random().toString(36).substring(2, 15);
}

// Re-export the types for convenience
export { SongLine, SongLineId };