import { describe, expect, it } from 'vitest';
import { computeFuelStats } from './fuelStats';
import type { FuelEntry } from '../db/types';

function makeEntry(overrides: Partial<FuelEntry>): FuelEntry {
  return {
    id: overrides.id ?? Math.random().toString(36),
    vehicleId: 'v1',
    date: '2026-01-01',
    mileage: 0,
    liters: 0,
    pricePerLiter: 1.8,
    totalCost: 0,
    ...overrides,
  };
}

describe('computeFuelStats', () => {
  it('omits consumption for the first entry — nothing to compare against', () => {
    const [stat] = computeFuelStats([makeEntry({ mileage: 10000, liters: 40, totalCost: 72 })]);
    expect(stat.consumptionLPer100Km).toBeUndefined();
  });

  it('computes consumption and cost per 100km between consecutive fill-ups', () => {
    const entries = [
      makeEntry({ id: 'a', mileage: 10000, liters: 40, totalCost: 72 }),
      makeEntry({ id: 'b', mileage: 10500, liters: 35, totalCost: 63 }),
    ];
    const stats = computeFuelStats(entries);
    const second = stats.find((s) => s.entry.id === 'b')!;

    expect(second.consumptionLPer100Km).toBeCloseTo(7, 5);
    expect(second.costPer100Km).toBeCloseTo(12.6, 5);
    expect(second.costPerKm).toBeCloseTo(0.126, 5);
  });

  it('never invents a figure when mileage did not actually increase', () => {
    const entries = [
      makeEntry({ id: 'a', mileage: 10000, liters: 40, totalCost: 72 }),
      makeEntry({ id: 'b', mileage: 10000, liters: 35, totalCost: 63 }),
    ];
    const stats = computeFuelStats(entries);
    const second = stats.find((s) => s.entry.id === 'b')!;

    expect(second.consumptionLPer100Km).toBeUndefined();
  });

  it('sorts by mileage regardless of input order', () => {
    const entries = [
      makeEntry({ id: 'later', mileage: 10500, liters: 35, totalCost: 63 }),
      makeEntry({ id: 'earlier', mileage: 10000, liters: 40, totalCost: 72 }),
    ];
    const stats = computeFuelStats(entries);
    expect(stats.map((s) => s.entry.id)).toEqual(['earlier', 'later']);
  });
});
