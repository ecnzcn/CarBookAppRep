import { beforeEach, describe, expect, it } from 'vitest';
import { CarBookDatabase } from '../db/db';
import { applyImport, exportBackup, parseBackup } from './backupService';

describe('backupService', () => {
  let db: CarBookDatabase;

  beforeEach(() => {
    db = new CarBookDatabase(`test-backup-${Math.random()}`);
  });

  async function seed() {
    await db.vehicles.add({
      id: 'v1',
      manufacturer: 'VW',
      model: 'Golf',
      currentMileage: 10000,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    await db.maintenance.add({
      id: 'm1',
      vehicleId: 'v1',
      date: '2026-01-01',
      mileage: 10000,
      type: 'maintenance',
      title: 'Oil change',
      cost: 80,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
    await db.documents.add({
      id: 'd1',
      vehicleId: 'v1',
      maintenanceId: 'm1',
      filename: 'invoice.pdf',
      mimeType: 'application/pdf',
      createdAt: '2026-01-01T00:00:00.000Z',
      blob: new Blob(['%PDF-1.4 fake invoice content'], { type: 'application/pdf' }),
    });
  }

  it('rejects a zip without data.json', () => {
    const preview = parseBackup(new Uint8Array([0x50, 0x4b, 0x05, 0x06, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
    expect(preview.valid).toBe(false);
    expect(preview.errors.length).toBeGreaterThan(0);
  });

  it('round-trips vehicles, maintenance, and document blobs through export/import', async () => {
    await seed();

    const blob = await exportBackup(db);
    const bytes = new Uint8Array(await blob.arrayBuffer());

    const preview = parseBackup(bytes);
    expect(preview.valid).toBe(true);
    expect(preview.counts).toMatchObject({ vehicles: 1, maintenance: 1, documents: 1 });

    const freshDb = new CarBookDatabase(`test-backup-import-${Math.random()}`);
    const result = await applyImport(preview.data!, preview.files!, freshDb);

    expect(result.added).toMatchObject({ vehicles: 1, maintenance: 1, documents: 1 });

    const restoredVehicle = await freshDb.vehicles.get('v1');
    expect(restoredVehicle?.manufacturer).toBe('VW');

    const restoredDoc = await freshDb.documents.get('d1');
    expect(restoredDoc?.filename).toBe('invoice.pdf');
    expect(restoredDoc?.blob.size).toBeGreaterThan(0);
  });

  it('never overwrites existing records — it skips them and reports the skip', async () => {
    await seed();
    const blob = await exportBackup(db);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const preview = parseBackup(bytes);

    // Importing into the very same (already-seeded) database should skip everything.
    const result = await applyImport(preview.data!, preview.files!, db);

    expect(result.added).toMatchObject({ vehicles: 0, maintenance: 0, documents: 0 });
    expect(result.skippedExisting).toMatchObject({ vehicles: 1, maintenance: 1, documents: 1 });

    const vehicle = await db.vehicles.get('v1');
    expect(vehicle?.manufacturer).toBe('VW');
  });
});
