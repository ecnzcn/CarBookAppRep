import { useState, type FormEvent } from 'react';
import type { Reminder } from '../../db/types';
import type { ReminderInput } from '../../services/reminderService';
import { NumberInput } from '../../ui/components/NumberInput';

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
      setError(err instanceof Error ? err.message : 'Etwas ist schiefgelaufen.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="field">
        <label htmlFor="title">Titel</label>
        <input id="title" required value={input.title} onChange={(e) => set('title', e.target.value)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 12 }}>
        <div className="field">
          <label htmlFor="dueDate">Fällig am</label>
          <input id="dueDate" type="date" value={input.dueDate ?? ''} onChange={(e) => set('dueDate', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="dueMileage">Fällig bei (km)</label>
          <NumberInput id="dueMileage" value={input.dueMileage} onChange={(v) => set('dueMileage', v)} />
        </div>
        <div className="field">
          <label htmlFor="repeatIntervalDays">Wiederholung (Tage)</label>
          <NumberInput id="repeatIntervalDays" value={input.repeatIntervalDays} onChange={(v) => set('repeatIntervalDays', v)} />
        </div>
        <div className="field">
          <label htmlFor="repeatIntervalMileage">Wiederholung (km)</label>
          <NumberInput id="repeatIntervalMileage" value={input.repeatIntervalMileage} onChange={(v) => set('repeatIntervalMileage', v)} />
        </div>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
        <input type="checkbox" checked={input.enabled} onChange={(e) => set('enabled', e.target.checked)} />
        Aktiviert
      </label>

      <div className="field">
        <label htmlFor="notes">Notizen</label>
        <textarea id="notes" rows={2} value={input.notes ?? ''} onChange={(e) => set('notes', e.target.value)} />
      </div>

      {error && <p style={{ color: 'var(--color-danger)', fontSize: 13 }}>{error}</p>}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Abbrechen
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Wird gespeichert…' : 'Erinnerung speichern'}
        </button>
      </div>
    </form>
  );
}
