import type { CarBookDatabase } from '../db/db';
import { db as defaultDb } from '../db/db';
import type { Issue } from '../db/types';

export interface IssueRepository {
  getByVehicle(vehicleId: string): Promise<Issue[]>;
  getById(id: string): Promise<Issue | undefined>;
  add(issue: Issue): Promise<void>;
  update(id: string, changes: Partial<Issue>): Promise<void>;
  remove(id: string): Promise<void>;
}

export function createIssueRepository(database: CarBookDatabase = defaultDb): IssueRepository {
  return {
    async getByVehicle(vehicleId) {
      return database.issues.where('vehicleId').equals(vehicleId).sortBy('date');
    },
    async getById(id) {
      return database.issues.get(id);
    },
    async add(issue) {
      await database.issues.add(issue);
    },
    async update(id, changes) {
      await database.issues.update(id, changes);
    },
    async remove(id) {
      await database.issues.delete(id);
    },
  };
}

export const issueRepository = createIssueRepository();
