import { useState } from 'react';
import { changelog } from '../../app/changelog';
import { formatDateDe } from '../../ui/formatDate';

export function VersionSection() {
  const [expanded, setExpanded] = useState(false);
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
        <button type="button" className="btn btn-secondary" onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Änderungsprotokoll ausblenden' : 'Was ist neu?'}
        </button>
      </div>

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
