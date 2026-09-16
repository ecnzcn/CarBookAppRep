import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo, useState } from 'react';
import { useActiveVehicle } from '../../app/useActiveVehicle';
import { maintenanceRepository } from '../../repositories/maintenanceRepository';
import { fuelRepository } from '../../repositories/fuelRepository';
import { tireSetRepository } from '../../repositories/tireSetRepository';
import { tireEventRepository } from '../../repositories/tireEventRepository';
import {
  availableYears,
  costBreakdownForYear,
  costPerKm,
  estimateKmDrivenInYear,
  type MileageReading,
} from '../../services/costService';
import { BarChart } from '../../ui/components/BarChart';
import { EmptyState } from '../../ui/components/EmptyState';

function formatEuro(value: number): string {
  return value.toLocaleString(undefined, { style: 'currency', currency: 'EUR' });
}

export function CostsPage() {
  const { active } = useActiveVehicle();
  const vehicleId = active?.id;

  const data = useLiveQuery(async () => {
    if (!vehicleId) return undefined;
    const [maintenance, fuel, tireSets] = await Promise.all([
      maintenanceRepository.getByVehicle(vehicleId),
      fuelRepository.getByVehicle(vehicleId),
      tireSetRepository.getByVehicle(vehicleId),
    ]);
    const tireEventLists = await Promise.all(tireSets.map((set) => tireEventRepository.getByTireSet(set.id)));
    return { maintenance, fuel, tireSets, tireEvents: tireEventLists.flat() };
  }, [vehicleId]);

  const [year, setYear] = useState<number>(() => new Date().getFullYear());

  const years = useMemo(() => {
    if (!data) return [year];
    return availableYears([...data.maintenance, ...data.fuel]);
  }, [data, year]);

  const breakdown = useMemo(() => {
    if (!data) return undefined;
    return costBreakdownForYear(data, year);
  }, [data, year]);

  const kmDriven = useMemo(() => {
    if (!data || !active) return undefined;
    const readings: MileageReading[] = [
      ...data.maintenance.map((m) => ({ date: m.date, mileage: m.mileage })),
      ...data.fuel.map((f) => ({ date: f.date, mileage: f.mileage })),
      ...data.tireEvents
        .filter((e): e is typeof e & { mileage: number } => e.mileage !== undefined)
        .map((e) => ({ date: e.date, mileage: e.mileage })),
      ...data.tireSets
        .filter((s): s is typeof s & { purchaseMileage: number } => s.purchaseMileage !== undefined && Boolean(s.purchaseDate))
        .map((s) => ({ date: s.purchaseDate as string, mileage: s.purchaseMileage })),
      { date: active.updatedAt, mileage: active.currentMileage },
    ];
    return estimateKmDrivenInYear(readings, year);
  }, [data, active, year]);

  if (!vehicleId) {
    return (
      <div className="card">
        <EmptyState>Add a vehicle first to see its costs.</EmptyState>
      </div>
    );
  }

  if (!breakdown) {
    return null;
  }

  const perKm = costPerKm(breakdown.total, kmDriven);

  const chartData = [
    { label: 'Maintenance', value: breakdown.maintenance },
    { label: 'Repairs', value: breakdown.repair },
    { label: 'Service', value: breakdown.service },
    { label: 'Inspection', value: breakdown.inspection },
    { label: 'Fuel', value: breakdown.fuel },
    { label: 'Tires', value: breakdown.tires },
  ].filter((d) => d.value > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Costs</h1>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            padding: '8px 10px',
            color: 'var(--color-text)',
          }}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
        <div className="card">
          <h3 style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 }}>Total {year}</h3>
          <p style={{ fontSize: 26, fontWeight: 700 }}>{formatEuro(breakdown.total)}</p>
        </div>
        <div className="card">
          <h3 style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 }}>Cost / km</h3>
          <p style={{ fontSize: 26, fontWeight: 700 }}>
            {perKm !== undefined ? `${perKm.toLocaleString(undefined, { style: 'currency', currency: 'EUR', maximumFractionDigits: 3 })}` : '—'}
          </p>
          {perKm === undefined && (
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
              Not enough mileage data for {year} yet.
            </p>
          )}
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 14 }}>Breakdown</h3>
        {chartData.length === 0 ? (
          <EmptyState>No costs recorded for {year} yet.</EmptyState>
        ) : (
          <BarChart data={chartData} />
        )}
      </div>
    </div>
  );
}
