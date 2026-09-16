import type { CarBookDatabase } from '../db/db';
import { db as defaultDb } from '../db/db';
import type { TireSet } from '../db/types';

export interface TireSetRepository {
  getByVehicle(vehicleId: string): Promise<TireSet[]>;
  getById(id: string): Promise<TireSet | undefined>;
  add(set: TireSet): Promise<void>;
  update(id: string, changes: Partial<TireSet>): Promise<void>;
  remove(id: string): Promise<void>;
}

export function createTireSetRepository(database: CarBookDatabase = defaultDb): TireSetRepository {
  return {
    async getByVehicle(vehicleId) {
      return database.tireSets.where('vehicleId').equals(vehicleId).sortBy('createdAt');
    },
    async getById(id) {
      return database.tireSets.get(id);
    },
    async add(set) {
      await database.tireSets.add(set);
    },
    async update(id, changes) {
      await database.tireSets.update(id, changes);
    },
    async remove(id) {
      await database.tireSets.delete(id);
    },
  };
}

export const tireSetRepository = createTireSetRepository();
