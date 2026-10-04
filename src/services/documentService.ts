import type { DocumentRepository } from '../repositories/documentRepository';
import { documentRepository } from '../repositories/documentRepository';
import type { Document } from '../db/types';
import { generateId } from './id';

export interface DocumentUploadInput {
  vehicleId: string;
  maintenanceId?: string;
  issueId?: string;
  file: File;
}

export class DocumentValidationError extends Error {}

const MAX_DOCUMENT_BYTES = 15 * 1024 * 1024; // 15 MB — generous for phone photos/PDF scans

function assertValid(input: DocumentUploadInput) {
  if (!input.vehicleId) {
    throw new DocumentValidationError('Ein Fahrzeug ist erforderlich.');
  }
  if (input.file.size === 0) {
    throw new DocumentValidationError('Die ausgewählte Datei ist leer.');
  }
  if (input.file.size > MAX_DOCUMENT_BYTES) {
    throw new DocumentValidationError('Die ausgewählte Datei ist größer als 15 MB.');
  }
}

export function createDocumentService(repository: DocumentRepository = documentRepository) {
  return {
    async listForMaintenance(maintenanceId: string): Promise<Document[]> {
      return repository.getByMaintenance(maintenanceId);
    },

    async listForIssue(issueId: string): Promise<Document[]> {
      return repository.getByIssue(issueId);
    },

    async listForVehicle(vehicleId: string): Promise<Document[]> {
      return repository.getByVehicle(vehicleId);
    },

    async upload(input: DocumentUploadInput): Promise<Document> {
      assertValid(input);
      const document: Document = {
        id: generateId(),
        vehicleId: input.vehicleId,
        maintenanceId: input.maintenanceId,
        issueId: input.issueId,
        filename: input.file.name,
        mimeType: input.file.type || 'application/octet-stream',
        createdAt: new Date().toISOString(),
        blob: input.file,
      };
      await repository.add(document);
      return document;
    },

    async remove(id: string): Promise<void> {
      await repository.remove(id);
    },
  };
}

export const documentService = createDocumentService();
