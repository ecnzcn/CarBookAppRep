import type { IssueRepository } from '../repositories/issueRepository';
import { issueRepository } from '../repositories/issueRepository';
import type { Issue } from '../db/types';
import { generateId } from './id';

export interface IssueInput {
  vehicleId: string;
  title: string;
  description?: string;
  date: string;
  mileage?: number;
  status: Issue['status'];
  severity: Issue['severity'];
  notes?: string;
}

export class IssueValidationError extends Error {}

function assertValid(input: IssueInput) {
  if (!input.vehicleId) {
    throw new IssueValidationError('A vehicle is required.');
  }
  if (!input.title.trim()) {
    throw new IssueValidationError('Title is required.');
  }
  if (!input.date) {
    throw new IssueValidationError('Date is required.');
  }
  if (input.mileage !== undefined && input.mileage < 0) {
    throw new IssueValidationError('Mileage cannot be negative.');
  }
}

export function createIssueService(repository: IssueRepository = issueRepository) {
  return {
    async listForVehicle(vehicleId: string): Promise<Issue[]> {
      return repository.getByVehicle(vehicleId);
    },

    async get(id: string): Promise<Issue | undefined> {
      return repository.getById(id);
    },

    async create(input: IssueInput): Promise<Issue> {
      assertValid(input);
      const issue: Issue = {
        ...input,
        id: generateId(),
        resolvedAt: input.status === 'resolved' ? new Date().toISOString() : undefined,
        updatedAt: new Date().toISOString(),
      };
      await repository.add(issue);
      return issue;
    },

    async update(id: string, input: IssueInput): Promise<void> {
      assertValid(input);
      const previous = await repository.getById(id);
      const resolvedAt =
        input.status !== 'resolved'
          ? undefined
          : previous?.status === 'resolved'
            ? previous.resolvedAt
            : new Date().toISOString();

      await repository.update(id, {
        ...input,
        resolvedAt,
        updatedAt: new Date().toISOString(),
      });
    },

    async remove(id: string): Promise<void> {
      await repository.remove(id);
    },
  };
}

export const issueService = createIssueService();
