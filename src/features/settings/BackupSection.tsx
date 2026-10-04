import { useRef, useState } from 'react';
import {
  applyImport,
  backupFilename,
  exportBackup,
  parseBackup,
  type BackupCounts,
  type BackupData,
  type BackupPreview,
  type ImportResult,
} from '../../services/backupService';

const countLabels: Record<keyof BackupCounts, string> = {
  vehicles: 'Fahrzeuge',
  maintenance: 'Wartungseinträge',
  issues: 'Probleme',
  fuelEntries: 'Tankungen',
  tireSets: 'Reifensätze',
  tireEvents: 'Reifenereignisse',
  reminders: 'Erinnerungen',
  documents: 'Dokumente',
};

function countLines(counts: BackupCounts): string {
  return (
    Object.entries(counts)
      .filter(([, value]) => value > 0)
      .map(([key, value]) => `${value} ${countLabels[key as keyof BackupCounts]}`)
      .join(', ') || 'nichts'
  );
}

export function BackupSection() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = useState(false);
  const [preview, setPreview] = useState<BackupPreview | null>(null);
  const [pendingFiles, setPendingFiles] = useState<Record<string, Uint8Array> | null>(null);
  const [pendingData, setPendingData] = useState<BackupData | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  async function handleExport() {
    setExporting(true);
    try {
      const blob = await exportBackup();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backupFilename();
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  async function handleFileSelected(file: File | undefined) {
    setImportResult(null);
    setPreview(null);
    setPendingFiles(null);
    setPendingData(null);
    if (!file) return;

    const bytes = new Uint8Array(await file.arrayBuffer());
    const result = parseBackup(bytes);
    setPreview(result);
    if (result.valid && result.data && result.files) {
      setPendingData(result.data);
      setPendingFiles(result.files);
    }
  }

  async function handleConfirmImport() {
    if (!pendingData || !pendingFiles) return;
    setImporting(true);
    try {
      const result = await applyImport(pendingData, pendingFiles);
      setImportResult(result);
      setPreview(null);
      setPendingData(null);
      setPendingFiles(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } finally {
      setImporting(false);
    }
  }

  function handleCancelImport() {
    setPreview(null);
    setPendingData(null);
    setPendingFiles(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Export</h3>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 10 }}>
          Lade alles herunter — jedes Fahrzeug, jeden Eintrag und jedes Dokument — als eine ZIP-Datei.
        </p>
        <button className="btn btn-primary" onClick={handleExport} disabled={exporting}>
          {exporting ? 'Wird vorbereitet…' : 'Backup exportieren'}
        </button>
      </div>

      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Import</h3>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 10 }}>
          Aus einem Backup wiederherstellen. Bestehende Daten werden nie überschrieben — bereits
          vorhandene Einträge werden übersprungen, nicht ersetzt.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/zip,.zip"
          onChange={(e) => handleFileSelected(e.target.files?.[0])}
        />

        {preview && !preview.valid && (
          <div style={{ marginTop: 10 }}>
            <p style={{ color: 'var(--color-danger)', fontSize: 13, fontWeight: 600 }}>
              Diese Datei konnte nicht importiert werden:
            </p>
            <ul style={{ margin: '4px 0 0', paddingLeft: 18, fontSize: 13, color: 'var(--color-danger)' }}>
              {preview.errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {preview?.valid && (
          <div className="card" style={{ marginTop: 10 }}>
            <p style={{ fontSize: 14, marginBottom: 10 }}>
              Dieses Backup enthält: <strong>{countLines(preview.counts)}</strong>.
            </p>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 12 }}>
              Prüfe die Zusammenfassung oben und bestätige dann den Import. Bereits lokal
              vorhandene Daten werden übersprungen, nicht überschrieben.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" onClick={handleCancelImport}>
                Abbrechen
              </button>
              <button className="btn btn-primary" onClick={handleConfirmImport} disabled={importing}>
                {importing ? 'Wird importiert…' : 'Import bestätigen'}
              </button>
            </div>
          </div>
        )}

        {importResult && (
          <div className="card" style={{ marginTop: 10 }}>
            <p style={{ fontSize: 14 }}>
              Importiert: <strong>{countLines(importResult.added)}</strong>.
            </p>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
              Übersprungen (bereits vorhanden): {countLines(importResult.skippedExisting)}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
