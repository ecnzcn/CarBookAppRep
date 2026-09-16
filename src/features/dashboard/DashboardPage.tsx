import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useActiveVehicle } from '../../app/useActiveVehicle';
import { EmptyState } from '../../ui/components/EmptyState';
import { Badge } from '../../ui/components/Badge';
import { maintenanceRepository } from '../../repositories/maintenanceRepository';
import { issueRepository } from '../../repositories/issueRepository';
import { fuelRepository } from '../../repositories/fuelRepository';
import { tireSetRepository } from '../../repositories/tireSetRepository';
import { tireEventRepository } from '../../repositories/tireEventRepository';
import { getMaintenanceDueStatus } from '../../services/maintenanceStatus';
import { costBreakdownForYear } from '../../services/costService';
import { buildTimeline } from '../../services/timelineService';
import { maintenanceTypeLabel } from '../maintenance/maintenanceOptions';
import { timelineTypeLabel, timelineTypeTone } from '../timeline/timelineDisplay';

function formatEuro(value: number): string {
  return value.toLocaleString(undefined, { style: 'currency', currency: 'EUR' });
}

export function DashboardPage() {
  const { vehicles, active, setActiveId } = useActiveVehicle();
  const vehicleId = active?.id;

  const data = useLiveQuery(async () => {
    if (!vehicleId) return undefined;
    const [maintenance, issues, fuel, tireSets] = await Promise.all([
      maintenanceRepository.getByVehicle(vehicleId),
      issueRepository.getByVehicle(vehicleId),
      fuelRepository.getByVehicle(vehicleId),
      tireSetRepository.getByVehicle(vehicleId),
    ]);
    const tireEventLists = await Promise.all(tireSets.map((set) => tireEventRepository.getByTireSet(set.id)));
    return { maintenance, issues, fuel, tireSets, tireEvents: tireEventLists.flat() };
  }, [vehicleId]);

  const dueEntries = useMemo(() => {
    if (!data || !active) return undefined;
    return data.maintenance
      .map((entry) => ({ entry, status: getMaintenanceDueStatus(entry, active.currentMileage) }))
      .filter((x) => x.status === 'dueSoon' || x.status === 'overdue');
  }, [data, active]);

  const openIssues = useMemo(() => {
    if (!data) return undefined;
    return data.issues.filter((i) => i.status !== 'resolved' && i.status !== 'dismissed');
  }, [data]);

  const annualCosts = useMemo(() => {
    if (!data) return undefined;
    return costBreakdownForYear(data, new Date().getFullYear());
  }, [data]);

  const recentActivity = useMemo(() => {
    if (!data) return undefined;
    return buildTimeline(data).slice(0, 5);
  }, [data]);

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

  if (!active) {
    return null;
  }

  const overdue = dueEntries?.filter((x) => x.status === 'overdue') ?? [];
  const dueSoon = dueEntries?.filter((x) => x.status === 'dueSoon') ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Dashboard</h1>
        {vehicles.length > 1 && (
          <select
            value={active.id}
            onChange={(e) => setActiveId(e.target.value)}
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
          {dueSoon.length === 0 ? (
            <EmptyState>Nothing due soon.</EmptyState>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {dueSoon.slice(0, 4).map(({ entry }) => (
                <li key={entry.id}>
                  <Link to={`/maintenance/${entry.id}/edit`} style={{ fontSize: 14 }}>
                    {entry.title}
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      {' '}
                      · {maintenanceTypeLabel(entry.type)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <h3 style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 8 }}>
            Overdue maintenance
          </h3>
          {overdue.length === 0 ? (
            <EmptyState>Nothing overdue.</EmptyState>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {overdue.slice(0, 4).map(({ entry }) => (
                <li key={entry.id}>
                  <Link to={`/maintenance/${entry.id}/edit`} style={{ fontSize: 14 }}>
                    <Badge tone="danger">overdue</Badge> {entry.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <h3 style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 8 }}>
            Open issues
          </h3>
          {!openIssues || openIssues.length === 0 ? (
            <EmptyState>No open issues.</EmptyState>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {openIssues.slice(0, 4).map((issue) => (
                <li key={issue.id}>
                  <Link to={`/issues/${issue.id}/edit`} style={{ fontSize: 14 }}>
                    {issue.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <Link to="/costs" className="card" style={{ display: 'block' }}>
          <h3 style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 8 }}>
            Annual costs ({new Date().getFullYear()})
          </h3>
          {annualCosts === undefined ? (
            <EmptyState>No cost data yet.</EmptyState>
          ) : annualCosts.total === 0 ? (
            <EmptyState>No costs recorded yet.</EmptyState>
          ) : (
            <p style={{ fontSize: 24, fontWeight: 700 }}>{formatEuro(annualCosts.total)}</p>
          )}
        </Link>
      </div>

      <section className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Recent activity</h3>
          <Link to="/timeline" style={{ fontSize: 13, color: 'var(--color-accent)' }}>
            View timeline
          </Link>
        </div>
        {!recentActivity || recentActivity.length === 0 ? (
          <EmptyState>Your vehicle timeline will appear here.</EmptyState>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentActivity.map((entry) => (
              <li key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14 }}>
                  <Badge tone={timelineTypeTone(entry.type)}>{timelineTypeLabel(entry.type)}</Badge>
                  {entry.title}
                </span>
                <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{entry.date}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
