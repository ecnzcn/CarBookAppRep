import { describe, expect, it } from 'vitest';
import { availableYears, costBreakdownForYear, costPerKm, estimateKmDrivenInYear } from './costService';
import type { FuelEntry, Maintenance, TireSet } from '../db/types';

function maintenance(overrides: Partial<Maintenance>): Maintenance {
  return {
    id: overrides.id ?? Math.random().toString(36),
    vehicleId: 'v1',
    date: '2026-01-01',
    mileage: 0,
    type: 'maintenance',
    title: 'x',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function fuel(overrides: Partial<FuelEntry>): FuelEntry {
  return {
    id: overrides.id ?? Math.random().toString(36),
    vehicleId: 'v1',
    date: '2026-01-01',
    mileage: 0,
    liters: 0,
    pricePerLiter: 0,
    totalCost: 0,
    ...overrides,
  };
}

describe('costBreakdownForYear', () => {
  it('sums maintenance costs by type within the year', () => {
    const breakdown = costBreakdownForYear(
      {
        maintenance: [
          maintenance({ type: 'maintenance', cost: 100, date: '2026-03-01' }),
          maintenance({ type: 'repair', cost: 200, date: '2026-06-01' }),
          maintenance({ type: 'maintenance', cost: 999, date: '2025-01-01' }),
        ],
        fuel: [],
        tireSets: [],
      },
      2026,
    );

    expect(breakdown.maintenance).toBe(100);
    expect(breakdown.repair).toBe(200);
    expect(breakdown.total).toBe(300);
  });

  it('includes fuel and tire costs, ignoring records outside the year', () => {
    const tireSet: TireSet = {
      id: 't1',
      vehicleId: 'v1',
      season: 'winter',
      cost: 400,
      purchaseDate: '2026-11-01',
      createdAt: '2026-11-01T00:00:00.000Z',
    };

    const breakdown = costBreakdownForYear(
      {
        maintenance: [],
        fuel: [fuel({ totalCost: 72, date: '2026-05-01' }), fuel({ totalCost: 50, date: '2025-05-01' })],
        tireSets: [tireSet],
      },
      2026,
    );

    expect(breakdown.fuel).toBe(72);
    expect(breakdown.tires).toBe(400);
    expect(breakdown.total).toBe(472);
  });

  it('ignores maintenance entries without a recorded cost', () => {
    const breakdown = costBreakdownForYear(
      { maintenance: [maintenance({ cost: undefined })], fuel: [], tireSets: [] },
      2026,
    );
    expect(breakdown.total).toBe(0);
  });
});

describe('estimateKmDrivenInYear', () => {
  it('returns undefined with fewer than two readings in the year', () => {
    expect(estimateKmDrivenInYear([{ date: '2026-01-01', mileage: 1000 }], 2026)).toBeUndefined();
  });

  it('computes the spread between the lowest and highest reading in the year', () => {
    const km = estimateKmDrivenInYear(
      [
        { date: '2026-01-01', mileage: 10000 },
        { date: '2026-06-01', mileage: 14000 },
        { date: '2025-12-01', mileage: 9000 },
      ],
      2026,
    );
    expect(km).toBe(4000);
  });
});

describe('costPerKm', () => {
  it('is undefined when km driven is unknown', () => {
    expect(costPerKm(1000, undefined)).toBeUndefined();
  });

  it('divides total cost by km driven', () => {
    expect(costPerKm(1000, 4000)).toBeCloseTo(0.25, 5);
  });
});

describe('availableYears', () => {
  it('always includes the current year, even with no data', () => {
    expect(availableYears([])).toEqual([new Date().getFullYear()]);
  });

  it('includes every distinct year found in the records', () => {
    const years = availableYears([{ date: '2024-01-01' }, { date: '2026-06-01' }]);
    expect(years).toContain(2024);
    expect(years).toContain(2026);
  });
});
