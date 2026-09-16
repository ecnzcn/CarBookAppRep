import type { FuelEntry, Maintenance, TireSet } from '../db/types';

export interface CostBreakdown {
  maintenance: number;
  repair: number;
  service: number;
  inspection: number;
  fuel: number;
  tires: number;
  total: number;
}

function isInYear(dateIso: string | undefined, year: number): boolean {
  return Boolean(dateIso) && new Date(dateIso as string).getFullYear() === year;
}

export interface CostSourceData {
  maintenance: Maintenance[];
  fuel: FuelEntry[];
  tireSets: TireSet[];
}

/**
 * Sums costs per category for a calendar year — maintenance entries by
 * their `type`, fuel by fill-up date, tire sets by purchase date. Nothing
 * here estimates or interpolates; a record outside the year (or without a
 * cost) simply doesn't contribute.
 */
export function costBreakdownForYear(data: CostSourceData, year: number): CostBreakdown {
  const byType: Record<Maintenance['type'], number> = {
    maintenance: 0,
    repair: 0,
    service: 0,
    inspection: 0,
  };

  for (const entry of data.maintenance) {
    if (entry.cost && isInYear(entry.date, year)) {
      byType[entry.type] += entry.cost;
    }
  }

  const fuel = data.fuel
    .filter((entry) => isInYear(entry.date, year))
    .reduce((sum, entry) => sum + entry.totalCost, 0);

  const tires = data.tireSets
    .filter((set) => set.cost && isInYear(set.purchaseDate, year))
    .reduce((sum, set) => sum + (set.cost ?? 0), 0);

  const total = byType.maintenance + byType.repair + byType.service + byType.inspection + fuel + tires;

  return { ...byType, fuel, tires, total };
}

export interface MileageReading {
  date: string;
  mileage: number;
}

/**
 * Km driven within a year, derived only from readings actually logged in
 * that year (the spread between the lowest and highest). Fewer than two
 * readings means there's nothing to derive from, so it returns undefined
 * rather than guessing.
 */
export function estimateKmDrivenInYear(readings: MileageReading[], year: number): number | undefined {
  const inYear = readings.filter((r) => isInYear(r.date, year));
  if (inYear.length < 2) return undefined;
  const mileages = inYear.map((r) => r.mileage);
  return Math.max(...mileages) - Math.min(...mileages);
}

export function costPerKm(totalCost: number, kmDriven: number | undefined): number | undefined {
  if (!kmDriven || kmDriven <= 0) return undefined;
  return totalCost / kmDriven;
}

export function availableYears(readings: { date: string }[]): number[] {
  const years = new Set(readings.map((r) => new Date(r.date).getFullYear()));
  years.add(new Date().getFullYear());
  return Array.from(years).sort((a, b) => b - a);
}
