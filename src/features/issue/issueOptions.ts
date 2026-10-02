import type { Issue } from '../../db/types';
import type { BadgeTone } from '../../ui/components/Badge';

export const issueStatusOptions: { value: Issue['status']; label: string }[] = [
  { value: 'open', label: 'Offen' },
  { value: 'observing', label: 'Wird beobachtet' },
  { value: 'workshop', label: 'In der Werkstatt' },
  { value: 'resolved', label: 'Behoben' },
  { value: 'dismissed', label: 'Verworfen' },
];

export const issueSeverityOptions: { value: Issue['severity']; label: string }[] = [
  { value: 'low', label: 'Niedrig' },
  { value: 'medium', label: 'Mittel' },
  { value: 'high', label: 'Hoch' },
];

export function issueStatusLabel(status: Issue['status']): string {
  return issueStatusOptions.find((opt) => opt.value === status)?.label ?? status;
}

export function issueStatusTone(status: Issue['status']): BadgeTone {
  switch (status) {
    case 'open':
      return 'danger';
    case 'workshop':
      return 'warning';
    case 'observing':
      return 'accent';
    case 'resolved':
      return 'success';
    case 'dismissed':
      return 'neutral';
  }
}

export function issueSeverityLabel(severity: Issue['severity']): string {
  return issueSeverityOptions.find((opt) => opt.value === severity)?.label ?? severity;
}
