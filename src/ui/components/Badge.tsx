import type { ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'accent';

const toneColors: Record<BadgeTone, { bg: string; fg: string }> = {
  neutral: { bg: 'var(--color-bg)', fg: 'var(--color-text-muted)' },
  success: { bg: 'rgba(28, 138, 75, 0.14)', fg: 'var(--color-success)' },
  warning: { bg: 'rgba(185, 116, 10, 0.14)', fg: 'var(--color-warning)' },
  danger: { bg: 'rgba(214, 72, 60, 0.14)', fg: 'var(--color-danger)' },
  accent: { bg: 'rgba(10, 110, 222, 0.12)', fg: 'var(--color-accent)' },
};

export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  const { bg, fg } = toneColors[tone];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 9px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        background: bg,
        color: fg,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}
