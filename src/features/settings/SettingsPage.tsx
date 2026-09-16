import { Link } from 'react-router-dom';
import { useActiveVehicle } from '../../app/useActiveVehicle';
import { RemindersSection } from '../reminders/RemindersSection';
import { BackupSection } from './BackupSection';
import { EmptyState } from '../../ui/components/EmptyState';

export function SettingsPage() {
  const { vehicles, active } = useActiveVehicle();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Settings</h1>

      <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Vehicles</h2>
          <Link to="/vehicles/new" className="btn btn-secondary">
            Add vehicle
          </Link>
        </div>

        {vehicles === undefined ? null : vehicles.length === 0 ? (
          <EmptyState>No vehicles yet.</EmptyState>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {vehicles.map((vehicle) => (
              <Link
                key={vehicle.id}
                to={`/vehicles/${vehicle.id}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  border: '1px solid var(--color-border)',
                  borderRadius: 10,
                  padding: '10px 12px',
                  fontSize: 14,
                }}
              >
                <span>
                  {vehicle.manufacturer} {vehicle.model}
                </span>
                <span style={{ color: 'var(--color-text-muted)' }}>
                  {vehicle.currentMileage.toLocaleString()} km
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {active && (
        <section className="card">
          <RemindersSection vehicleId={active.id} currentMileage={active.currentMileage} />
        </section>
      )}

      <section className="card">
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Backup &amp; restore</h2>
        <BackupSection />
      </section>
    </div>
  );
}
