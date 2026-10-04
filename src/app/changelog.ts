export interface ChangelogEntry {
  version: string;
  date: string;
  notes: string[];
}

/** Most recent first. Keep in sync with CHANGELOG.md and package.json's version. */
export const changelog: ChangelogEntry[] = [
  {
    version: '1.1.1',
    date: '2026-10-04',
    notes: [
      'iPhone: Seiten lassen sich wieder bis ganz nach unten scrollen',
      'Untere Navigation berücksichtigt den Home-Balken des iPhones',
    ],
  },
  {
    version: '1.1.0',
    date: '2026-10-04',
    notes: [
      'Zahlenfelder lassen sich leeren und öffnen auf dem iPhone den Ziffernblock',
      'Automatische Updates: Hinweis „Neue Version verfügbar" – kein erneutes Hinzufügen zum Home-Bildschirm nötig',
      '„Nach Updates suchen" in den Einstellungen',
      'Neues App-Icon',
    ],
  },
  {
    version: '1.0.1',
    date: '2026-10-04',
    notes: [
      'iPhone: Datumsfelder überlappen keine Nachbarfelder mehr',
      'iPhone: Inhalte überlappen nicht mehr mit der Statusleiste',
      'Kürzere Feldbezeichnungen („Fällig am", „Fällig bei (km)")',
      'Formulare und Buttons passen sich schmalen Bildschirmen an',
    ],
  },
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
