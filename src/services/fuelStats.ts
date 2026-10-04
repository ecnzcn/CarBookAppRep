import type { FuelEntry } from '../db/types';

export interface FuelStat {
  entry: FuelEntry;
  /** l/100km since the previous fill-up, assuming every fill-up tops off the tank. */
  consumptionLPer100Km?: number;
  costPer100Km?: number;
  costPerKm?: number;
}

/**
 * Consumption/cost-per-distance can only be derived between two consecutive
 * fill-ups with a valid mileage delta — with fewer than two readings there
 * is nothing to compute, so those figures are simply omitted rather than
 * guessed.
 */
export function computeFuelStats(entries: FuelEntry[]): FuelStat[] {
  const sorted = [...entries].sort((a, b) => a.mileage - b.mileage);

  return sorted.map((entry, index) => {
    if (index === 0) return { entry };

    const previous = sorted[index - 1];
    const kmDelta = entry.mileage - previous.mileage;
    if (kmDelta <= 0) return { entry };

    return {
      entry,
      consumptionLPer100Km: (entry.liters / kmDelta) * 100,
      costPer100Km: (entry.totalCost / kmDelta) * 100,
      costPerKm: entry.totalCost / kmDelta,
    };
  });
}
