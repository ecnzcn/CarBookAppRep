import type { CarBookDatabase } from '../db/db';
import { db as defaultDb } from '../db/db';
import type { Vehicle } from '../db/types';

export interface VehicleRepository {
  getAll(): Promise<Vehicle[]>;
  getById(id: string): Promise<Vehicle | undefined>;
  add(vehicle: Vehicle): Promise<void>;
  update(id: string, changes: Partial<Vehicle>): Promise<void>;
  remove(id: string): Promise<void>;
}

export function createVehicleRepository(database: CarBookDatabase = defaultDb): VehicleRepository {
  return {
    async getAll() {
      return database.vehicles.orderBy('createdAt').toArray();
    },
    async getById(id) {
      return database.vehicles.get(id);
    },
    async add(vehicle) {
      await database.vehicles.add(vehicle);
    },
    async update(id, changes) {
      await database.vehicles.update(id, changes);
    },
    async remove(id) {
      await database.vehicles.delete(id);
    },
  };
}

export const vehicleRepository = createVehicleRepository();
