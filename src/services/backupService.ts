import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';
import type { CarBookDatabase } from '../db/db';
import { db as defaultDb } from '../db/db';
import type {
  Document,
  FuelEntry,
  Issue,
  Maintenance,
  Reminder,
  TireEvent,
  TireSet,
  Vehicle,
} from '../db/types';

const BACKUP_VERSION = 1;

export interface BackupCounts {
  vehicles: number;
  maintenance: number;
  issues: number;
  fuelEntries: number;
  tireSets: number;
  tireEvents: number;
  reminders: number;
  documents: number;
}

function emptyCounts(): BackupCounts {
  return {
    vehicles: 0,
    maintenance: 0,
    issues: 0,
    fuelEntries: 0,
    tireSets: 0,
    tireEvents: 0,
    reminders: 0,
    documents: 0,
  };
}

interface BackupDocumentMeta {
  id: string;
  vehicleId: string;
  maintenanceId?: string;
  issueId?: string;
  filename: string;
  mimeType: string;
  createdAt: string;
  path: string;
}

export interface BackupData {
  version: number;
  exportedAt: string;
  vehicles: Vehicle[];
  maintenance: Maintenance[];
  issues: Issue[];
  fuelEntries: FuelEntry[];
  tireSets: TireSet[];
  tireEvents: TireEvent[];
  reminders: Reminder[];
  documents: BackupDocumentMeta[];
}

export function backupFilename(date: Date = new Date()): string {
  return `CarBook-Backup-${date.toISOString().slice(0, 10)}.zip`;
}

export async function exportBackup(database: CarBookDatabase = defaultDb): Promise<Blob> {
  const [vehicles, maintenance, issues, fuelEntries, tireSets, tireEvents, reminders, documents] =
    await Promise.all([
      database.vehicles.toArray(),
      database.maintenance.toArray(),
      database.issues.toArray(),
      database.fuelEntries.toArray(),
      database.tireSets.toArray(),
      database.tireEvents.toArray(),
      database.reminders.toArray(),
      database.documents.toArray(),
    ]);

  const files: Record<string, Uint8Array> = {};
  const documentMeta: BackupDocumentMeta[] = [];

  for (const doc of documents) {
    const folder = doc.mimeType.startsWith('image/') ? 'photos' : 'documents';
    const path = `${folder}/${doc.id}-${doc.filename}`;
    files[path] = new Uint8Array(await doc.blob.arrayBuffer());
    documentMeta.push({
      id: doc.id,
      vehicleId: doc.vehicleId,
      maintenanceId: doc.maintenanceId,
      issueId: doc.issueId,
      filename: doc.filename,
      mimeType: doc.mimeType,
      createdAt: doc.createdAt,
      path,
    });
  }

  const data: BackupData = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    vehicles,
    maintenance,
    issues,
    fuelEntries,
    tireSets,
    tireEvents,
    reminders,
    documents: documentMeta,
  };

  files['data.json'] = strToU8(JSON.stringify(data, null, 2));

  const zipped = zipSync(files, { level: 6 });
  return new Blob([zipped as BlobPart], { type: 'application/zip' });
}

const REQUIRED_ARRAYS = [
  'vehicles',
  'maintenance',
  'issues',
  'fuelEntries',
  'tireSets',
  'tireEvents',
  'reminders',
  'documents',
] as const;

function validateBackupShape(value: unknown): string[] {
  const errors: string[] = [];
  if (!value || typeof value !== 'object') {
    return ['data.json does not contain a valid backup object.'];
  }
  const record = value as Record<string, unknown>;
  if (typeof record.version !== 'number') {
    errors.push('Missing or invalid backup version.');
  }
  for (const key of REQUIRED_ARRAYS) {
    if (!Array.isArray(record[key])) {
      errors.push(`Missing or invalid "${key}" list.`);
    }
  }
  return errors;
}

export interface BackupPreview {
  valid: boolean;
  errors: string[];
  counts: BackupCounts;
  data?: BackupData;
  files?: Record<string, Uint8Array>;
}

export function parseBackup(bytes: Uint8Array): BackupPreview {
  let files: Record<string, Uint8Array>;
  try {
    files = unzipSync(bytes);
  } catch (err) {
    return {
      valid: false,
      errors: [`Could not read the zip file: ${err instanceof Error ? err.message : 'unknown error'}`],
      counts: emptyCounts(),
    };
  }

  const dataFile = files['data.json'];
  if (!dataFile) {
    return { valid: false, errors: ['The backup is missing data.json.'], counts: emptyCounts() };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(strFromU8(dataFile));
  } catch {
    return { valid: false, errors: ['data.json is not valid JSON.'], counts: emptyCounts() };
  }

  const errors = validateBackupShape(parsed);
  if (errors.length > 0) {
    return { valid: false, errors, counts: emptyCounts() };
  }

  const data = parsed as BackupData;
  return {
    valid: true,
    errors: [],
    counts: {
      vehicles: data.vehicles.length,
      maintenance: data.maintenance.length,
      issues: data.issues.length,
      fuelEntries: data.fuelEntries.length,
      tireSets: data.tireSets.length,
      tireEvents: data.tireEvents.length,
      reminders: data.reminders.length,
      documents: data.documents.length,
    },
    data,
    files,
  };
}

export interface ImportResult {
  added: BackupCounts;
  skippedExisting: BackupCounts;
}

/**
 * Merge-imports a previously validated backup: a record whose id already
 * exists locally is left untouched and counted as skipped, never
 * overwritten — restoring a backup can only add data, never discard it.
 */
export async function applyImport(
  data: BackupData,
  files: Record<string, Uint8Array>,
  database: CarBookDatabase = defaultDb,
): Promise<ImportResult> {
  const added = emptyCounts();
  const skipped = emptyCounts();

  for (const vehicle of data.vehicles) {
    if (await database.vehicles.get(vehicle.id)) skipped.vehicles++;
    else {
      await database.vehicles.add(vehicle);
      added.vehicles++;
    }
  }
  for (const entry of data.maintenance) {
    if (await database.maintenance.get(entry.id)) skipped.maintenance++;
    else {
      await database.maintenance.add(entry);
      added.maintenance++;
    }
  }
  for (const issue of data.issues) {
    if (await database.issues.get(issue.id)) skipped.issues++;
    else {
      await database.issues.add(issue);
      added.issues++;
    }
  }
  for (const fuel of data.fuelEntries) {
    if (await database.fuelEntries.get(fuel.id)) skipped.fuelEntries++;
    else {
      await database.fuelEntries.add(fuel);
      added.fuelEntries++;
    }
  }
  for (const set of data.tireSets) {
    if (await database.tireSets.get(set.id)) skipped.tireSets++;
    else {
      await database.tireSets.add(set);
      added.tireSets++;
    }
  }
  for (const event of data.tireEvents) {
    if (await database.tireEvents.get(event.id)) skipped.tireEvents++;
    else {
      await database.tireEvents.add(event);
      added.tireEvents++;
    }
  }
  for (const reminder of data.reminders) {
    if (await database.reminders.get(reminder.id)) skipped.reminders++;
    else {
      await database.reminders.add(reminder);
      added.reminders++;
    }
  }
  for (const meta of data.documents) {
    if (await database.documents.get(meta.id)) {
      skipped.documents++;
      continue;
    }
    const bytes = files[meta.path];
    if (!bytes) continue;
    const document: Document = {
      id: meta.id,
      vehicleId: meta.vehicleId,
      maintenanceId: meta.maintenanceId,
      issueId: meta.issueId,
      filename: meta.filename,
      mimeType: meta.mimeType,
      createdAt: meta.createdAt,
      blob: new Blob([bytes as BlobPart], { type: meta.mimeType }),
    };
    await database.documents.add(document);
    added.documents++;
  }

  return { added, skippedExisting: skipped };
}
