import { useLiveQuery } from 'dexie-react-hooks';
import { useState, type FormEvent } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { fuelRepository } from '../../repositories/fuelRepository';
import { fuelService, FuelValidationError, type FuelInput } from '../../services/fuelService';
import type { FuelEntry } from '../../db/types';
import { useActiveVehicle } from '../../app/useActiveVehicle';

function toInput(vehicleId: string, entry?: FuelEntry): FuelInput {
  return {
    vehicleId,
    date: entry?.date ?? new Date().toISOString().slice(0, 10),
    mileage: entry?.mileage ?? 0,
    liters: entry?.liters ?? 0,
    pricePerLiter: entry?.pricePerLiter ?? 0,
    totalCost: entry?.totalCost ?? 0,
    station: entry?.station ?? '',
    notes: entry?.notes ?? '',
  };
}

export function FuelFormPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { active } = useActiveVehicle();
  const isEditing = Boolean(id);

  const entry = useLiveQuery(async () => {
    if (!id) return undefined;
    return fuelRepository.getById(id);
  }, [id]);

  const vehicleId = entry?.vehicleId ?? searchParams.get('vehicleId') ?? active?.id;

  const [input, setInput] = useState<FuelInput | null>(null);
  const [totalCostTouched, setTotalCostTouched] = useState(false);
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

  function set<K extends keyof FuelInput>(key: K, value: FuelInput[K]) {
    const next = { ...current, [key]: value };
    if ((key === 'liters' || key === 'pricePerLiter') && !totalCostTouched) {
      next.totalCost = Math.round(next.liters * next.pricePerLiter * 100) / 100;
    }
    setInput(next);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (id) {
        await fuelService.update(id, current);
      } else {
        await fuelService.create(current);
      }
      navigate(-1);
    } catch (err) {
      setError(
        err instanceof FuelValidationError || err instanceof Error
          ? err.message
          : 'Something went wrong.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (!window.confirm('Delete this fuel entry? This cannot be undone.')) return;
    await fuelService.remove(id);
    navigate(-1);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>{isEditing ? 'Edit fill-up' : 'Add fill-up'}</h1>

      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
              required
              value={current.mileage}
              onChange={(e) => set('mileage', Number(e.target.value))}
            />
          </div>
          <div className="field">
            <label htmlFor="liters">Liters</label>
            <input
              id="liters"
              type="number"
              min={0}
              step="0.01"
              required
              value={current.liters}
              onChange={(e) => set('liters', Number(e.target.value))}
            />
          </div>
          <div className="field">
            <label htmlFor="pricePerLiter">Price / liter</label>
            <input
              id="pricePerLiter"
              type="number"
              min={0}
              step="0.001"
              required
              value={current.pricePerLiter}
              onChange={(e) => set('pricePerLiter', Number(e.target.value))}
            />
          </div>
          <div className="field">
            <label htmlFor="totalCost">Total cost</label>
            <input
              id="totalCost"
              type="number"
              min={0}
              step="0.01"
              required
              value={current.totalCost}
              onChange={(e) => {
                setTotalCostTouched(true);
                set('totalCost', Number(e.target.value));
              }}
            />
          </div>
          <div className="field">
            <label htmlFor="station">Station</label>
            <input id="station" value={current.station ?? ''} onChange={(e) => set('station', e.target.value)} />
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
              {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Add fill-up'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
