import type { CarBookDatabase } from '../db/db';
import { db as defaultDb } from '../db/db';
import type { Document } from '../db/types';

export interface DocumentRepository {
  getByMaintenance(maintenanceId: string): Promise<Document[]>;
  getByIssue(issueId: string): Promise<Document[]>;
  getByVehicle(vehicleId: string): Promise<Document[]>;
  getById(id: string): Promise<Document | undefined>;
  add(document: Document): Promise<void>;
  remove(id: string): Promise<void>;
}

export function createDocumentRepository(
  database: CarBookDatabase = defaultDb,
): DocumentRepository {
  return {
    async getByMaintenance(maintenanceId) {
      return database.documents.where('maintenanceId').equals(maintenanceId).toArray();
    },
    async getByIssue(issueId) {
      return database.documents.where('issueId').equals(issueId).toArray();
    },
    async getByVehicle(vehicleId) {
      return database.documents.where('vehicleId').equals(vehicleId).toArray();
    },
    async getById(id) {
      return database.documents.get(id);
    },
    async add(document) {
      await database.documents.add(document);
    },
    async remove(id) {
      await database.documents.delete(id);
    },
  };
}

export const documentRepository = createDocumentRepository();
