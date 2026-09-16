import type { MaintenanceRepository } from '../repositories/maintenanceRepository';
import { maintenanceRepository } from '../repositories/maintenanceRepository';
import type { VehicleService } from './vehicleService';
import { vehicleService } from './vehicleService';
import type { Maintenance } from '../db/types';
import { generateId } from './id';

export interface MaintenanceInput {
  vehicleId: string;
  date: string;
  mileage: number;
  type: Maintenance['type'];
  title: string;
  description?: string;
  cost?: number;
  workshop?: string;
  nextMileage?: number;
  nextDate?: string;
  notes?: string;
}

export class MaintenanceValidationError extends Error {}

function assertValid(input: MaintenanceInput) {
  if (!input.vehicleId) {
    throw new MaintenanceValidationError('A vehicle is required.');
  }
  if (!input.title.trim()) {
    throw new MaintenanceValidationError('Title is required.');
  }
  if (!input.date) {
    throw new MaintenanceValidationError('Date is required.');
  }
  if (!Number.isFinite(input.mileage) || input.mileage < 0) {
    throw new MaintenanceValidationError('Mileage must be a non-negative number.');
  }
  if (input.cost !== undefined && input.cost < 0) {
    throw new MaintenanceValidationError('Cost cannot be negative.');
  }
  if (input.nextMileage !== undefined && input.nextMileage < input.mileage) {
    throw new MaintenanceValidationError('Next due mileage cannot be before the entry mileage.');
  }
}

export function createMaintenanceService(
  repository: MaintenanceRepository = maintenanceRepository,
  vehicles: VehicleService = vehicleService,
) {
  return {
    async listForVehicle(vehicleId: string): Promise<Maintenance[]> {
      return repository.getByVehicle(vehicleId);
    },

    async get(id: string): Promise<Maintenance | undefined> {
      return repository.getById(id);
    },

    async create(input: MaintenanceInput): Promise<Maintenance> {
      assertValid(input);
      const now = new Date().toISOString();
      const entry: Maintenance = {
        ...input,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      await repository.add(entry);
      await vehicles.bumpMileageIfHigher(input.vehicleId, input.mileage);
      return entry;
    },

    async update(id: string, input: MaintenanceInput): Promise<void> {
      assertValid(input);
      await repository.update(id, { ...input, updatedAt: new Date().toISOString() });
      await vehicles.bumpMileageIfHigher(input.vehicleId, input.mileage);
    },

    async remove(id: string): Promise<void> {
      await repository.remove(id);
    },
  };
}

export const maintenanceService = createMaintenanceService();
