import { useLiveQuery } from 'dexie-react-hooks';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { vehicleRepository } from '../../repositories/vehicleRepository';
import { vehicleService } from '../../services/vehicleService';
import { fuelTypeOptions, transmissionOptions, drivetrainOptions } from './vehicleOptions';

function labelFor(options: { value: string; label: string }[], value?: string) {
  return options.find((opt) => opt.value === value)?.label ?? value ?? '—';
}

export function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const vehicle = useLiveQuery(async () => {
    if (!id) return undefined;
    const found = await vehicleRepository.getById(id);
    return found ?? null;
  }, [id]);

  if (vehicle === undefined) {
    return null;
  }

  if (vehicle === null) {
    return (
      <div className="card">
        <p>Vehicle not found.</p>
        <Link to="/vehicles" className="btn btn-secondary" style={{ marginTop: 12 }}>
          Back to vehicles
        </Link>
      </div>
    );
  }

  async function handleDelete() {
    if (!id) return;
    if (!window.confirm('Delete this vehicle and all of its data? This cannot be undone.')) {
      return;
    }
    await vehicleService.remove(id);
    navigate('/vehicles');
  }

  const rows: [string, string][] = [
    ['Series / Trim', vehicle.series || '—'],
    ['Year', vehicle.year ? String(vehicle.year) : '—'],
    ['Engine', vehicle.engine || '—'],
    ['Fuel type', labelFor(fuelTypeOptions, vehicle.fuelType)],
    ['Transmission', labelFor(transmissionOptions, vehicle.transmission)],
    ['Drivetrain', labelFor(drivetrainOptions, vehicle.drivetrain)],
    ['VIN', vehicle.vin || '—'],
    ['License plate', vehicle.licensePlate || '—'],
    ['Purchase date', vehicle.purchaseDate || '—'],
    [
      'Purchase price',
      vehicle.purchasePrice !== undefined ? `${vehicle.purchasePrice.toLocaleString()}` : '—',
    ],
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>
            {vehicle.manufacturer} {vehicle.model}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>
            {vehicle.currentMileage.toLocaleString()} km
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to={`/vehicles/${vehicle.id}/edit`} className="btn btn-secondary">
            Edit
          </Link>
          <button className="btn btn-secondary" onClick={handleDelete} style={{ color: 'var(--color-danger)' }}>
            Delete
          </button>
        </div>
      </div>

      <div className="card">
        <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, margin: 0 }}>
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{label}</dt>
              <dd style={{ margin: '2px 0 0', fontSize: 15 }}>{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {vehicle.notes && (
        <div className="card">
          <h2 style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 8 }}>
            Notes
          </h2>
          <p style={{ fontSize: 15, whiteSpace: 'pre-wrap' }}>{vehicle.notes}</p>
        </div>
      )}
    </div>
  );
}
