import type { DrivetrainType, FuelType, TransmissionType } from '../../db/types';

export const fuelTypeOptions: { value: FuelType; label: string }[] = [
  { value: 'gasoline', label: 'Gasoline' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'plugInHybrid', label: 'Plug-in Hybrid' },
  { value: 'lpg', label: 'LPG' },
  { value: 'cng', label: 'CNG' },
  { value: 'other', label: 'Other' },
];

export const transmissionOptions: { value: TransmissionType; label: string }[] = [
  { value: 'manual', label: 'Manual' },
  { value: 'automatic', label: 'Automatic' },
  { value: 'cvt', label: 'CVT' },
  { value: 'other', label: 'Other' },
];

export const drivetrainOptions: { value: DrivetrainType; label: string }[] = [
  { value: 'fwd', label: 'Front-wheel drive' },
  { value: 'rwd', label: 'Rear-wheel drive' },
  { value: 'awd', label: 'All-wheel drive' },
  { value: '4wd', label: 'Four-wheel drive' },
  { value: 'other', label: 'Other' },
];
