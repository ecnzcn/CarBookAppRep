import { useLiveQuery } from 'dexie-react-hooks';
import { useState, type FormEvent } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { issueRepository } from '../../repositories/issueRepository';
import { issueService, IssueValidationError, type IssueInput } from '../../services/issueService';
import type { Issue } from '../../db/types';
import { issueSeverityOptions, issueStatusOptions } from './issueOptions';
import { DocumentAttachments } from '../documents/DocumentAttachments';
import { useActiveVehicle } from '../../app/useActiveVehicle';

function toInput(vehicleId: string, issue?: Issue): IssueInput {
  return {
    vehicleId,
    title: issue?.title ?? '',
    description: issue?.description ?? '',
    date: issue?.date ?? new Date().toISOString().slice(0, 10),
    mileage: issue?.mileage,
    status: issue?.status ?? 'open',
    severity: issue?.severity ?? 'medium',
    notes: issue?.notes ?? '',
  };
}

export function IssueFormPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { active } = useActiveVehicle();
  const isEditing = Boolean(id);

  const issue = useLiveQuery(async () => {
    if (!id) return undefined;
    return issueRepository.getById(id);
  }, [id]);

  const vehicleId = issue?.vehicleId ?? searchParams.get('vehicleId') ?? active?.id;

  const [input, setInput] = useState<IssueInput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (isEditing && issue === undefined) {
    return null;
  }
  if (!vehicleId) {
    return (
      <div className="card">
        <p>No vehicle selected. Add a vehicle first.</p>
      </div>
    );
  }

  const current = input ?? toInput(vehicleId, issue);

  function set<K extends keyof IssueInput>(key: K, value: IssueInput[K]) {
    setInput({ ...current, [key]: value });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (id) {
        await issueService.update(id, current);
      } else {
        await issueService.create(current);
      }
      navigate(-1);
    } catch (err) {
      setError(
        err instanceof IssueValidationError || err instanceof Error
          ? err.message
          : 'Something went wrong.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (!window.confirm('Delete this issue? This cannot be undone.')) return;
    await issueService.remove(id);
    navigate(-1);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>{isEditing ? 'Edit issue' : 'Add issue'}</h1>

      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            required
            placeholder='e.g. "Klong beim Einlegen von D"'
            value={current.title}
            onChange={(e) => set('title', e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            rows={3}
            value={current.description ?? ''}
            onChange={(e) => set('description', e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="field">
            <label htmlFor="date">Date</label>
            <input id="date" type="date" required value={current.date} onChange={(e) => set('date', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="mileage">Mileage</label>
            <input
              id="mileage"
              type="number"
              min={0}
              value={current.mileage ?? ''}
              onChange={(e) => set('mileage', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
          <div className="field">
            <label htmlFor="status">Status</label>
            <select id="status" value={current.status} onChange={(e) => set('status', e.target.value as Issue['status'])}>
              {issueStatusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="severity">Severity</label>
            <select
              id="severity"
              value={current.severity}
              onChange={(e) => set('severity', e.target.value as Issue['severity'])}
            >
              {issueSeverityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="notes">Notes</label>
          <textarea id="notes" rows={2} value={current.notes ?? ''} onChange={(e) => set('notes', e.target.value)} />
        </div>

        {error && <p style={{ color: 'var(--color-danger)', fontSize: 14 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
          <div>
            {isEditing && (
              <button type="button" className="btn btn-secondary" style={{ color: 'var(--color-danger)' }} onClick={handleDelete}>
                Delete
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Add issue'}
            </button>
          </div>
        </div>
      </form>

      {isEditing && id && (
        <div className="card">
          <h2 style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 10 }}>Documents</h2>
          <DocumentAttachments vehicleId={vehicleId} issueId={id} />
        </div>
      )}
    </div>
  );
}
