import type { TireEvent, TireSet } from '../../db/types';

export const tireSeasonOptions: { value: TireSet['season']; label: string }[] = [
  { value: 'summer', label: 'Summer' },
  { value: 'winter', label: 'Winter' },
  { value: 'allSeason', label: 'All-season' },
];

export const tireActionOptions: { value: TireEvent['action']; label: string }[] = [
  { value: 'mounted', label: 'Mounted' },
  { value: 'removed', label: 'Removed' },
  { value: 'inspected', label: 'Inspected' },
];

export function tireSeasonLabel(season: TireSet['season']): string {
  return tireSeasonOptions.find((opt) => opt.value === season)?.label ?? season;
}

export function tireActionLabel(action: TireEvent['action']): string {
  return tireActionOptions.find((opt) => opt.value === action)?.label ?? action;
}
