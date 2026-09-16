import type { CarBookDatabase } from '../db/db';
import { db as defaultDb } from '../db/db';
import type { Reminder } from '../db/types';

export interface ReminderRepository {
  getByVehicle(vehicleId: string): Promise<Reminder[]>;
  getById(id: string): Promise<Reminder | undefined>;
  add(reminder: Reminder): Promise<void>;
  update(id: string, changes: Partial<Reminder>): Promise<void>;
  remove(id: string): Promise<void>;
}

export function createReminderRepository(
  database: CarBookDatabase = defaultDb,
): ReminderRepository {
  return {
    async getByVehicle(vehicleId) {
      return database.reminders.where('vehicleId').equals(vehicleId).toArray();
    },
    async getById(id) {
      return database.reminders.get(id);
    },
    async add(reminder) {
      await database.reminders.add(reminder);
    },
    async update(id, changes) {
      await database.reminders.update(id, changes);
    },
    async remove(id) {
      await database.reminders.delete(id);
    },
  };
}

export const reminderRepository = createReminderRepository();
