import type { CarBookDatabase } from '../db/db';
import { db as defaultDb } from '../db/db';
import type { TireEvent } from '../db/types';

export interface TireEventRepository {
  getByTireSet(tireSetId: string): Promise<TireEvent[]>;
  getById(id: string): Promise<TireEvent | undefined>;
  add(event: TireEvent): Promise<void>;
  update(id: string, changes: Partial<TireEvent>): Promise<void>;
  remove(id: string): Promise<void>;
}

export function createTireEventRepository(
  database: CarBookDatabase = defaultDb,
): TireEventRepository {
  return {
    async getByTireSet(tireSetId) {
      return database.tireEvents.where('tireSetId').equals(tireSetId).sortBy('date');
    },
    async getById(id) {
      return database.tireEvents.get(id);
    },
    async add(event) {
      await database.tireEvents.add(event);
    },
    async update(id, changes) {
      await database.tireEvents.update(id, changes);
    },
    async remove(id) {
      await database.tireEvents.delete(id);
    },
  };
}

export const tireEventRepository = createTireEventRepository();
