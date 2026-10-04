import { useEffect, useState } from 'react';

interface NumberInputProps {
  id?: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  /** Allow decimals (shows the decimal keypad and accepts "," or "."). */
  decimal?: boolean;
  required?: boolean;
  placeholder?: string;
}

export function parseNumber(text: string): number | undefined {
  const trimmed = text.trim();
  if (trimmed === '') return undefined;
  const parsed = Number(trimmed.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function format(value: number | undefined, decimal: boolean): string {
  if (value === undefined || !Number.isFinite(value)) return '';
  const text = String(value);
  return decimal ? text.replace('.', ',') : text;
}

/**
 * Text input that edits a number. Keeps its own text so the field can be
 * empty or hold an in-progress value like "12," — a plain controlled
 * type="number" input snaps an emptied field back to 0.
 */
export function NumberInput({ id, value, onChange, decimal = false, required, placeholder }: NumberInputProps) {
  const normalized = value !== undefined && Number.isFinite(value) ? value : undefined;
  const [text, setText] = useState(() => format(normalized, decimal));

  useEffect(() => {
    if (parseNumber(text) !== normalized) setText(format(normalized, decimal));
  }, [normalized]);

  return (
    <input
      id={id}
      type="text"
      inputMode={decimal ? 'decimal' : 'numeric'}
      pattern={decimal ? '[0-9]*[.,]?[0-9]*' : '[0-9]*'}
      autoComplete="off"
      required={required}
      placeholder={placeholder}
      value={text}
      onChange={(e) => {
        const next = decimal ? e.target.value.replace(/[^0-9.,]/g, '') : e.target.value.replace(/[^0-9]/g, '');
        setText(next);
        onChange(parseNumber(next));
      }}
    />
  );
}
