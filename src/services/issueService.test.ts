import { beforeEach, describe, expect, it } from 'vitest';
import { CarBookDatabase } from '../db/db';
import { createIssueRepository } from '../repositories/issueRepository';
import { createIssueService, IssueValidationError, type IssueInput } from './issueService';

function makeInput(overrides: Partial<IssueInput> = {}): IssueInput {
  return {
    vehicleId: 'vehicle-1',
    title: 'Klong beim Einlegen von D',
    date: '2026-01-01',
    status: 'open',
    severity: 'medium',
    ...overrides,
  };
}

describe('issueService', () => {
  let service: ReturnType<typeof createIssueService>;

  beforeEach(() => {
    const db = new CarBookDatabase(`test-issue-${Math.random()}`);
    service = createIssueService(createIssueRepository(db));
  });

  it('rejects an issue without a title', async () => {
    await expect(service.create(makeInput({ title: '' }))).rejects.toBeInstanceOf(
      IssueValidationError,
    );
  });

  it('does not diagnose — it just stores the observation as given', async () => {
    const issue = await service.create(makeInput());
    expect(issue.title).toBe('Klong beim Einlegen von D');
    expect(issue.status).toBe('open');
  });

  it('stamps resolvedAt when the status becomes resolved', async () => {
    const issue = await service.create(makeInput());
    await service.update(issue.id, { ...makeInput(), status: 'resolved' });

    const resolved = await service.get(issue.id);
    expect(resolved?.status).toBe('resolved');
    expect(resolved?.resolvedAt).toBeTruthy();
  });

  it('keeps the original resolvedAt across further edits while still resolved', async () => {
    const issue = await service.create(makeInput());
    await service.update(issue.id, { ...makeInput(), status: 'resolved' });
    const firstResolved = await service.get(issue.id);

    await new Promise((resolve) => setTimeout(resolve, 5));
    await service.update(issue.id, { ...makeInput(), status: 'resolved', notes: 'updated' });
    const secondResolved = await service.get(issue.id);

    expect(secondResolved?.resolvedAt).toBe(firstResolved?.resolvedAt);
  });

  it('clears resolvedAt when an issue is reopened', async () => {
    const issue = await service.create(makeInput());
    await service.update(issue.id, { ...makeInput(), status: 'resolved' });
    await service.update(issue.id, { ...makeInput(), status: 'open' });

    const reopened = await service.get(issue.id);
    expect(reopened?.resolvedAt).toBeUndefined();
  });
});
