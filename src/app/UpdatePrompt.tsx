import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { changelog } from './changelog';
import styles from './UpdatePrompt.module.css';

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;
const LAST_SEEN_VERSION_KEY = 'carbook:lastSeenVersion';

function readLastSeenVersion(): string | null {
  try {
    return localStorage.getItem(LAST_SEEN_VERSION_KEY);
  } catch {
    return null;
  }
}

function storeLastSeenVersion(version: string) {
  try {
    localStorage.setItem(LAST_SEEN_VERSION_KEY, version);
  } catch {
    // Storage unavailable (private mode) — the "what's new" note just won't persist.
  }
}

/**
 * Checks for a new app version on launch, whenever the app comes back to
 * the foreground, and hourly; offers it via a banner, and after an update
 * shows the matching changelog entry once.
 */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      const check = () => {
        if (navigator.onLine) registration.update().catch(() => {});
      };
      setInterval(check, UPDATE_CHECK_INTERVAL_MS);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check();
      });
    },
  });

  const [updating, setUpdating] = useState(false);
  const [whatsNewOpen, setWhatsNewOpen] = useState(false);

  useEffect(() => {
    const lastSeen = readLastSeenVersion();
    if (lastSeen && lastSeen !== __APP_VERSION__) setWhatsNewOpen(true);
    else if (!lastSeen) storeLastSeenVersion(__APP_VERSION__);
  }, []);

  const currentEntry = changelog.find((entry) => entry.version === __APP_VERSION__);

  function closeWhatsNew() {
    storeLastSeenVersion(__APP_VERSION__);
    setWhatsNewOpen(false);
  }

  return (
    <>
      {needRefresh && (
        <div className={styles.banner} role="status">
          <div>
            <p className={styles.title}>Neue Version verfügbar</p>
            <p className={styles.subtitle}>Deine Daten bleiben erhalten.</p>
          </div>
          <div className={styles.actions}>
            <button type="button" className="btn btn-secondary" onClick={() => setNeedRefresh(false)}>
              Später
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={updating}
              onClick={() => {
                setUpdating(true);
                void updateServiceWorker(true);
              }}
            >
              {updating ? 'Wird aktualisiert…' : 'Jetzt aktualisieren'}
            </button>
          </div>
        </div>
      )}

      {whatsNewOpen && (
        <div className={styles.backdrop} onClick={closeWhatsNew}>
          <div className={styles.sheet} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <p className={styles.title}>Aktualisiert auf v{__APP_VERSION__}</p>
            {currentEntry && (
              <>
                <p className={styles.subtitle}>Was ist neu:</p>
                <ul className={styles.notes}>
                  {currentEntry.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </>
            )}
            <button type="button" className="btn btn-primary" onClick={closeWhatsNew}>
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}
