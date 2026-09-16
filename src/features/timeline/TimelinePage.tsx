import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useActiveVehicle } from '../../app/useActiveVehicle';
import { maintenanceRepository } from '../../repositories/maintenanceRepository';
import { issueRepository } from '../../repositories/issueRepository';
import { fuelRepository } from '../../repositories/fuelRepository';
import { tireSetRepository } from '../../repositories/tireSetRepository';
import { tireEventRepository } from '../../repositories/tireEventRepository';
import { documentRepository } from '../../repositories/documentRepository';
import { buildTimeline, type TimelineEntryType } from '../../services/timelineService';
import { filterTimelineEntries, matchesText } from '../../services/timelineFilter';
import { timelineTypeLabel, timelineTypeOptions, timelineTypeTone } from './timelineDisplay';
import { Badge } from '../../ui/components/Badge';
import { EmptyState } from '../../ui/components/EmptyState';
import styles from './Timeline.module.css';

interface AdvancedFilters {
  from: string;
  to: string;
  minCost: string;
  maxCost: string;
  minMileage: string;
  maxMileage: string;
}

const emptyAdvancedFilters: AdvancedFilters = {
  from: '',
  to: '',
  minCost: '',
  maxCost: '',
  minMileage: '',
  maxMileage: '',
};

function monthLabel(dateIso: string): string {
  const date = new Date(dateIso);
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function TimelinePage() {
  const { active } = useActiveVehicle();
  const vehicleId = active?.id;
  const [filter, setFilter] = useState<TimelineEntryType | 'all'>('all');
  const [searchText, setSearchText] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advanced, setAdvanced] = useState<AdvancedFilters>(emptyAdvancedFilters);

  const timeline = useLiveQuery(async () => {
    if (!vehicleId) return undefined;
    const [maintenance, issues, fuel, tireSets] = await Promise.all([
      maintenanceRepository.getByVehicle(vehicleId),
      issueRepository.getByVehicle(vehicleId),
      fuelRepository.getByVehicle(vehicleId),
      tireSetRepository.getByVehicle(vehicleId),
    ]);
    const tireEventLists = await Promise.all(
      tireSets.map((set) => tireEventRepository.getByTireSet(set.id)),
    );
    return buildTimeline({
      maintenance,
      issues,
      fuel,
      tireEvents: tireEventLists.flat(),
      tireSets,
    });
  }, [vehicleId]);

  const documents = useLiveQuery(
    () => (vehicleId ? documentRepository.getByVehicle(vehicleId) : []),
    [vehicleId],
  );

  const matchedByDocument = useMemo(() => {
    const ids = new Set<string>();
    const query = searchText.trim().toLowerCase();
    if (!query || !documents) return ids;
    for (const doc of documents) {
      if (!doc.filename.toLowerCase().includes(query)) continue;
      if (doc.maintenanceId) ids.add(doc.maintenanceId);
      if (doc.issueId) ids.add(doc.issueId);
    }
    return ids;
  }, [documents, searchText]);

  const filtered = useMemo(() => {
    if (!timeline) return undefined;
    let result = filter === 'all' ? timeline : timeline.filter((e) => e.type === filter);
    result = filterTimelineEntries(result, {
      from: advanced.from || undefined,
      to: advanced.to || undefined,
      minCost: advanced.minCost ? Number(advanced.minCost) : undefined,
      maxCost: advanced.maxCost ? Number(advanced.maxCost) : undefined,
      minMileage: advanced.minMileage ? Number(advanced.minMileage) : undefined,
      maxMileage: advanced.maxMileage ? Number(advanced.maxMileage) : undefined,
    });
    if (searchText.trim()) {
      result = result.filter((e) => matchesText(e, searchText) || matchedByDocument.has(e.id));
    }
    return result;
  }, [timeline, filter, advanced, searchText, matchedByDocument]);

  const groups = useMemo(() => {
    if (!filtered) return [];
    const map = new Map<string, typeof filtered>();
    for (const entry of filtered) {
      const label = monthLabel(entry.date);
      const existing = map.get(label);
      if (existing) existing.push(entry);
      else map.set(label, [entry]);
    }
    return Array.from(map.entries());
  }, [filtered]);

  if (!vehicleId) {
    return (
      <div className="card">
        <EmptyState>Add a vehicle first to see its history.</EmptyState>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Timeline</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 4, fontSize: 14 }}>
          {active?.manufacturer} {active?.model}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Link to={`/maintenance/new?vehicleId=${vehicleId}`} className="btn btn-secondary">
          + Maintenance
        </Link>
        <Link to={`/issues/new?vehicleId=${vehicleId}`} className="btn btn-secondary">
          + Issue
        </Link>
        <Link to={`/fuel/new?vehicleId=${vehicleId}`} className="btn btn-secondary">
          + Fuel
        </Link>
      </div>

      <div className="field">
        <input
          placeholder="Search maintenance, issues, fuel, tires, documents…"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <div className={styles.filterRow}>
        {timelineTypeOptions.map((opt) => (
          <button
            key={opt.value}
            className={styles.filterChip}
            data-active={filter === opt.value}
            onClick={() => setFilter(opt.value)}
            type="button"
          >
            {opt.label}
          </button>
        ))}
        <button
          className={styles.filterChip}
          data-active={showAdvanced}
          onClick={() => setShowAdvanced((v) => !v)}
          type="button"
        >
          Filters
        </button>
      </div>

      {showAdvanced && (
        <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
          <div className="field">
            <label>From</label>
            <input type="date" value={advanced.from} onChange={(e) => setAdvanced((p) => ({ ...p, from: e.target.value }))} />
          </div>
          <div className="field">
            <label>To</label>
            <input type="date" value={advanced.to} onChange={(e) => setAdvanced((p) => ({ ...p, to: e.target.value }))} />
          </div>
          <div className="field">
            <label>Min cost</label>
            <input type="number" min={0} value={advanced.minCost} onChange={(e) => setAdvanced((p) => ({ ...p, minCost: e.target.value }))} />
          </div>
          <div className="field">
            <label>Max cost</label>
            <input type="number" min={0} value={advanced.maxCost} onChange={(e) => setAdvanced((p) => ({ ...p, maxCost: e.target.value }))} />
          </div>
          <div className="field">
            <label>Min mileage</label>
            <input type="number" min={0} value={advanced.minMileage} onChange={(e) => setAdvanced((p) => ({ ...p, minMileage: e.target.value }))} />
          </div>
          <div className="field">
            <label>Max mileage</label>
            <input type="number" min={0} value={advanced.maxMileage} onChange={(e) => setAdvanced((p) => ({ ...p, maxMileage: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setAdvanced(emptyAdvancedFilters)}>
              Clear filters
            </button>
          </div>
        </div>
      )}

      {filtered === undefined ? null : filtered.length === 0 ? (
        <div className="card">
          <EmptyState>Nothing here yet. Add your first entry above.</EmptyState>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {groups.map(([label, entries]) => (
            <div key={label} className={styles.monthGroup}>
              <div className={styles.monthLabel}>{label}</div>
              {entries.map((entry, index) => {
                const card = (
                  <div className={styles.entryCard}>
                    <div className={styles.entryTop}>
                      <div>
                        <div className={styles.entryTitle}>{entry.title}</div>
                        <div className={styles.entryMeta}>
                          <Badge tone={timelineTypeTone(entry.type)}>{timelineTypeLabel(entry.type)}</Badge>
                          <span>{entry.date}</span>
                          {entry.mileage !== undefined && <span>· {entry.mileage.toLocaleString()} km</span>}
                          {entry.subtitle && <span>· {entry.subtitle}</span>}
                        </div>
                      </div>
                      {entry.cost !== undefined && (
                        <div className={styles.entryCost}>{entry.cost.toLocaleString(undefined, { style: 'currency', currency: 'EUR' })}</div>
                      )}
                    </div>
                  </div>
                );

                return (
                  <div key={entry.id} className={styles.entryRow}>
                    <div className={styles.railCol}>
                      <div className={styles.dot} />
                      {index < entries.length - 1 && <div className={styles.rail} />}
                    </div>
                    {entry.editHref ? (
                      <Link to={entry.editHref} style={{ display: 'block' }}>
                        {card}
                      </Link>
                    ) : (
                      card
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
