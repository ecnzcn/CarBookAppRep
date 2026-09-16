import { beforeEach, describe, expect, it } from 'vitest';
import { CarBookDatabase } from '../db/db';
import { createVehicleRepository } from '../repositories/vehicleRepository';
import { createVehicleService } from './vehicleService';
import { createFuelRepository } from '../repositories/fuelRepository';
import { createFuelService, FuelValidationError, type FuelInput } from './fuelService';

function makeInput(vehicleId: string, overrides: Partial<FuelInput> = {}): FuelInput {
  return {
    vehicleId,
    date: '2026-01-01',
    mileage: 10500,
    liters: 35,
    pricePerLiter: 1.8,
    totalCost: 63,
    ...overrides,
  };
}

describe('fuelService', () => {
  let vehicleId: string;
  let vehicles: ReturnType<typeof createVehicleService>;
  let fuel: ReturnType<typeof createFuelService>;

  beforeEach(async () => {
    const db = new CarBookDatabase(`test-fuel-${Math.random()}`);
    vehicles = createVehicleService(createVehicleRepository(db));
    fuel = createFuelService(createFuelRepository(db), vehicles);

    const vehicle = await vehicles.create({ manufacturer: 'Opel', model: 'Astra', currentMileage: 10000 });
    vehicleId = vehicle.id;
  });

  it('rejects zero liters', async () => {
    await expect(fuel.create(makeInput(vehicleId, { liters: 0 }))).rejects.toBeInstanceOf(
      FuelValidationError,
    );
  });

  it('rejects a negative total cost', async () => {
    await expect(fuel.create(makeInput(vehicleId, { totalCost: -1 }))).rejects.toBeInstanceOf(
      FuelValidationError,
    );
  });

  it('bumps the vehicle mileage on a new fill-up', async () => {
    await fuel.create(makeInput(vehicleId, { mileage: 10500 }));
    const vehicle = await vehicles.get(vehicleId);
    expect(vehicle?.currentMileage).toBe(10500);
  });
});
