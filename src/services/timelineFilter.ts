import type { TimelineEntry } from './timelineService';

export interface TimelineFilterOptions {
  from?: string;
  to?: string;
  minCost?: number;
  maxCost?: number;
  minMileage?: number;
  maxMileage?: number;
}

export function filterTimelineEntries(
  entries: TimelineEntry[],
  filter: TimelineFilterOptions,
): TimelineEntry[] {
  return entries.filter((entry) => {
    if (filter.from && entry.date < filter.from) return false;
    if (filter.to && entry.date > filter.to) return false;
    if (filter.minCost !== undefined && (entry.cost === undefined || entry.cost < filter.minCost)) return false;
    if (filter.maxCost !== undefined && (entry.cost === undefined || entry.cost > filter.maxCost)) return false;
    if (
      filter.minMileage !== undefined &&
      (entry.mileage === undefined || entry.mileage < filter.minMileage)
    ) {
      return false;
    }
    if (
      filter.maxMileage !== undefined &&
      (entry.mileage === undefined || entry.mileage > filter.maxMileage)
    ) {
      return false;
    }
    return true;
  });
}

export function matchesText(entry: TimelineEntry, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return `${entry.title} ${entry.subtitle ?? ''}`.toLowerCase().includes(q);
}
