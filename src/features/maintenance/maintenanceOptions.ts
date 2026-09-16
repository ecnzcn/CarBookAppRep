import type { Maintenance } from '../../db/types';

export const maintenanceTypeOptions: { value: Maintenance['type']; label: string }[] = [
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'repair', label: 'Repair' },
  { value: 'service', label: 'Service' },
  { value: 'inspection', label: 'Inspection' },
];

export function maintenanceTypeLabel(type: Maintenance['type']): string {
  return maintenanceTypeOptions.find((opt) => opt.value === type)?.label ?? type;
}
