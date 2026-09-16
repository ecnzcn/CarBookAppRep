import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { vehicleRepository } from '../../repositories/vehicleRepository';
import { tireSetRepository } from '../../repositories/tireSetRepository';
import { tireService } from '../../services/tireService';
import { TireSetForm } from './TireSetForm';
import { TireSetCard } from './TireSetCard';
import { EmptyState } from '../../ui/components/EmptyState';

export function TiresPage() {
  const { id: vehicleId } = useParams<{ id: string }>();
  const [adding, setAdding] = useState(false);

  const vehicle = useLiveQuery(() => (vehicleId ? vehicleRepository.getById(vehicleId) : undefined), [vehicleId]);
  const sets = useLiveQuery(() => (vehicleId ? tireSetRepository.getByVehicle(vehicleId) : []), [vehicleId]);

  if (!vehicleId || vehicle === undefined || sets === undefined) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <Link to={`/vehicles/${vehicleId}`} style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
          ← {vehicle?.manufacturer} {vehicle?.model}
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Tires</h1>
          {!adding && (
            <button className="btn btn-primary" onClick={() => setAdding(true)}>
              Add tire set
            </button>
          )}
        </div>
      </div>

      {adding && (
        <div className="card">
          <TireSetForm
            vehicleId={vehicleId}
            onCancel={() => setAdding(false)}
            onSubmit={async (input) => {
              await tireService.sets.create(input);
              setAdding(false);
            }}
          />
        </div>
      )}

      {sets.length === 0 && !adding ? (
        <div className="card">
          <EmptyState>No tire sets yet. Add your summer, winter, or all-season set.</EmptyState>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sets.map((set) => (
            <TireSetCard key={set.id} set={set} vehicleId={vehicleId} />
          ))}
        </div>
      )}
    </div>
  );
}
