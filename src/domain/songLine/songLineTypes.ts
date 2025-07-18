export type SongLineId = string;

export interface SongLine {
  id: SongLineId;
  content: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}