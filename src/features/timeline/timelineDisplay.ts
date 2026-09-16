import type { TimelineEntryType } from '../../services/timelineService';
import type { BadgeTone } from '../../ui/components/Badge';

export const timelineTypeOptions: { value: TimelineEntryType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'repair', label: 'Repairs' },
  { value: 'service', label: 'Service' },
  { value: 'inspection', label: 'Inspections' },
  { value: 'issue', label: 'Issues' },
  { value: 'fuel', label: 'Fuel' },
  { value: 'tire', label: 'Tires' },
];

const typeLabels: Record<TimelineEntryType, string> = {
  maintenance: 'Maintenance',
  repair: 'Repair',
  service: 'Service',
  inspection: 'Inspection',
  issue: 'Issue',
  fuel: 'Fuel',
  tire: 'Tires',
};

const typeTones: Record<TimelineEntryType, BadgeTone> = {
  maintenance: 'accent',
  repair: 'warning',
  service: 'accent',
  inspection: 'neutral',
  issue: 'danger',
  fuel: 'success',
  tire: 'neutral',
};

export function timelineTypeLabel(type: TimelineEntryType): string {
  return typeLabels[type];
}

export function timelineTypeTone(type: TimelineEntryType): BadgeTone {
  return typeTones[type];
}
