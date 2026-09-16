import type { CarBookDatabase } from '../db/db';
import { db as defaultDb } from '../db/db';
import type { FuelEntry } from '../db/types';

export interface FuelRepository {
  getByVehicle(vehicleId: string): Promise<FuelEntry[]>;
  getById(id: string): Promise<FuelEntry | undefined>;
  add(entry: FuelEntry): Promise<void>;
  update(id: string, changes: Partial<FuelEntry>): Promise<void>;
  remove(id: string): Promise<void>;
}

export function createFuelRepository(database: CarBookDatabase = defaultDb): FuelRepository {
  return {
    async getByVehicle(vehicleId) {
      return database.fuelEntries.where('vehicleId').equals(vehicleId).sortBy('date');
    },
    async getById(id) {
      return database.fuelEntries.get(id);
    },
    async add(entry) {
      await database.fuelEntries.add(entry);
    },
    async update(id, changes) {
      await database.fuelEntries.update(id, changes);
    },
    async remove(id) {
      await database.fuelEntries.delete(id);
    },
  };
}

export const fuelRepository = createFuelRepository();
