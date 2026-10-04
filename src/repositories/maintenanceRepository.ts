import type { CarBookDatabase } from '../db/db';
import { db as defaultDb } from '../db/db';
import type { Maintenance } from '../db/types';

export interface MaintenanceRepository {
  getByVehicle(vehicleId: string): Promise<Maintenance[]>;
  getById(id: string): Promise<Maintenance | undefined>;
  add(entry: Maintenance): Promise<void>;
  update(id: string, changes: Partial<Maintenance>): Promise<void>;
  remove(id: string): Promise<void>;
}

export function createMaintenanceRepository(
  database: CarBookDatabase = defaultDb,
): MaintenanceRepository {
  return {
    async getByVehicle(vehicleId) {
      return database.maintenance.where('vehicleId').equals(vehicleId).sortBy('date');
    },
    async getById(id) {
      return database.maintenance.get(id);
    },
    async add(entry) {
      await database.maintenance.add(entry);
    },
    async update(id, changes) {
      await database.maintenance.update(id, changes);
    },
    async remove(id) {
      await database.maintenance.delete(id);
    },
  };
}

export const maintenanceRepository = createMaintenanceRepository();
