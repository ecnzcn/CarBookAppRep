import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { vehicleRepository } from '../../repositories/vehicleRepository';
import { EmptyState } from '../../ui/components/EmptyState';

const SELECTED_VEHICLE_KEY = 'carbook:selectedVehicleId';

function readStoredSelection(): string | null {
  try {
    return localStorage.getItem(SELECTED_VEHICLE_KEY);
  } catch {
    return null;
  }
}

function storeSelection(id: string) {
  try {
    localStorage.setItem(SELECTED_VEHICLE_KEY, id);
  } catch {
    // Ignore storage failures (private browsing, quota, etc).
  }
}

export function DashboardPage() {
  const vehicles = useLiveQuery(() => vehicleRepository.getAll(), []);
  const [selectedId, setSelectedId] = useState<string | null>(() => readStoredSelection());

  if (vehicles === undefined) {
    return null;
  }

  if (vehicles.length === 0) {
    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Welcome to CarBook</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>
            Add your first vehicle to start building its digital logbook.
          </p>
        </div>
        <Link to="/vehicles/new" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
          Add vehicle
        </Link>
      </div>
    );
  }

  const active =
    vehicles.find((v) => v.id === selectedId) ?? vehicles[0];

  function handleSelect(id: string) {
    setSelectedId(id);
    storeSelection(id);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Dashboard</h1>
        {vehicles.length > 1 && (
          <select
            value={active.id}
            onChange={(e) => handleSelect(e.target.value)}
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 10,
              padding: '8px 10px',
              color: 'var(--color-text)',
            }}
          >
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.manufacturer} {v.model}
              </option>
            ))}
          </select>
        )}
      </div>

      <Link to={`/vehicles/${active.id}`} className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>
            {active.manufacturer} {active.model}
            {active.year ? ` (${active.year})` : ''}
          </h2>
        </div>
        <p style={{ fontSize: 32, fontWeight: 700, marginTop: 12 }}>
          {active.currentMileage.toLocaleString()}
          <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-muted)' }}>
            {' '}
            km
          </span>
        </p>
      </Link>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        <section className="card">
          <h3 style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 8 }}>
            Upcoming maintenance
          </h3>
          <EmptyState>No maintenance records yet.</EmptyState>
        </section>

        <section className="card">
          <h3 style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 8 }}>
            Overdue maintenance
          </h3>
          <EmptyState>Nothing overdue.</EmptyState>
        </section>

        <section className="card">
          <h3 style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 8 }}>
            Open issues
          </h3>
          <EmptyState>No open issues.</EmptyState>
        </section>

        <section className="card">
          <h3 style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 8 }}>
            Annual costs
          </h3>
          <EmptyState>No cost data yet.</EmptyState>
        </section>
      </div>

      <section className="card">
        <h3 style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 8 }}>
          Recent activity
        </h3>
        <EmptyState>Your vehicle timeline will appear here.</EmptyState>
      </section>
    </div>
  );
}
