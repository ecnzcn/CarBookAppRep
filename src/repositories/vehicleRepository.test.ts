import { beforeEach, describe, expect, it } from 'vitest';
import { CarBookDatabase } from '../db/db';
import { createVehicleRepository, type VehicleRepository } from './vehicleRepository';
import type { Vehicle } from '../db/types';

function makeVehicle(overrides: Partial<Vehicle> = {}): Vehicle {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    manufacturer: 'Toyota',
    model: 'Corolla',
    currentMileage: 10000,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('vehicleRepository', () => {
  let db: CarBookDatabase;
  let repository: VehicleRepository;

  beforeEach(() => {
    db = new CarBookDatabase(`test-vehicle-repo-${Math.random()}`);
    repository = createVehicleRepository(db);
  });

  it('returns an empty list when no vehicles exist', async () => {
    await expect(repository.getAll()).resolves.toEqual([]);
  });

  it('adds and retrieves a vehicle', async () => {
    const vehicle = makeVehicle();
    await repository.add(vehicle);

    await expect(repository.getById(vehicle.id)).resolves.toEqual(vehicle);
    await expect(repository.getAll()).resolves.toEqual([vehicle]);
  });

  it('updates a vehicle', async () => {
    const vehicle = makeVehicle();
    await repository.add(vehicle);

    await repository.update(vehicle.id, { currentMileage: 20000 });

    const updated = await repository.getById(vehicle.id);
    expect(updated?.currentMileage).toBe(20000);
  });

  it('removes a vehicle', async () => {
    const vehicle = makeVehicle();
    await repository.add(vehicle);

    await repository.remove(vehicle.id);

    await expect(repository.getById(vehicle.id)).resolves.toBeUndefined();
  });
});
