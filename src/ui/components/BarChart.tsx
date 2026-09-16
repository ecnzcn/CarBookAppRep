export interface BarChartDatum {
  label: string;
  value: number;
}

function formatEuro(value: number): string {
  return value.toLocaleString(undefined, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}

export function BarChart({ data }: { data: BarChartDatum[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {data.map((d) => (
        <div key={d.label} style={{ display: 'grid', gridTemplateColumns: '96px 1fr 72px', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{d.label}</span>
          <div style={{ background: 'var(--color-bg)', borderRadius: 6, height: 10, overflow: 'hidden' }}>
            <div
              style={{
                width: `${(d.value / max) * 100}%`,
                background: 'var(--color-accent)',
                height: '100%',
                borderRadius: 6,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, textAlign: 'right' }}>{formatEuro(d.value)}</span>
        </div>
      ))}
    </div>
  );
}
