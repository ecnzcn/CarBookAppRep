import { useState, type FormEvent } from 'react';
import type { TireSet } from '../../db/types';
import type { TireSetInput } from '../../services/tireService';
import { tireSeasonOptions } from './tireOptions';
import { NumberInput } from '../../ui/components/NumberInput';

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
      setError(err instanceof Error ? err.message : 'Etwas ist schiefgelaufen.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 12 }}>
        <div className="field">
          <label htmlFor="season">Saison</label>
          <select id="season" value={input.season} onChange={(e) => set('season', e.target.value as TireSet['season'])}>
            {tireSeasonOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="manufacturer">Hersteller</label>
          <input id="manufacturer" value={input.manufacturer ?? ''} onChange={(e) => set('manufacturer', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="model">Modell</label>
          <input id="model" value={input.model ?? ''} onChange={(e) => set('model', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="size">Größe</label>
          <input id="size" placeholder="205/55 R16" value={input.size ?? ''} onChange={(e) => set('size', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="dot">DOT</label>
          <input id="dot" value={input.dot ?? ''} onChange={(e) => set('dot', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="treadDepth">Profiltiefe (mm)</label>
          <NumberInput id="treadDepth" decimal value={input.treadDepth} onChange={(v) => set('treadDepth', v)} />
        </div>
        <div className="field">
          <label htmlFor="purchaseDate">Kaufdatum</label>
          <input
            id="purchaseDate"
            type="date"
            value={input.purchaseDate ?? ''}
            onChange={(e) => set('purchaseDate', e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="purchaseMileage">Kilometerstand beim Kauf</label>
          <NumberInput id="purchaseMileage" value={input.purchaseMileage} onChange={(v) => set('purchaseMileage', v)} />
        </div>
        <div className="field">
          <label htmlFor="cost">Kosten</label>
          <NumberInput id="cost" decimal value={input.cost} onChange={(v) => set('cost', v)} />
        </div>
      </div>

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
          {saving ? 'Wird gespeichert…' : 'Reifensatz speichern'}
        </button>
      </div>
    </form>
  );
}
