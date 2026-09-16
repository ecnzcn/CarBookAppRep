import { useState, type FormEvent } from 'react';
import type { TireSet } from '../../db/types';
import type { TireSetInput } from '../../services/tireService';
import { tireSeasonOptions } from './tireOptions';

function toInput(vehicleId: string, set?: TireSet): TireSetInput {
  return {
    vehicleId,
    season: set?.season ?? 'summer',
    manufacturer: set?.manufacturer ?? '',
    model: set?.model ?? '',
    size: set?.size ?? '',
    dot: set?.dot ?? '',
    purchaseDate: set?.purchaseDate ?? '',
    purchaseMileage: set?.purchaseMileage,
    treadDepth: set?.treadDepth,
    cost: set?.cost,
    notes: set?.notes ?? '',
  };
}

interface TireSetFormProps {
  vehicleId: string;
  initial?: TireSet;
  onSubmit: (input: TireSetInput) => Promise<void>;
  onCancel: () => void;
}

export function TireSetForm({ vehicleId, initial, onSubmit, onCancel }: TireSetFormProps) {
  const [input, setInput] = useState<TireSetInput>(() => toInput(vehicleId, initial));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof TireSetInput>(key: K, value: TireSetInput[K]) {
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="field">
          <label htmlFor="season">Season</label>
          <select id="season" value={input.season} onChange={(e) => set('season', e.target.value as TireSet['season'])}>
            {tireSeasonOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="manufacturer">Manufacturer</label>
          <input id="manufacturer" value={input.manufacturer ?? ''} onChange={(e) => set('manufacturer', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="model">Model</label>
          <input id="model" value={input.model ?? ''} onChange={(e) => set('model', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="size">Size</label>
          <input id="size" placeholder="205/55 R16" value={input.size ?? ''} onChange={(e) => set('size', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="dot">DOT</label>
          <input id="dot" value={input.dot ?? ''} onChange={(e) => set('dot', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="treadDepth">Tread depth (mm)</label>
          <input
            id="treadDepth"
            type="number"
            min={0}
            step="0.1"
            value={input.treadDepth ?? ''}
            onChange={(e) => set('treadDepth', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
        <div className="field">
          <label htmlFor="purchaseDate">Purchase date</label>
          <input
            id="purchaseDate"
            type="date"
            value={input.purchaseDate ?? ''}
            onChange={(e) => set('purchaseDate', e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="purchaseMileage">Purchase mileage</label>
          <input
            id="purchaseMileage"
            type="number"
            min={0}
            value={input.purchaseMileage ?? ''}
            onChange={(e) => set('purchaseMileage', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
        <div className="field">
          <label htmlFor="cost">Cost</label>
          <input
            id="cost"
            type="number"
            min={0}
            step="0.01"
            value={input.cost ?? ''}
            onChange={(e) => set('cost', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
      </div>

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
          {saving ? 'Saving…' : 'Save tire set'}
        </button>
      </div>
    </form>
  );
}
