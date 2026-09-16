import type { Issue } from '../../db/types';
import type { BadgeTone } from '../../ui/components/Badge';

export const issueStatusOptions: { value: Issue['status']; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'observing', label: 'Observing' },
  { value: 'workshop', label: 'At workshop' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
];

export const issueSeverityOptions: { value: Issue['severity']; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
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
