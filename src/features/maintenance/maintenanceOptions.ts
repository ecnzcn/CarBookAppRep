import type { Maintenance } from '../../db/types';

export const maintenanceTypeOptions: { value: Maintenance['type']; label: string }[] = [
  { value: 'maintenance', label: 'Wartung' },
  { value: 'repair', label: 'Reparatur' },
  { value: 'service', label: 'Service' },
  { value: 'inspection', label: 'Inspektion' },
];

export function maintenanceTypeLabel(type: Maintenance['type']): string {
  return maintenanceTypeOptions.find((opt) => opt.value === type)?.label ?? type;
}
