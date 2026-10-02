export interface ChangelogEntry {
  version: string;
  date: string;
  notes: string[];
}

/** Most recent first. Keep in sync with CHANGELOG.md and package.json's version. */
export const changelog: ChangelogEntry[] = [
  {
    version: '1.0.0',
    date: '2026-10-02',
    notes: [
      'Deutsche Benutzeroberfläche',
      'Vollständiges Fahrtenbuch: Fahrzeuge, Wartung, Probleme, Tankungen, Reifen, Dokumente, Erinnerungen',
      'Timeline, Kostenübersicht, Suche & Filter',
      'Backup-Export/-Import als ZIP',
      'Installierbare PWA mit Offline-Unterstützung',
    ],
  },
  {
    version: '0.1.0',
    date: '2026-09-16',
    notes: ['Erste Version: Fahrzeugprofil, Dashboard, PWA-Grundgerüst'],
  },
];
