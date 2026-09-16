import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, useParams } from 'react-router-dom';
import { vehicleRepository } from '../../repositories/vehicleRepository';
import { vehicleService, type VehicleInput } from '../../services/vehicleService';
import { VehicleForm } from './VehicleForm';

export function VehicleFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const vehicle = useLiveQuery(
    () => (id ? vehicleRepository.getById(id) : undefined),
    [id],
  );

  if (isEditing && vehicle === undefined) {
    return null;
  }

  async function handleSubmit(input: VehicleInput) {
    if (id) {
      await vehicleService.update(id, input);
      navigate(`/vehicles/${id}`);
    } else {
      const created = await vehicleService.create(input);
      navigate(`/vehicles/${created.id}`);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>
        {isEditing ? 'Edit vehicle' : 'Add vehicle'}
      </h1>
      <div className="card">
        <VehicleForm
          initial={vehicle}
          submitLabel={isEditing ? 'Save changes' : 'Add vehicle'}
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  );
}
