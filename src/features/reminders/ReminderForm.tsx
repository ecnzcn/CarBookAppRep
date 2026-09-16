import { useState, type FormEvent } from 'react';
import type { Reminder } from '../../db/types';
import type { ReminderInput } from '../../services/reminderService';

function toInput(vehicleId: string, reminder?: Reminder): ReminderInput {
  return {
    vehicleId,
    title: reminder?.title ?? '',
    dueDate: reminder?.dueDate ?? '',
    dueMileage: reminder?.dueMileage,
    repeatIntervalDays: reminder?.repeatIntervalDays,
    repeatIntervalMileage: reminder?.repeatIntervalMileage,
    enabled: reminder?.enabled ?? true,
    notes: reminder?.notes ?? '',
  };
}

interface ReminderFormProps {
  vehicleId: string;
  initial?: Reminder;
  onSubmit: (input: ReminderInput) => Promise<void>;
  onCancel: () => void;
}

export function ReminderForm({ vehicleId, initial, onSubmit, onCancel }: ReminderFormProps) {
  const [input, setInput] = useState<ReminderInput>(() => toInput(vehicleId, initial));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof ReminderInput>(key: K, value: ReminderInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSubmit(input);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="field">
        <label htmlFor="title">Title</label>
        <input id="title" required value={input.title} onChange={(e) => set('title', e.target.value)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="field">
          <label htmlFor="dueDate">Due date</label>
          <input id="dueDate" type="date" value={input.dueDate ?? ''} onChange={(e) => set('dueDate', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="dueMileage">Due mileage</label>
          <input
            id="dueMileage"
            type="number"
            min={0}
            value={input.dueMileage ?? ''}
            onChange={(e) => set('dueMileage', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
        <div className="field">
          <label htmlFor="repeatIntervalDays">Repeat every (days)</label>
          <input
            id="repeatIntervalDays"
            type="number"
            min={0}
            value={input.repeatIntervalDays ?? ''}
            onChange={(e) => set('repeatIntervalDays', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
        <div className="field">
          <label htmlFor="repeatIntervalMileage">Repeat every (km)</label>
          <input
            id="repeatIntervalMileage"
            type="number"
            min={0}
            value={input.repeatIntervalMileage ?? ''}
            onChange={(e) => set('repeatIntervalMileage', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
        <input type="checkbox" checked={input.enabled} onChange={(e) => set('enabled', e.target.checked)} />
        Enabled
      </label>

      <div className="field">
        <label htmlFor="notes">Notes</label>
        <textarea id="notes" rows={2} value={input.notes ?? ''} onChange={(e) => set('notes', e.target.value)} />
      </div>

      {error && <p style={{ color: 'var(--color-danger)', fontSize: 13 }}>{error}</p>}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save reminder'}
        </button>
      </div>
    </form>
  );
}
