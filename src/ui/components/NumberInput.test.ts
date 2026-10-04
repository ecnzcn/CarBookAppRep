import { describe, expect, it } from 'vitest';
import { parseNumber } from './NumberInput';

describe('parseNumber', () => {
  it('treats an empty field as no value rather than 0', () => {
    expect(parseNumber('')).toBeUndefined();
    expect(parseNumber('   ')).toBeUndefined();
  });

  it('accepts a German decimal comma', () => {
    expect(parseNumber('1,85')).toBeCloseTo(1.85);
  });

  it('accepts a decimal point', () => {
    expect(parseNumber('42.5')).toBeCloseTo(42.5);
  });

  it('parses an in-progress value like "12,"', () => {
    expect(parseNumber('12,')).toBe(12);
  });

  it('rejects garbage', () => {
    expect(parseNumber(',')).toBeUndefined();
  });
});
