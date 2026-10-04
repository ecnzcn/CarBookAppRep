/**
 * Formats an ISO calendar date (YYYY-MM-DD) as a German date (DD.MM.YYYY).
 * Parses the string directly rather than via `Date`, so no timezone
 * conversion can shift the calendar day.
 */
export function formatDateDe(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return iso;
  const [, year, month, day] = match;
  return `${day}.${month}.${year}`;
}
