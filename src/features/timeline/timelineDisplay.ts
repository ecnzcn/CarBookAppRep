import type { TimelineEntryType } from '../../services/timelineService';
import type { BadgeTone } from '../../ui/components/Badge';

export const timelineTypeOptions: { value: TimelineEntryType | 'all'; label: string }[] = [
  { value: 'all', label: 'Alle' },
  { value: 'maintenance', label: 'Wartung' },
  { value: 'repair', label: 'Reparaturen' },
  { value: 'service', label: 'Service' },
  { value: 'inspection', label: 'Inspektionen' },
  { value: 'issue', label: 'Probleme' },
  { value: 'fuel', label: 'Tankungen' },
  { value: 'tire', label: 'Reifen' },
];

const typeLabels: Record<TimelineEntryType, string> = {
  maintenance: 'Wartung',
  repair: 'Reparatur',
  service: 'Service',
  inspection: 'Inspektion',
  issue: 'Problem',
  fuel: 'Tankung',
  tire: 'Reifen',
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
