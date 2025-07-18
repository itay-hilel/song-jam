import { SongLine } from '../../domain/songLine/songLineModel';
import { SongLineId } from '../../domain/songLine/songLineTypes';

export class SongLineEntity implements SongLine {
  id: SongLineId;
  content: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(songLine: SongLine) {
    this.id = songLine.id;
    this.content = songLine.content;
    this.order = songLine.order;
    this.createdAt = songLine.createdAt;
    this.updatedAt = songLine.updatedAt;
  }

  updateContent(newContent: string): void {
    this.content = newContent.trim();
    this.updatedAt = new Date();
  }

  updateOrder(newOrder: number): void {
    this.order = newOrder;
    this.updatedAt = new Date();
  }

  toSongLine(): SongLine {
    return {
      id: this.id,
      content: this.content,
      order: this.order,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}