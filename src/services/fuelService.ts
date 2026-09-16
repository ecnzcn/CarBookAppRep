import type { FuelRepository } from '../repositories/fuelRepository';
import { fuelRepository } from '../repositories/fuelRepository';
import type { VehicleService } from './vehicleService';
import { vehicleService } from './vehicleService';
import type { FuelEntry } from '../db/types';
import { generateId } from './id';

export interface FuelInput {
  vehicleId: string;
  date: string;
  mileage: number;
  liters: number;
  pricePerLiter: number;
  totalCost: number;
  station?: string;
  notes?: string;
}

export class FuelValidationError extends Error {}

function assertValid(input: FuelInput) {
  if (!input.vehicleId) {
    throw new FuelValidationError('A vehicle is required.');
  }
  if (!input.date) {
    throw new FuelValidationError('Date is required.');
  }
  if (!Number.isFinite(input.mileage) || input.mileage < 0) {
    throw new FuelValidationError('Mileage must be a non-negative number.');
  }
  if (!Number.isFinite(input.liters) || input.liters <= 0) {
    throw new FuelValidationError('Liters must be greater than zero.');
  }
  if (!Number.isFinite(input.pricePerLiter) || input.pricePerLiter <= 0) {
    throw new FuelValidationError('Price per liter must be greater than zero.');
  }
  if (!Number.isFinite(input.totalCost) || input.totalCost < 0) {
    throw new FuelValidationError('Total cost cannot be negative.');
  }
}

export function createFuelService(
  repository: FuelRepository = fuelRepository,
  vehicles: VehicleService = vehicleService,
) {
  return {
    async listForVehicle(vehicleId: string): Promise<FuelEntry[]> {
      return repository.getByVehicle(vehicleId);
    },

    async get(id: string): Promise<FuelEntry | undefined> {
      return repository.getById(id);
    },

    async create(input: FuelInput): Promise<FuelEntry> {
      assertValid(input);
      const entry: FuelEntry = { ...input, id: generateId() };
      await repository.add(entry);
      await vehicles.bumpMileageIfHigher(input.vehicleId, input.mileage);
      return entry;
    },

    async update(id: string, input: FuelInput): Promise<void> {
      assertValid(input);
      await repository.update(id, input);
      await vehicles.bumpMileageIfHigher(input.vehicleId, input.mileage);
    },

    async remove(id: string): Promise<void> {
      await repository.remove(id);
    },
  };
}

export const fuelService = createFuelService();
