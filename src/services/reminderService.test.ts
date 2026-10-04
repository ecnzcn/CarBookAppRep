import { beforeEach, describe, expect, it } from 'vitest';
import { CarBookDatabase } from '../db/db';
import { createReminderRepository } from '../repositories/reminderRepository';
import { createReminderService, ReminderValidationError, type ReminderInput } from './reminderService';

function makeInput(overrides: Partial<ReminderInput> = {}): ReminderInput {
  return {
    vehicleId: 'v1',
    title: 'Insurance renewal',
    dueDate: '2026-12-01',
    enabled: true,
    ...overrides,
  };
}

describe('reminderService', () => {
  let service: ReturnType<typeof createReminderService>;

  beforeEach(() => {
    const db = new CarBookDatabase(`test-reminder-${Math.random()}`);
    service = createReminderService(createReminderRepository(db));
  });

  it('rejects a reminder without a due date or mileage', async () => {
    await expect(
      service.create(makeInput({ dueDate: undefined, dueMileage: undefined })),
    ).rejects.toBeInstanceOf(ReminderValidationError);
  });

  it('creates a reminder with only a due mileage set', async () => {
    const reminder = await service.create(makeInput({ dueDate: undefined, dueMileage: 30000 }));
    expect(reminder.dueMileage).toBe(30000);
  });

  it('toggles enabled state', async () => {
    const reminder = await service.create(makeInput());
    await service.setEnabled(reminder.id, false);
    const updated = await service.get(reminder.id);
    expect(updated?.enabled).toBe(false);
  });
});
