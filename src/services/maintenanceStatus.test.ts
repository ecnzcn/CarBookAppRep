import { describe, expect, it } from 'vitest';
import { getMaintenanceDueStatus } from './maintenanceStatus';

const today = new Date('2026-01-01T00:00:00.000Z');

describe('getMaintenanceDueStatus', () => {
  it('returns none when neither interval is set', () => {
    expect(getMaintenanceDueStatus({}, 10000, today)).toBe('none');
  });

  it('is ok when both thresholds are far away', () => {
    const status = getMaintenanceDueStatus(
      { nextMileage: 20000, nextDate: '2026-06-01' },
      10000,
      today,
    );
    expect(status).toBe('ok');
  });

  it('is overdue by mileage even if the date is far away', () => {
    const status = getMaintenanceDueStatus(
      { nextMileage: 9000, nextDate: '2027-01-01' },
      10000,
      today,
    );
    expect(status).toBe('overdue');
  });

  it('is overdue by date even if mileage is far away', () => {
    const status = getMaintenanceDueStatus(
      { nextMileage: 50000, nextDate: '2025-12-01' },
      10000,
      today,
    );
    expect(status).toBe('overdue');
  });

  it('is due soon when within the mileage threshold', () => {
    const status = getMaintenanceDueStatus({ nextMileage: 10500 }, 10000, today);
    expect(status).toBe('dueSoon');
  });

  it('is due soon when within the date threshold', () => {
    const status = getMaintenanceDueStatus({ nextDate: '2026-01-20' }, 10000, today);
    expect(status).toBe('dueSoon');
  });

  it('takes the more urgent of the two combined conditions', () => {
    const status = getMaintenanceDueStatus(
      { nextMileage: 50000, nextDate: '2026-01-10' },
      10000,
      today,
    );
    expect(status).toBe('dueSoon');
  });
});
