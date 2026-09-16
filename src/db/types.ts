export type FuelType =
  | 'gasoline'
  | 'diesel'
  | 'electric'
  | 'hybrid'
  | 'plugInHybrid'
  | 'lpg'
  | 'cng'
  | 'other';

export type TransmissionType = 'manual' | 'automatic' | 'cvt' | 'other';

export type DrivetrainType = 'fwd' | 'rwd' | 'awd' | '4wd' | 'other';

export interface Vehicle {
  id: string;
  manufacturer: string;
  model: string;
  series?: string;
  year?: number;
  engine?: string;
  fuelType?: FuelType;
  transmission?: TransmissionType;
  drivetrain?: DrivetrainType;
  vin?: string;
  licensePlate?: string;
  currentMileage: number;
  purchaseDate?: string;
  purchasePrice?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type MaintenanceType = 'maintenance' | 'repair' | 'service' | 'inspection';

export interface Maintenance {
  id: string;
  vehicleId: string;
  date: string;
  mileage: number;
  type: MaintenanceType;
  title: string;
  description?: string;
  cost?: number;
  workshop?: string;
  nextMileage?: number;
  nextDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type IssueStatus = 'open' | 'observing' | 'workshop' | 'resolved' | 'dismissed';
export type IssueSeverity = 'low' | 'medium' | 'high';

export interface Issue {
  id: string;
  vehicleId: string;
  title: string;
  description?: string;
  date: string;
  mileage?: number;
  status: IssueStatus;
  severity: IssueSeverity;
  notes?: string;
  resolvedAt?: string;
  updatedAt: string;
}

export interface FuelEntry {
  id: string;
  vehicleId: string;
  date: string;
  mileage: number;
  liters: number;
  pricePerLiter: number;
  totalCost: number;
  station?: string;
  notes?: string;
}

export type TireSeason = 'summer' | 'winter' | 'allSeason';

export interface TireSet {
  id: string;
  vehicleId: string;
  season: TireSeason;
  manufacturer?: string;
  model?: string;
  size?: string;
  dot?: string;
  purchaseDate?: string;
  purchaseMileage?: number;
  treadDepth?: number;
  cost?: number;
  notes?: string;
  createdAt: string;
}

export type TireAction = 'mounted' | 'removed' | 'inspected';

export interface TireEvent {
  id: string;
  tireSetId: string;
  date: string;
  mileage?: number;
  action: TireAction;
  notes?: string;
}

export interface Document {
  id: string;
  vehicleId: string;
  maintenanceId?: string;
  issueId?: string;
  filename: string;
  mimeType: string;
  createdAt: string;
  blob: Blob;
}

export interface Reminder {
  id: string;
  vehicleId: string;
  title: string;
  dueDate?: string;
  dueMileage?: number;
  repeatIntervalDays?: number;
  repeatIntervalMileage?: number;
  enabled: boolean;
  notes?: string;
}
