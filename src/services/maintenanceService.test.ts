import { beforeEach, describe, expect, it } from 'vitest';
import { CarBookDatabase } from '../db/db';
import { createVehicleRepository } from '../repositories/vehicleRepository';
import { createVehicleService } from './vehicleService';
import { createMaintenanceRepository } from '../repositories/maintenanceRepository';
import {
  createMaintenanceService,
  MaintenanceValidationError,
  type MaintenanceInput,
} from './maintenanceService';

function makeInput(vehicleId: string, overrides: Partial<MaintenanceInput> = {}): MaintenanceInput {
  return {
    vehicleId,
    date: '2026-01-01',
    mileage: 10000,
    type: 'maintenance',
    title: 'Oil change',
    ...overrides,
  };
}

describe('maintenanceService', () => {
  let vehicleId: string;
  let vehicles: ReturnType<typeof createVehicleService>;
  let maintenance: ReturnType<typeof createMaintenanceService>;

  beforeEach(async () => {
    const db = new CarBookDatabase(`test-maintenance-${Math.random()}`);
    vehicles = createVehicleService(createVehicleRepository(db));
    maintenance = createMaintenanceService(createMaintenanceRepository(db), vehicles);

    const vehicle = await vehicles.create({
      manufacturer: 'VW',
      model: 'Golf',
      currentMileage: 9000,
    });
    vehicleId = vehicle.id;
  });

  it('rejects an entry without a title', async () => {
    await expect(maintenance.create(makeInput(vehicleId, { title: '' }))).rejects.toBeInstanceOf(
      MaintenanceValidationError,
    );
  });

  it('rejects a next-due mileage before the entry mileage', async () => {
    await expect(
      maintenance.create(makeInput(vehicleId, { nextMileage: 5000 })),
    ).rejects.toBeInstanceOf(MaintenanceValidationError);
  });

  it('bumps the vehicle mileage when the entry mileage is higher', async () => {
    await maintenance.create(makeInput(vehicleId, { mileage: 12000 }));
    const vehicle = await vehicles.get(vehicleId);
    expect(vehicle?.currentMileage).toBe(12000);
  });

  it('does not lower the vehicle mileage for an older entry', async () => {
    await maintenance.create(makeInput(vehicleId, { mileage: 1000, date: '2020-01-01' }));
    const vehicle = await vehicles.get(vehicleId);
    expect(vehicle?.currentMileage).toBe(9000);
  });

  it('lists entries for a vehicle sorted by date', async () => {
    await maintenance.create(makeInput(vehicleId, { date: '2026-03-01', title: 'Second' }));
    await maintenance.create(makeInput(vehicleId, { date: '2026-01-01', title: 'First' }));

    const entries = await maintenance.listForVehicle(vehicleId);
    expect(entries.map((e) => e.title)).toEqual(['First', 'Second']);
  });
});
