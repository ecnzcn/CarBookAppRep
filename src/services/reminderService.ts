import type { ReminderRepository } from '../repositories/reminderRepository';
import { reminderRepository } from '../repositories/reminderRepository';
import type { Reminder } from '../db/types';
import { generateId } from './id';

export interface ReminderInput {
  vehicleId: string;
  title: string;
  dueDate?: string;
  dueMileage?: number;
  repeatIntervalDays?: number;
  repeatIntervalMileage?: number;
  enabled: boolean;
  notes?: string;
}

export class ReminderValidationError extends Error {}

function assertValid(input: ReminderInput) {
  if (!input.vehicleId) {
    throw new ReminderValidationError('A vehicle is required.');
  }
  if (!input.title.trim()) {
    throw new ReminderValidationError('Title is required.');
  }
  if (!input.dueDate && input.dueMileage === undefined) {
    throw new ReminderValidationError('Set a due date, a due mileage, or both.');
  }
}

export function createReminderService(repository: ReminderRepository = reminderRepository) {
  return {
    async listForVehicle(vehicleId: string): Promise<Reminder[]> {
      return repository.getByVehicle(vehicleId);
    },

    async get(id: string): Promise<Reminder | undefined> {
      return repository.getById(id);
    },

    async create(input: ReminderInput): Promise<Reminder> {
      assertValid(input);
      const reminder: Reminder = { ...input, id: generateId() };
      await repository.add(reminder);
      return reminder;
    },

    async update(id: string, input: ReminderInput): Promise<void> {
      assertValid(input);
      await repository.update(id, input);
    },

    async setEnabled(id: string, enabled: boolean): Promise<void> {
      await repository.update(id, { enabled });
    },

    async remove(id: string): Promise<void> {
      await repository.remove(id);
    },
  };
}

export const reminderService = createReminderService();
