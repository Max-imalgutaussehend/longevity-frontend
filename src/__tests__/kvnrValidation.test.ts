import { describe, it, expect } from 'vitest';
import { validateKvnr, formatKvnrInput } from '../lib/kvnr.js';

describe('Frontend KVNR Validation (#53)', () => {
  it('validates correct Modulo-10 KVNR numbers', () => {
    expect(validateKvnr('Z629410049').valid).toBe(true);
    expect(validateKvnr('A123456780').valid).toBe(true);
    expect(validateKvnr('T123456780').valid).toBe(true);
  });

  it('provides helpful error messages for incomplete numbers', () => {
    const res = validateKvnr('Z6294');
    expect(res.valid).toBe(false);
    expect(res.error).toContain('fehlen');
  });

  it('rejects numbers with invalid check digits', () => {
    const res = validateKvnr('Z629410048');
    expect(res.valid).toBe(false);
    expect(res.error).toContain('Prüfziffer ist ungültig');
  });

  it('formats input while typing', () => {
    expect(formatKvnrInput('z123456789')).toBe('Z123456789');
    expect(formatKvnrInput('  a123  ')).toBe('A123');
    expect(formatKvnrInput('1234')).toBe('234'); // first char non-letter stripped
    expect(formatKvnrInput('A1234567890999')).toBe('A123456789'); // max 10 chars
  });
});
