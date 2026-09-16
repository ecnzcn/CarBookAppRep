import { describe, expect, it } from 'vitest';
import { buildTimeline } from './timelineService';
import type { FuelEntry, Issue, Maintenance, TireEvent, TireSet } from '../db/types';

const maintenance: Maintenance = {
  id: 'm1',
  vehicleId: 'v1',
  date: '2026-02-01',
  mileage: 20000,
  type: 'maintenance',
  title: 'Oil change',
  cost: 80,
  createdAt: '2026-02-01T00:00:00.000Z',
  updatedAt: '2026-02-01T00:00:00.000Z',
};

const issue: Issue = {
  id: 'i1',
  vehicleId: 'v1',
  title: 'Klong beim Einlegen von D',
  date: '2026-03-01',
  status: 'open',
  severity: 'medium',
  updatedAt: '2026-03-01T00:00:00.000Z',
};

const fuel: FuelEntry = {
  id: 'f1',
  vehicleId: 'v1',
  date: '2026-01-15',
  mileage: 19500,
  liters: 40,
  pricePerLiter: 1.8,
  totalCost: 72,
};

const tireSet: TireSet = {
  id: 't1',
  vehicleId: 'v1',
  season: 'winter',
  createdAt: '2025-11-01T00:00:00.000Z',
};

const tireEvent: TireEvent = {
  id: 'e1',
  tireSetId: 't1',
  date: '2025-11-05',
  action: 'mounted',
};

describe('buildTimeline', () => {
  it('merges every source type and sorts most-recent-first', () => {
    const timeline = buildTimeline({
      maintenance: [maintenance],
      issues: [issue],
      fuel: [fuel],
      tireEvents: [tireEvent],
      tireSets: [tireSet],
    });

    expect(timeline.map((e) => e.id)).toEqual(['i1', 'm1', 'f1', 'e1']);
  });

  it('carries cost through for maintenance and fuel, not for issues/tires', () => {
    const timeline = buildTimeline({
      maintenance: [maintenance],
      issues: [issue],
      fuel: [fuel],
      tireEvents: [],
      tireSets: [],
    });

    expect(timeline.find((e) => e.id === 'm1')?.cost).toBe(80);
    expect(timeline.find((e) => e.id === 'f1')?.cost).toBe(72);
    expect(timeline.find((e) => e.id === 'i1')?.cost).toBeUndefined();
  });

  it('labels a tire event using its tire set season', () => {
    const timeline = buildTimeline({
      maintenance: [],
      issues: [],
      fuel: [],
      tireEvents: [tireEvent],
      tireSets: [tireSet],
    });

    expect(timeline[0].title).toBe('Winter tires mounted');
    expect(timeline[0].editHref).toBe('/vehicles/v1/tires');
  });
});
