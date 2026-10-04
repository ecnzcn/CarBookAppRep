import { beforeEach, describe, expect, it } from 'vitest';
import { CarBookDatabase } from '../db/db';
import { createVehicleRepository } from '../repositories/vehicleRepository';
import { createVehicleService, VehicleValidationError, type VehicleInput } from './vehicleService';

function makeInput(overrides: Partial<VehicleInput> = {}): VehicleInput {
  return {
    manufacturer: 'Honda',
    model: 'Civic',
    currentMileage: 5000,
    ...overrides,
  };
}

describe('vehicleService', () => {
  let service: ReturnType<typeof createVehicleService>;

  beforeEach(() => {
    const db = new CarBookDatabase(`test-vehicle-service-${Math.random()}`);
    service = createVehicleService(createVehicleRepository(db));
  });

  it('creates a vehicle with generated id and timestamps', async () => {
    const vehicle = await service.create(makeInput());

    expect(vehicle.id).toBeTruthy();
    expect(vehicle.createdAt).toBeTruthy();
    expect(vehicle.updatedAt).toBe(vehicle.createdAt);
    expect(vehicle.manufacturer).toBe('Honda');

    const stored = await service.get(vehicle.id);
    expect(stored).toEqual(vehicle);
  });

  it('rejects a vehicle without a manufacturer', async () => {
    await expect(service.create(makeInput({ manufacturer: '  ' }))).rejects.toBeInstanceOf(
      VehicleValidationError,
    );
  });

  it('rejects a vehicle without a model', async () => {
    await expect(service.create(makeInput({ model: '' }))).rejects.toBeInstanceOf(
      VehicleValidationError,
    );
  });

  it('rejects a negative mileage', async () => {
    await expect(
      service.create(makeInput({ currentMileage: -1 })),
    ).rejects.toBeInstanceOf(VehicleValidationError);
  });

  it('updates a vehicle and bumps updatedAt', async () => {
    const vehicle = await service.create(makeInput());
    const before = vehicle.updatedAt;

    await new Promise((resolve) => setTimeout(resolve, 5));
    await service.update(vehicle.id, makeInput({ currentMileage: 8000 }));

    const updated = await service.get(vehicle.id);
    expect(updated?.currentMileage).toBe(8000);
    expect(updated?.updatedAt).not.toBe(before);
    expect(updated?.createdAt).toBe(vehicle.createdAt);
  });

  it('lists all vehicles and removes one', async () => {
    const a = await service.create(makeInput({ manufacturer: 'Honda' }));
    const b = await service.create(makeInput({ manufacturer: 'Mazda' }));

    await expect(service.list()).resolves.toHaveLength(2);

    await service.remove(a.id);

    const remaining = await service.list();
    expect(remaining.map((v) => v.id)).toEqual([b.id]);
  });
});
