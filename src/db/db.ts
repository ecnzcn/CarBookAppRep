import Dexie, { type EntityTable } from 'dexie';
import type {
  Document,
  FuelEntry,
  Issue,
  Maintenance,
  Reminder,
  TireEvent,
  TireSet,
  Vehicle,
} from './types';

export class CarBookDatabase extends Dexie {
  vehicles!: EntityTable<Vehicle, 'id'>;
  maintenance!: EntityTable<Maintenance, 'id'>;
  issues!: EntityTable<Issue, 'id'>;
  fuelEntries!: EntityTable<FuelEntry, 'id'>;
  tireSets!: EntityTable<TireSet, 'id'>;
  tireEvents!: EntityTable<TireEvent, 'id'>;
  documents!: EntityTable<Document, 'id'>;
  reminders!: EntityTable<Reminder, 'id'>;

  constructor(name = 'CarBookDatabase') {
    super(name);

    this.version(1).stores({
      vehicles: 'id, manufacturer, model, createdAt',
      maintenance: 'id, vehicleId, date, mileage, type, nextDate, nextMileage',
      issues: 'id, vehicleId, date, status, severity',
      fuelEntries: 'id, vehicleId, date, mileage',
      tireSets: 'id, vehicleId, season',
      tireEvents: 'id, tireSetId, date',
      documents: 'id, vehicleId, maintenanceId, issueId',
      reminders: 'id, vehicleId, dueDate, dueMileage, enabled',
    });
  }
}

export const db = new CarBookDatabase();
