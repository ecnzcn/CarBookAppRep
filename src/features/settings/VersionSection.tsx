import { useState } from 'react';
import { changelog } from '../../app/changelog';
import { formatDateDe } from '../../ui/formatDate';

type CheckState = 'idle' | 'checking' | 'upToDate' | 'found' | 'offline';

const checkMessages: Record<Exclude<CheckState, 'idle' | 'checking'>, string> = {
  upToDate: 'Du hast die neueste Version.',
  found: 'Neue Version gefunden — tippe unten auf „Jetzt aktualisieren".',
  offline: 'Keine Internetverbindung — Prüfung nicht möglich.',
};

async function checkForUpdate(): Promise<CheckState> {
  if (!navigator.onLine) return 'offline';
  const registration = await navigator.serviceWorker?.getRegistration();
  if (!registration) return 'upToDate';
  await registration.update();
  return registration.waiting || registration.installing ? 'found' : 'upToDate';
}

export function VersionSection() {
  const [expanded, setExpanded] = useState(false);
  const [checkState, setCheckState] = useState<CheckState>('idle');
  const [latest, ...older] = changelog;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600 }}>CarBook v{__APP_VERSION__}</p>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
            Veröffentlicht am {formatDateDe(latest.date)}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={checkState === 'checking'}
            onClick={async () => {
              setCheckState('checking');
              setCheckState(await checkForUpdate().catch((): CheckState => 'offline'));
            }}
          >
            {checkState === 'checking' ? 'Wird geprüft…' : 'Nach Updates suchen'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setExpanded((v) => !v)}>
            {expanded ? 'Änderungsprotokoll ausblenden' : 'Was ist neu?'}
          </button>
        </div>
      </div>

      {checkState !== 'idle' && checkState !== 'checking' && (
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 10 }}>{checkMessages[checkState]}</p>
      )}

      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
          {[latest, ...older].map((entry) => (
            <div key={entry.version}>
              <p style={{ fontSize: 13, fontWeight: 600 }}>
                v{entry.version} <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>· {formatDateDe(entry.date)}</span>
              </p>
              <ul style={{ margin: '4px 0 0', paddingLeft: 18, fontSize: 13, color: 'var(--color-text-muted)' }}>
                {entry.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
