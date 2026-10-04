import type { DrivetrainType, FuelType, TransmissionType } from '../../db/types';

export const fuelTypeOptions: { value: FuelType; label: string }[] = [
  { value: 'gasoline', label: 'Benzin' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Elektro' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'plugInHybrid', label: 'Plug-in-Hybrid' },
  { value: 'lpg', label: 'LPG' },
  { value: 'cng', label: 'CNG' },
  { value: 'other', label: 'Sonstiges' },
];

export const transmissionOptions: { value: TransmissionType; label: string }[] = [
  { value: 'manual', label: 'Schaltgetriebe' },
  { value: 'automatic', label: 'Automatik' },
  { value: 'cvt', label: 'CVT' },
  { value: 'other', label: 'Sonstiges' },
];

export const drivetrainOptions: { value: DrivetrainType; label: string }[] = [
  { value: 'fwd', label: 'Frontantrieb' },
  { value: 'rwd', label: 'Heckantrieb' },
  { value: 'awd', label: 'Allradantrieb' },
  { value: '4wd', label: 'Allradantrieb (4WD)' },
  { value: 'other', label: 'Sonstiges' },
];
