import { describe, it, expect } from 'vitest';
import { getBandProgressInfo } from '../routes/Dashboard.js';
import { getMetricLabel, getMetricUnit } from '../lib/formatters.js';

describe('Dashboard Band Progress & Data Streak (#83)', () => {
  describe('Band-101-Bug Fix in getBandProgressInfo', () => {
    it('handles highest band (>= 90) cleanly without suggesting Band 101', () => {
      const scoreData = {
        score: 93.4,
        band: { low: 90, high: 100 },
      };

      const result = getBandProgressInfo(scoreData);
      expect(result.isMaxBand).toBe(true);
      expect(result.percent).toBe(100);
      expect(result.text).toBe('Höchstes Band 90–100 erreicht');
      expect(result.nextBand).toBeNull();
      expect(result.text).not.toContain('101');
    });

    it('handles boundary score at exactly 90', () => {
      const scoreData = {
        score: 90.0,
        band: { low: 90, high: 100 },
      };

      const result = getBandProgressInfo(scoreData);
      expect(result.isMaxBand).toBe(true);
      expect(result.percent).toBe(100);
      expect(result.text).toBe('Höchstes Band 90–100 erreicht');
    });

    it('calculates remaining points and next band correctly for lower bands', () => {
      const scoreData = {
        score: 74.2,
        band: { low: 70, high: 79 },
      };

      const result = getBandProgressInfo(scoreData);
      expect(result.isMaxBand).toBe(false);
      expect(result.percent).toBeCloseTo(42, 0);
      expect(result.remainingPoints).toBe(5.8);
      expect(result.nextBand).toBe(80);
      expect(result.text).toBe('Noch 5.8 Pkt. bis Band 80');
    });

    it('calculates remaining points correctly right before band 90', () => {
      const scoreData = {
        score: 89.5,
        band: { low: 80, high: 89 },
      };

      const result = getBandProgressInfo(scoreData);
      expect(result.isMaxBand).toBe(false);
      expect(result.remainingPoints).toBe(0.5);
      expect(result.nextBand).toBe(90);
      expect(result.text).toBe('Noch 0.5 Pkt. bis Band 90');
    });
  });

  describe('Metric Lever Label Translation and Units', () => {
    it('translates snake_case metric keys and appends units', () => {
      const testCases = [
        { metric: 'zone2_minutes', expectedLabel: 'Zone-2-Minuten', expectedUnit: 'min/Wo.' },
        { metric: 'resting_hr', expectedLabel: 'Ruhepuls', expectedUnit: 'bpm' },
        { metric: 'vo2max', expectedLabel: 'VO₂max', expectedUnit: 'ml/kg/min' },
        { metric: 'sleep_duration', expectedLabel: 'Schlafdauer', expectedUnit: 'h' },
        { metric: 'strength_sessions', expectedLabel: 'Krafteinheiten', expectedUnit: '/Woche' },
        { metric: 'smoking', expectedLabel: 'Rauchen', expectedUnit: 'Kategorie' },
        { metric: 'alcohol_units', expectedLabel: 'Alkohol', expectedUnit: 'Einh./Wo.' },
      ];

      for (const tc of testCases) {
        const label = getMetricLabel(tc.metric);
        const unit = getMetricUnit(tc.metric);
        expect(label).toBe(tc.expectedLabel);
        expect(unit).toBe(tc.expectedUnit);

        const formatted = `${label}${unit ? ` (${unit})` : ''}`;
        expect(formatted).toBe(`${tc.expectedLabel} (${tc.expectedUnit})`);
      }
    });

    it('falls back gracefully on unknown metric keys', () => {
      expect(getMetricLabel('custom_unknown_metric')).toBe('Custom Unknown Metric');
      expect(getMetricUnit('custom_unknown_metric')).toBe('');
    });
  });
});
