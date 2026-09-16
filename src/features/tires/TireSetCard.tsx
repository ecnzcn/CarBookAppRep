import { useLiveQuery } from 'dexie-react-hooks';
import { useState, type FormEvent } from 'react';
import type { TireSet } from '../../db/types';
import { tireEventRepository } from '../../repositories/tireEventRepository';
import { tireService, type TireEventInput } from '../../services/tireService';
import { tireActionLabel, tireActionOptions, tireSeasonLabel } from './tireOptions';
import { TireSetForm } from './TireSetForm';
import { Badge } from '../../ui/components/Badge';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function TireSetCard({ set, vehicleId }: { set: TireSet; vehicleId: string }) {
  const [editing, setEditing] = useState(false);
  const [addingEvent, setAddingEvent] = useState(false);
  const [eventInput, setEventInput] = useState<Pick<TireEventInput, 'date' | 'mileage' | 'action' | 'notes'>>({
    date: todayIso(),
    mileage: undefined,
    action: 'mounted',
    notes: '',
  });
  const [eventError, setEventError] = useState<string | null>(null);

  const events = useLiveQuery(() => tireEventRepository.getByTireSet(set.id), [set.id]);

  if (editing) {
    return (
      <div className="card">
        <TireSetForm
          vehicleId={vehicleId}
          initial={set}
          onCancel={() => setEditing(false)}
          onSubmit={async (input) => {
            await tireService.sets.update(set.id, input);
            setEditing(false);
          }}
        />
      </div>
    );
  }

  async function handleDeleteSet() {
    if (!window.confirm('Delete this tire set and its events? This cannot be undone.')) return;
    await tireService.sets.remove(set.id);
  }

  async function handleAddEvent(event: FormEvent) {
    event.preventDefault();
    setEventError(null);
    try {
      await tireService.events.create({ tireSetId: set.id, ...eventInput }, vehicleId);
      setAddingEvent(false);
      setEventInput({ date: todayIso(), mileage: undefined, action: 'mounted', notes: '' });
    } catch (err) {
      setEventError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  async function handleRemoveEvent(id: string) {
    await tireService.events.remove(id);
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Badge tone="accent">{tireSeasonLabel(set.season)}</Badge>
            <strong>
              {set.manufacturer} {set.model}
            </strong>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: 4 }}>
            {[set.size, set.dot && `DOT ${set.dot}`, set.treadDepth !== undefined && `${set.treadDepth}mm`]
              .filter(Boolean)
              .join(' · ') || 'No details yet'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" style={{ padding: '4px 10px' }} onClick={() => setEditing(true)}>
            Edit
          </button>
          <button
            className="btn btn-secondary"
            style={{ padding: '4px 10px', color: 'var(--color-danger)' }}
            onClick={handleDeleteSet}
          >
            Delete
          </button>
        </div>
      </div>

      {events !== undefined && events.length > 0 && (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {events.map((ev) => (
            <li
              key={ev.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 13,
                borderTop: '1px solid var(--color-border)',
                paddingTop: 6,
              }}
            >
              <span>
                {ev.date} · {tireActionLabel(ev.action)}
                {ev.mileage !== undefined ? ` · ${ev.mileage.toLocaleString()} km` : ''}
                {ev.notes ? ` · ${ev.notes}` : ''}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveEvent(ev.id)}
                style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {addingEvent ? (
        <form onSubmit={handleAddEvent} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <div className="field">
              <label>Date</label>
              <input
                type="date"
                required
                value={eventInput.date}
                onChange={(e) => setEventInput((prev) => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="field">
              <label>Action</label>
              <select
                value={eventInput.action}
                onChange={(e) =>
                  setEventInput((prev) => ({ ...prev, action: e.target.value as TireEventInput['action'] }))
                }
              >
                {tireActionOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Mileage</label>
              <input
                type="number"
                min={0}
                value={eventInput.mileage ?? ''}
                onChange={(e) =>
                  setEventInput((prev) => ({
                    ...prev,
                    mileage: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
              />
            </div>
          </div>
          {eventError && <p style={{ color: 'var(--color-danger)', fontSize: 13 }}>{eventError}</p>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setAddingEvent(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add event
            </button>
          </div>
        </form>
      ) : (
        <button type="button" className="btn btn-secondary" style={{ alignSelf: 'flex-start' }} onClick={() => setAddingEvent(true)}>
          Add mount / remove event
        </button>
      )}
    </div>
  );
}
