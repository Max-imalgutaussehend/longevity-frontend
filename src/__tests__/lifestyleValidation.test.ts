import { describe, it, expect } from 'vitest';
import { LIFESTYLE_FIELDS } from '../routes/daten/datenTypes.js';
import { validateLifestyleInputs } from '../routes/daten/datenUtils.js';

describe('Lifestyle validation & strength_sessions limit', () => {
  it('defines strength_sessions field with min 0 and max 14', () => {
    const field = LIFESTYLE_FIELDS.find((f) => f.key === 'strength_sessions');
    expect(field).toBeDefined();
    expect(field?.min).toBe(0);
    expect(field?.max).toBe(14);
    expect(field?.unit).toBe('/week');
  });

  it('accepts strength training sessions greater than 4 (e.g. 5, 6, 7, 14)', () => {
    for (const count of [5, 6, 7, 10, 14]) {
      const result = validateLifestyleInputs({
        strength_sessions: String(count),
      });
      expect(result.error).toBeNull();
      expect(result.values).toEqual([
        { metric: 'strength_sessions', value: count, unit: '/week' },
      ]);
    }
  });

  it('supports decimal inputs with comma or dot (e.g. 4.5 or 5,5)', () => {
    const result = validateLifestyleInputs({
      strength_sessions: '5,5',
    });
    expect(result.error).toBeNull();
    expect(result.values).toEqual([
      { metric: 'strength_sessions', value: 5.5, unit: '/week' },
    ]);
  });

  it('rejects values exceeding max plausibility limit of 14', () => {
    const result = validateLifestyleInputs({
      strength_sessions: '15',
    });
    expect(result.error).toBe('Krafteinheiten pro Woche: Wert darf maximal 14 sein.');
    expect(result.values).toEqual([]);
  });

  it('rejects negative values', () => {
    const result = validateLifestyleInputs({
      strength_sessions: '-1',
    });
    expect(result.error).toBe('Krafteinheiten pro Woche: Wert darf nicht negativ sein.');
    expect(result.values).toEqual([]);
  });

  it('handles multiple lifestyle fields simultaneously including strength_sessions > 4', () => {
    const result = validateLifestyleInputs({
      strength_sessions: '6',
      alcohol_units: '3',
      zone2_minutes: '120',
      smoking: '0',
    });
    expect(result.error).toBeNull();
    expect(result.values).toEqual([
      { metric: 'smoking', value: 0, unit: 'category' },
      { metric: 'alcohol_units', value: 3, unit: 'units/week' },
      { metric: 'strength_sessions', value: 6, unit: '/week' },
      { metric: 'zone2_minutes', value: 120, unit: 'min/week' },
    ]);
  });
});
