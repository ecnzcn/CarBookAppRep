import type { VehicleRepository } from '../repositories/vehicleRepository';
import { vehicleRepository } from '../repositories/vehicleRepository';
import type { Vehicle } from '../db/types';
import { generateId } from './id';

export interface VehicleInput {
  manufacturer: string;
  model: string;
  series?: string;
  year?: number;
  engine?: string;
  fuelType?: Vehicle['fuelType'];
  transmission?: Vehicle['transmission'];
  drivetrain?: Vehicle['drivetrain'];
  vin?: string;
  licensePlate?: string;
  currentMileage: number;
  purchaseDate?: string;
  purchasePrice?: number;
  notes?: string;
}

export class VehicleValidationError extends Error {}

function assertValid(input: VehicleInput) {
  if (!input.manufacturer.trim()) {
    throw new VehicleValidationError('Manufacturer is required.');
  }
  if (!input.model.trim()) {
    throw new VehicleValidationError('Model is required.');
  }
  if (!Number.isFinite(input.currentMileage) || input.currentMileage < 0) {
    throw new VehicleValidationError('Current mileage must be a non-negative number.');
  }
}

export function createVehicleService(repository: VehicleRepository = vehicleRepository) {
  return {
    async list(): Promise<Vehicle[]> {
      return repository.getAll();
    },

    async get(id: string): Promise<Vehicle | undefined> {
      return repository.getById(id);
    },

    async create(input: VehicleInput): Promise<Vehicle> {
      assertValid(input);
      const now = new Date().toISOString();
      const vehicle: Vehicle = {
        ...input,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      await repository.add(vehicle);
      return vehicle;
    },

    async update(id: string, input: VehicleInput): Promise<void> {
      assertValid(input);
      await repository.update(id, {
        ...input,
        updatedAt: new Date().toISOString(),
      });
    },

    async remove(id: string): Promise<void> {
      await repository.remove(id);
    },

    /**
     * Records the highest mileage actually observed for a vehicle. Never
     * lowers it and never guesses — callers pass a reading they logged.
     */
    async bumpMileageIfHigher(id: string, mileage: number): Promise<void> {
      const vehicle = await repository.getById(id);
      if (!vehicle || mileage <= vehicle.currentMileage) return;
      await repository.update(id, { currentMileage: mileage, updatedAt: new Date().toISOString() });
    },
  };
}

export type VehicleService = ReturnType<typeof createVehicleService>;

export const vehicleService = createVehicleService();
