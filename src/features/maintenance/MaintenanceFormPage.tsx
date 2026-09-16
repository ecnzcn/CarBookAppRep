import { useLiveQuery } from 'dexie-react-hooks';
import { useState, type FormEvent } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { maintenanceRepository } from '../../repositories/maintenanceRepository';
import {
  maintenanceService,
  MaintenanceValidationError,
  type MaintenanceInput,
} from '../../services/maintenanceService';
import type { Maintenance } from '../../db/types';
import { maintenanceTypeOptions } from './maintenanceOptions';
import { DocumentAttachments } from '../documents/DocumentAttachments';
import { useActiveVehicle } from '../../app/useActiveVehicle';

function toInput(vehicleId: string, entry?: Maintenance): MaintenanceInput {
  return {
    vehicleId,
    date: entry?.date ?? new Date().toISOString().slice(0, 10),
    mileage: entry?.mileage ?? 0,
    type: entry?.type ?? 'maintenance',
    title: entry?.title ?? '',
    description: entry?.description ?? '',
    cost: entry?.cost,
    workshop: entry?.workshop ?? '',
    nextMileage: entry?.nextMileage,
    nextDate: entry?.nextDate ?? '',
    notes: entry?.notes ?? '',
  };
}

export function MaintenanceFormPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { active } = useActiveVehicle();
  const isEditing = Boolean(id);

  const entry = useLiveQuery(async () => {
    if (!id) return undefined;
    return maintenanceRepository.getById(id);
  }, [id]);

  const vehicleId = entry?.vehicleId ?? searchParams.get('vehicleId') ?? active?.id;

  const [input, setInput] = useState<MaintenanceInput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (isEditing && entry === undefined) {
    return null;
  }
  if (!vehicleId) {
    return (
      <div className="card">
        <p>No vehicle selected. Add a vehicle first.</p>
      </div>
    );
  }

  const current = input ?? toInput(vehicleId, entry);

  function set<K extends keyof MaintenanceInput>(key: K, value: MaintenanceInput[K]) {
    setInput({ ...current, [key]: value });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (id) {
        await maintenanceService.update(id, current);
      } else {
        await maintenanceService.create(current);
      }
      navigate(-1);
    } catch (err) {
      setError(
        err instanceof MaintenanceValidationError || err instanceof Error
          ? err.message
          : 'Something went wrong.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (!window.confirm('Delete this entry? This cannot be undone.')) return;
    await maintenanceService.remove(id);
    navigate(-1);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>
        {isEditing ? 'Edit maintenance entry' : 'Add maintenance entry'}
      </h1>

      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="field">
          <label htmlFor="title">Title</label>
          <input id="title" required value={current.title} onChange={(e) => set('title', e.target.value)} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="field">
            <label htmlFor="type">Type</label>
            <select id="type" value={current.type} onChange={(e) => set('type', e.target.value as Maintenance['type'])}>
              {maintenanceTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
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
              required
              value={current.mileage}
              onChange={(e) => set('mileage', Number(e.target.value))}
            />
          </div>
          <div className="field">
            <label htmlFor="cost">Cost</label>
            <input
              id="cost"
              type="number"
              min={0}
              step="0.01"
              value={current.cost ?? ''}
              onChange={(e) => set('cost', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
          <div className="field">
            <label htmlFor="workshop">Workshop</label>
            <input id="workshop" value={current.workshop ?? ''} onChange={(e) => set('workshop', e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            rows={2}
            value={current.description ?? ''}
            onChange={(e) => set('description', e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="field">
            <label htmlFor="nextDate">Next due date</label>
            <input
              id="nextDate"
              type="date"
              value={current.nextDate ?? ''}
              onChange={(e) => set('nextDate', e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="nextMileage">Next due mileage</label>
            <input
              id="nextMileage"
              type="number"
              min={0}
              value={current.nextMileage ?? ''}
              onChange={(e) => set('nextMileage', e.target.value ? Number(e.target.value) : undefined)}
            />
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
              {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Add entry'}
            </button>
          </div>
        </div>
      </form>

      {isEditing && id && (
        <div className="card">
          <h2 style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 10 }}>Documents</h2>
          <DocumentAttachments vehicleId={vehicleId} maintenanceId={id} />
        </div>
      )}
    </div>
  );
}
