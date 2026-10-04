import { useState, type FormEvent } from 'react';
import type { Vehicle } from '../../db/types';
import type { VehicleInput } from '../../services/vehicleService';
import { drivetrainOptions, fuelTypeOptions, transmissionOptions } from './vehicleOptions';

interface VehicleFormProps {
  initial?: Vehicle;
  submitLabel: string;
  onSubmit: (input: VehicleInput) => Promise<void>;
  onCancel: () => void;
}

function toInput(vehicle?: Vehicle): VehicleInput {
  return {
    manufacturer: vehicle?.manufacturer ?? '',
    model: vehicle?.model ?? '',
    series: vehicle?.series ?? '',
    year: vehicle?.year,
    engine: vehicle?.engine ?? '',
    fuelType: vehicle?.fuelType,
    transmission: vehicle?.transmission,
    drivetrain: vehicle?.drivetrain,
    vin: vehicle?.vin ?? '',
    licensePlate: vehicle?.licensePlate ?? '',
    currentMileage: vehicle?.currentMileage ?? 0,
    purchaseDate: vehicle?.purchaseDate ?? '',
    purchasePrice: vehicle?.purchasePrice,
    notes: vehicle?.notes ?? '',
  };
}

export function VehicleForm({ initial, submitLabel, onSubmit, onCancel }: VehicleFormProps) {
  const [input, setInput] = useState<VehicleInput>(() => toInput(initial));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof VehicleInput>(key: K, value: VehicleInput[K]) {
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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 16 }}>
        <div className="field">
          <label htmlFor="manufacturer">Hersteller</label>
          <input
            id="manufacturer"
            required
            value={input.manufacturer}
            onChange={(e) => set('manufacturer', e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="model">Modell</label>
          <input
            id="model"
            required
            value={input.model}
            onChange={(e) => set('model', e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="series">Baureihe / Ausstattung</label>
          <input
            id="series"
            value={input.series ?? ''}
            onChange={(e) => set('series', e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="year">Baujahr</label>
          <input
            id="year"
            type="number"
            value={input.year ?? ''}
            onChange={(e) => set('year', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
        <div className="field">
          <label htmlFor="engine">Motor</label>
          <input
            id="engine"
            value={input.engine ?? ''}
            onChange={(e) => set('engine', e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="fuelType">Kraftstoff</label>
          <select
            id="fuelType"
            value={input.fuelType ?? ''}
            onChange={(e) =>
              set('fuelType', (e.target.value || undefined) as VehicleInput['fuelType'])
            }
          >
            <option value="">Auswählen…</option>
            {fuelTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="transmission">Getriebe</label>
          <select
            id="transmission"
            value={input.transmission ?? ''}
            onChange={(e) =>
              set(
                'transmission',
                (e.target.value || undefined) as VehicleInput['transmission'],
              )
            }
          >
            <option value="">Auswählen…</option>
            {transmissionOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="drivetrain">Antrieb</label>
          <select
            id="drivetrain"
            value={input.drivetrain ?? ''}
            onChange={(e) =>
              set('drivetrain', (e.target.value || undefined) as VehicleInput['drivetrain'])
            }
          >
            <option value="">Auswählen…</option>
            {drivetrainOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="vin">FIN</label>
          <input id="vin" value={input.vin ?? ''} onChange={(e) => set('vin', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="licensePlate">Kennzeichen</label>
          <input
            id="licensePlate"
            value={input.licensePlate ?? ''}
            onChange={(e) => set('licensePlate', e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="currentMileage">Aktueller Kilometerstand</label>
          <input
            id="currentMileage"
            type="number"
            min={0}
            required
            value={input.currentMileage}
            onChange={(e) => set('currentMileage', Number(e.target.value))}
          />
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
          <label htmlFor="purchasePrice">Kaufpreis</label>
          <input
            id="purchasePrice"
            type="number"
            min={0}
            value={input.purchasePrice ?? ''}
            onChange={(e) =>
              set('purchasePrice', e.target.value ? Number(e.target.value) : undefined)
            }
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="notes">Notizen</label>
        <textarea
          id="notes"
          rows={3}
          value={input.notes ?? ''}
          onChange={(e) => set('notes', e.target.value)}
        />
      </div>

      {error && <p style={{ color: 'var(--color-danger)', fontSize: 14 }}>{error}</p>}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Abbrechen
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Wird gespeichert…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
