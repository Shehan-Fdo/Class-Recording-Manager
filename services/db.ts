import Dexie, { type Table } from 'dexie';
import type { Subject } from '../types';

export class AppDatabase extends Dexie {
  subjects!: Table<Subject>;

  constructor() {
    super('youtubeClassManagerDatabase');
    this.version(1).stores({
      subjects: 'id', // Primary key
    });
  }
}

export const db = new AppDatabase();
