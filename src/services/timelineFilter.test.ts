import { describe, expect, it } from 'vitest';
import { filterTimelineEntries, matchesText } from './timelineFilter';
import type { TimelineEntry } from './timelineService';

function entry(overrides: Partial<TimelineEntry>): TimelineEntry {
  return {
    id: overrides.id ?? Math.random().toString(36),
    date: '2026-01-01',
    title: 'Oil change',
    type: 'maintenance',
    ...overrides,
  };
}

describe('filterTimelineEntries', () => {
  it('filters by date range', () => {
    const entries = [entry({ id: 'a', date: '2026-01-01' }), entry({ id: 'b', date: '2026-06-01' })];
    const result = filterTimelineEntries(entries, { from: '2026-03-01' });
    expect(result.map((e) => e.id)).toEqual(['b']);
  });

  it('excludes entries without a cost when a cost filter is set', () => {
    const entries = [entry({ id: 'a', cost: undefined }), entry({ id: 'b', cost: 100 })];
    const result = filterTimelineEntries(entries, { minCost: 1 });
    expect(result.map((e) => e.id)).toEqual(['b']);
  });

  it('filters by mileage range', () => {
    const entries = [entry({ id: 'a', mileage: 5000 }), entry({ id: 'b', mileage: 15000 })];
    const result = filterTimelineEntries(entries, { minMileage: 10000, maxMileage: 20000 });
    expect(result.map((e) => e.id)).toEqual(['b']);
  });
});

describe('matchesText', () => {
  it('matches against the title', () => {
    expect(matchesText(entry({ title: 'Timing belt replaced' }), 'timing')).toBe(true);
    expect(matchesText(entry({ title: 'Timing belt replaced' }), 'brakes')).toBe(false);
  });

  it('matches against the subtitle too', () => {
    expect(matchesText(entry({ title: 'Oil change', subtitle: 'Bosch Service Center' }), 'bosch')).toBe(true);
  });

  it('treats an empty query as matching everything', () => {
    expect(matchesText(entry({ title: 'Anything' }), '')).toBe(true);
  });
});
