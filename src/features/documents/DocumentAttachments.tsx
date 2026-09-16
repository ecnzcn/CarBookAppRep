import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useRef, useState } from 'react';
import { documentRepository } from '../../repositories/documentRepository';
import { documentService } from '../../services/documentService';

interface DocumentAttachmentsProps {
  vehicleId: string;
  maintenanceId?: string;
  issueId?: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentAttachments({ vehicleId, maintenanceId, issueId }: DocumentAttachmentsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const documents = useLiveQuery(() => {
    if (maintenanceId) return documentRepository.getByMaintenance(maintenanceId);
    if (issueId) return documentRepository.getByIssue(issueId);
    return Promise.resolve([]);
  }, [maintenanceId, issueId]);

  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!documents) return;
    const nextUrls: Record<string, string> = {};
    for (const doc of documents) {
      nextUrls[doc.id] = URL.createObjectURL(doc.blob);
    }
    setUrls(nextUrls);
    return () => {
      Object.values(nextUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [documents]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await documentService.upload({ vehicleId, maintenanceId, issueId, file });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleRemove(id: string) {
    await documentService.remove(id);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {documents !== undefined && documents.length > 0 && (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {documents.map((doc) => {
            const url = urls[doc.id];
            return (
              <li
                key={doc.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  border: '1px solid var(--color-border)',
                  borderRadius: 10,
                  padding: '8px 10px',
                }}
              >
                <a href={url} download={doc.filename} style={{ fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {doc.filename}
                  <span style={{ color: 'var(--color-text-muted)' }}> · {formatSize(doc.blob.size)}</span>
                </a>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', color: 'var(--color-danger)' }}
                  onClick={() => handleRemove(doc.id)}
                >
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="application/pdf,image/*"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={uploading}
        />
      </div>

      {error && <p style={{ color: 'var(--color-danger)', fontSize: 13 }}>{error}</p>}
    </div>
  );
}
