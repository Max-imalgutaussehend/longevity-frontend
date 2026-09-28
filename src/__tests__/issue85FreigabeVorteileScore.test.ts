import { describe, it, expect } from 'vitest';
import { calculatePointsGap } from '../routes/Vorteile.js';
import { formatFreshness } from '../routes/Score.js';

describe('Freigabe validDays, Vorteile Points Gap & Score Freshness (#85)', () => {
  describe('Vorteile Punkteabstand (calculatePointsGap)', () => {
    it('calculates decimal gap correctly when score is 79.5 and target band is 80', () => {
      const gap = calculatePointsGap(80, 79.5);
      expect(gap).toBe('0.5');
    });

    it('calculates decimal gap for intermediate values', () => {
      const gap = calculatePointsGap(70, 65.2);
      expect(gap).toBe('4.8');
    });

    it('returns null when current score already reaches or exceeds minBand', () => {
      expect(calculatePointsGap(80, 80.0)).toBeNull();
      expect(calculatePointsGap(80, 85.3)).toBeNull();
    });

    it('handles null and undefined scores gracefully', () => {
      expect(calculatePointsGap(80, null)).toBeNull();
      expect(calculatePointsGap(80, undefined)).toBeNull();
    });
  });

  describe('Score Frische (formatFreshness)', () => {
    it('formats freshness percentage directly from m.freshness (0..1)', () => {
      expect(formatFreshness(1.0)).toBe('Frische 100 %');
      expect(formatFreshness(0.95)).toBe('Frische 95 %');
      expect(formatFreshness(0.5)).toBe('Frische 50 %');
      expect(formatFreshness(0.123)).toBe('Frische 12 %');
      expect(formatFreshness(0)).toBe('Frische 0 %');
    });

    it('handles null and undefined freshness values', () => {
      expect(formatFreshness(null)).toBe('—');
      expect(formatFreshness(undefined)).toBe('—');
    });
  });
});
