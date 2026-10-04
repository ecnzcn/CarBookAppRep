import { beforeEach, describe, expect, it } from 'vitest';
import { CarBookDatabase } from '../db/db';
import { createVehicleRepository } from '../repositories/vehicleRepository';
import { createVehicleService } from './vehicleService';
import { createTireSetRepository } from '../repositories/tireSetRepository';
import { createTireEventRepository } from '../repositories/tireEventRepository';
import { createTireService, TireValidationError } from './tireService';

describe('tireService', () => {
  let vehicleId: string;
  let vehicles: ReturnType<typeof createVehicleService>;
  let tires: ReturnType<typeof createTireService>;

  beforeEach(async () => {
    const db = new CarBookDatabase(`test-tire-${Math.random()}`);
    vehicles = createVehicleService(createVehicleRepository(db));
    tires = createTireService(createTireSetRepository(db), createTireEventRepository(db), vehicles);

    const vehicle = await vehicles.create({ manufacturer: 'Skoda', model: 'Octavia', currentMileage: 20000 });
    vehicleId = vehicle.id;
  });

  it('rejects a negative tread depth', async () => {
    await expect(
      tires.sets.create({ vehicleId, season: 'winter', treadDepth: -1 }),
    ).rejects.toBeInstanceOf(TireValidationError);
  });

  it('creates a tire set and lists it for the vehicle', async () => {
    await tires.sets.create({ vehicleId, season: 'winter', manufacturer: 'Michelin' });
    const sets = await tires.sets.listForVehicle(vehicleId);
    expect(sets).toHaveLength(1);
    expect(sets[0].manufacturer).toBe('Michelin');
  });

  it('logs a mount event and bumps vehicle mileage', async () => {
    const set = await tires.sets.create({ vehicleId, season: 'winter' });
    await tires.events.create({ tireSetId: set.id, date: '2026-01-01', mileage: 21000, action: 'mounted' }, vehicleId);

    const events = await tires.events.listForSet(set.id);
    expect(events).toHaveLength(1);

    const vehicle = await vehicles.get(vehicleId);
    expect(vehicle?.currentMileage).toBe(21000);
  });

  it('removes a tire set together with its events', async () => {
    const set = await tires.sets.create({ vehicleId, season: 'summer' });
    await tires.events.create({ tireSetId: set.id, date: '2026-01-01', action: 'mounted' }, vehicleId);

    await tires.sets.remove(set.id);

    expect(await tires.sets.listForVehicle(vehicleId)).toHaveLength(0);
    expect(await tires.events.listForSet(set.id)).toHaveLength(0);
  });
});
