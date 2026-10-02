import type { TireEvent, TireSet } from '../../db/types';

export const tireSeasonOptions: { value: TireSet['season']; label: string }[] = [
  { value: 'summer', label: 'Sommer' },
  { value: 'winter', label: 'Winter' },
  { value: 'allSeason', label: 'Ganzjahresreifen' },
];

export const tireActionOptions: { value: TireEvent['action']; label: string }[] = [
  { value: 'mounted', label: 'Montiert' },
  { value: 'removed', label: 'Demontiert' },
  { value: 'inspected', label: 'Geprüft' },
];

export function tireSeasonLabel(season: TireSet['season']): string {
  return tireSeasonOptions.find((opt) => opt.value === season)?.label ?? season;
}

export function tireActionLabel(action: TireEvent['action']): string {
  return tireActionOptions.find((opt) => opt.value === action)?.label ?? action;
}
