import type { FuelEntry, Issue, Maintenance, TireEvent, TireSet } from '../db/types';

export type TimelineEntryType = 'maintenance' | 'repair' | 'service' | 'inspection' | 'issue' | 'fuel' | 'tire';

export interface TimelineEntry {
  id: string;
  date: string;
  mileage?: number;
  title: string;
  type: TimelineEntryType;
  cost?: number;
  subtitle?: string;
  editHref?: string;
}

const tireActionLabels: Record<TireEvent['action'], string> = {
  mounted: 'mounted',
  removed: 'removed',
  inspected: 'inspected',
};

const tireSeasonLabels: Record<TireSet['season'], string> = {
  summer: 'Summer',
  winter: 'Winter',
  allSeason: 'All-season',
};

export interface TimelineData {
  maintenance: Maintenance[];
  issues: Issue[];
  fuel: FuelEntry[];
  tireEvents: TireEvent[];
  tireSets: TireSet[];
}

/**
 * Merges every dated record for a vehicle into one chronological history,
 * most recent first. Each source type maps to a plain TimelineEntry so the
 * UI can render them uniformly while still linking back to the right
 * editor for records that have one.
 */
export function buildTimeline(data: TimelineData): TimelineEntry[] {
  const tireSetById = new Map(data.tireSets.map((set) => [set.id, set]));
  const entries: TimelineEntry[] = [];

  for (const entry of data.maintenance) {
    entries.push({
      id: entry.id,
      date: entry.date,
      mileage: entry.mileage,
      title: entry.title,
      type: entry.type,
      cost: entry.cost,
      subtitle: entry.workshop,
      editHref: `/maintenance/${entry.id}/edit`,
    });
  }

  for (const issue of data.issues) {
    entries.push({
      id: issue.id,
      date: issue.date,
      mileage: issue.mileage,
      title: issue.title,
      type: 'issue',
      subtitle: issue.status,
      editHref: `/issues/${issue.id}/edit`,
    });
  }

  for (const fuel of data.fuel) {
    entries.push({
      id: fuel.id,
      date: fuel.date,
      mileage: fuel.mileage,
      title: `Fuel · ${fuel.liters.toFixed(1)} L`,
      type: 'fuel',
      cost: fuel.totalCost,
      subtitle: fuel.station,
      editHref: `/fuel/${fuel.id}/edit`,
    });
  }

  for (const event of data.tireEvents) {
    const set = tireSetById.get(event.tireSetId);
    const label = set ? `${tireSeasonLabels[set.season]} tires` : 'Tires';
    entries.push({
      id: event.id,
      date: event.date,
      mileage: event.mileage,
      title: `${label} ${tireActionLabels[event.action]}`,
      type: 'tire',
      subtitle: event.notes,
      editHref: set ? `/vehicles/${set.vehicleId}/tires` : undefined,
    });
  }

  return entries.sort((a, b) => (a.date === b.date ? 0 : a.date < b.date ? 1 : -1));
}
