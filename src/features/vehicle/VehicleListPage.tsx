import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { vehicleRepository } from '../../repositories/vehicleRepository';
import { EmptyState } from '../../ui/components/EmptyState';

export function VehicleListPage() {
  const vehicles = useLiveQuery(() => vehicleRepository.getAll(), []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Fahrzeuge</h1>
        <Link to="/vehicles/new" className="btn btn-primary">
          Fahrzeug hinzufügen
        </Link>
      </div>

      {vehicles === undefined ? null : vehicles.length === 0 ? (
        <div className="card">
          <EmptyState>Noch keine Fahrzeuge. Füge dein erstes Fahrzeug hinzu, um dein Fahrtenbuch zu starten.</EmptyState>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {vehicles.map((vehicle) => (
            <Link key={vehicle.id} to={`/vehicles/${vehicle.id}`} className="card">
              <div style={{ fontWeight: 600, fontSize: 16 }}>
                {vehicle.manufacturer} {vehicle.model}
                {vehicle.year ? ` (${vehicle.year})` : ''}
              </div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: 14, marginTop: 4 }}>
                {vehicle.currentMileage.toLocaleString('de-DE')} km
                {vehicle.licensePlate ? ` · ${vehicle.licensePlate}` : ''}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
