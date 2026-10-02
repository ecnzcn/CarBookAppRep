import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { reminderRepository } from '../../repositories/reminderRepository';
import { reminderService } from '../../services/reminderService';
import { getMaintenanceDueStatus } from '../../services/maintenanceStatus';
import { ReminderForm } from './ReminderForm';
import { Badge, type BadgeTone } from '../../ui/components/Badge';
import { EmptyState } from '../../ui/components/EmptyState';
import { formatDateDe } from '../../ui/formatDate';
import type { Reminder } from '../../db/types';

const toneByStatus: Record<string, BadgeTone> = {
  overdue: 'danger',
  dueSoon: 'warning',
  ok: 'success',
  none: 'neutral',
};

const labelByStatus: Record<string, string> = {
  overdue: 'überfällig',
  dueSoon: 'bald fällig',
  ok: 'ok',
  none: 'kein Termin gesetzt',
};

function ReminderRow({ reminder, currentMileage }: { reminder: Reminder; currentMileage: number }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="card">
        <ReminderForm
          vehicleId={reminder.vehicleId}
          initial={reminder}
          onCancel={() => setEditing(false)}
          onSubmit={async (input) => {
            await reminderService.update(reminder.id, input);
            setEditing(false);
          }}
        />
      </div>
    );
  }

  const status = getMaintenanceDueStatus(
    { nextDate: reminder.dueDate, nextMileage: reminder.dueMileage },
    currentMileage,
  );

  return (
    <div
      className="card"
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}
    >
      <div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <strong>{reminder.title}</strong>
          {reminder.enabled ? (
            <Badge tone={toneByStatus[status]}>{labelByStatus[status]}</Badge>
          ) : (
            <Badge tone="neutral">deaktiviert</Badge>
          )}
        </div>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
          {[
            reminder.dueDate ? formatDateDe(reminder.dueDate) : undefined,
            reminder.dueMileage !== undefined ? `${reminder.dueMileage.toLocaleString('de-DE')} km` : undefined,
          ]
            .filter(Boolean)
            .join(' · ') || 'Kein Fälligkeitsdatum oder Kilometerstand gesetzt'}
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className="btn btn-secondary"
          style={{ padding: '4px 10px' }}
          onClick={() => reminderService.setEnabled(reminder.id, !reminder.enabled)}
        >
          {reminder.enabled ? 'Deaktivieren' : 'Aktivieren'}
        </button>
        <button className="btn btn-secondary" style={{ padding: '4px 10px' }} onClick={() => setEditing(true)}>
          Bearbeiten
        </button>
        <button
          className="btn btn-secondary"
          style={{ padding: '4px 10px', color: 'var(--color-danger)' }}
          onClick={() => reminderService.remove(reminder.id)}
        >
          Löschen
        </button>
      </div>
    </div>
  );
}

export function RemindersSection({ vehicleId, currentMileage }: { vehicleId: string; currentMileage: number }) {
  const [adding, setAdding] = useState(false);
  const reminders = useLiveQuery(() => reminderRepository.getByVehicle(vehicleId), [vehicleId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600 }}>Erinnerungen</h2>
        {!adding && (
          <button className="btn btn-secondary" onClick={() => setAdding(true)}>
            Erinnerung hinzufügen
          </button>
        )}
      </div>

      {adding && (
        <div className="card">
          <ReminderForm
            vehicleId={vehicleId}
            onCancel={() => setAdding(false)}
            onSubmit={async (input) => {
              await reminderService.create(input);
              setAdding(false);
            }}
          />
        </div>
      )}

      {reminders !== undefined && reminders.length === 0 && !adding && (
        <div className="card">
          <EmptyState>Noch keine Erinnerungen.</EmptyState>
        </div>
      )}

      {reminders?.map((reminder) => (
        <ReminderRow key={reminder.id} reminder={reminder} currentMileage={currentMileage} />
      ))}
    </div>
  );
}
