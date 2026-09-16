import type { Maintenance } from '../db/types';

export type MaintenanceDueStatus = 'none' | 'ok' | 'dueSoon' | 'overdue';

export const DUE_SOON_KM_THRESHOLD = 1000;
export const DUE_SOON_DAYS_THRESHOLD = 30;

function daysBetween(from: Date, to: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((to.getTime() - from.getTime()) / msPerDay);
}

/**
 * Determines the due state of a single maintenance entry's "next due"
 * fields against the vehicle's current mileage and today's date.
 *
 * When both a mileage- and a date-based interval are set, whichever one is
 * reached first (i.e. the more urgent of the two) determines the status —
 * an entry overdue by mileage is overdue even if its next date is still
 * months away, and vice versa.
 */
export function getMaintenanceDueStatus(
  entry: Pick<Maintenance, 'nextMileage' | 'nextDate'>,
  currentMileage: number,
  today: Date = new Date(),
): MaintenanceDueStatus {
  if (entry.nextMileage === undefined && !entry.nextDate) {
    return 'none';
  }

  const statuses: MaintenanceDueStatus[] = [];

  if (entry.nextMileage !== undefined) {
    const remainingKm = entry.nextMileage - currentMileage;
    if (remainingKm <= 0) statuses.push('overdue');
    else if (remainingKm <= DUE_SOON_KM_THRESHOLD) statuses.push('dueSoon');
    else statuses.push('ok');
  }

  if (entry.nextDate) {
    const remainingDays = daysBetween(today, new Date(entry.nextDate));
    if (remainingDays <= 0) statuses.push('overdue');
    else if (remainingDays <= DUE_SOON_DAYS_THRESHOLD) statuses.push('dueSoon');
    else statuses.push('ok');
  }

  if (statuses.includes('overdue')) return 'overdue';
  if (statuses.includes('dueSoon')) return 'dueSoon';
  return 'ok';
}

export function isDue(entry: Maintenance, currentMileage: number, today: Date = new Date()) {
  const status = getMaintenanceDueStatus(entry, currentMileage, today);
  return status === 'dueSoon' || status === 'overdue';
}
