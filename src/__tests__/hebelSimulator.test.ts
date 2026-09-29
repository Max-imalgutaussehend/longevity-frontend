import { describe, it, expect } from 'vitest';
import {
  getScoreBand,
  extractActualMetricValues,
  estimateBioAgeReduction,
  METRIC_COHORT_MEAN,
  type Lever,
} from '../routes/Hebel.js';
import type { ScoreResult } from '../api/types.js';

describe('Hebel Simulator Istwerte & Score-Band (#82)', () => {
  describe('getScoreBand()', () => {
    it('formats lower bands correctly', () => {
      expect(getScoreBand(5)).toBe('0 – 9');
      expect(getScoreBand(54.2)).toBe('50 – 59');
      expect(getScoreBand(78)).toBe('70 – 79');
      expect(getScoreBand(89.9)).toBe('80 – 89');
    });

    it('correctly handles top bands (>= 90 should be 90–100, score 100 should not be 100–109)', () => {
      expect(getScoreBand(90)).toBe('90 – 100');
      expect(getScoreBand(95.5)).toBe('90 – 100');
      expect(getScoreBand(100)).toBe('90 – 100');
    });
  });

  describe('extractActualMetricValues()', () => {
    it('extracts metric values primarily from score.domains', () => {
      const mockScore: ScoreResult = {
        score: 78,
        coverage: 0.8,
        bioAge: 32,
        chronoAge: 35,
        band: { low: 70, high: 79 },
        engineVersion: '2026.01',
        computedAt: '2026-09-27T12:00:00.000Z',
        domains: [
          {
            domain: 'cardio',
            weight: 0.35,
            score: 75,
            metrics: [
              {
                metric: 'vo2max',
                domain: 'cardio',
                value: 48.5,
                unit: 'ml/kg/min',
                percentile: 75,
                ageDays: 1,
                freshness: 0.98,
                effectiveWeight: 0.15,
                contribution: 12,
                available: true,
              },
              {
                metric: 'resting_hr',
                domain: 'cardio',
                value: 58,
                unit: 'bpm',
                percentile: 80,
                ageDays: 1,
                freshness: 0.98,
                effectiveWeight: 0.15,
                contribution: 14,
                available: true,
              },
            ],
          },
          {
            domain: 'sleep',
            weight: 0.25,
            score: 82,
            metrics: [
              {
                metric: 'sleep_duration',
                domain: 'sleep',
                value: 7.8,
                unit: 'h',
                percentile: 85,
                ageDays: 1,
                freshness: 0.98,
                effectiveWeight: 0.15,
                contribution: 15,
                available: true,
              },
            ],
          },
        ],
      };

      const mockLevers: Lever[] = [
        {
          metric: 'vo2max',
          currentValue: 40.0, // should be ignored in favor of score.domains (48.5)
          targetValue: 52.0,
          delta: 1.5,
          horizonWeeks: 8,
        },
        {
          metric: 'zone2_minutes',
          currentValue: 120, // present in levers but not in score.domains
          targetValue: 180,
          delta: 2.0,
          horizonWeeks: 6,
        },
      ];

      const actuals = extractActualMetricValues(mockScore, mockLevers);

      expect(actuals.vo2max).toBe(48.5);
      expect(actuals.resting_hr).toBe(58);
      expect(actuals.sleep_duration).toBe(7.8);
      expect(actuals.zone2_minutes).toBe(120);
      expect(actuals.steps).toBeUndefined();
    });

    it('falls back gracefully when score or levers are empty', () => {
      const actuals = extractActualMetricValues(null, null);
      expect(actuals).toEqual({});
    });
  });

  describe('estimateBioAgeReduction() (#94)', () => {
    it('converts a score delta to years using the score engine\'s 3.33 points/year ratio', () => {
      expect(estimateBioAgeReduction(3.33)).toBeCloseTo(1.0, 2);
      expect(estimateBioAgeReduction(6.66)).toBeCloseTo(2.0, 2);
      expect(estimateBioAgeReduction(0)).toBe(0);
    });

    it('matches the backend bioAge formula direction: higher score delta -> larger reduction', () => {
      expect(estimateBioAgeReduction(5)).toBeGreaterThan(estimateBioAgeReduction(2));
    });
  });

  describe('Cohort Mean fallbacks', () => {
    it('defines cohort means for all 7 interactive simulator metrics', () => {
      const requiredMetrics = [
        'vo2max',
        'resting_hr',
        'sleep_duration',
        'zone2_minutes',
        'hrv_rmssd',
        'steps',
        'strength_sessions',
      ];

      for (const m of requiredMetrics) {
        expect(METRIC_COHORT_MEAN[m]).toBeDefined();
        expect(METRIC_COHORT_MEAN[m]).toBeGreaterThan(0);
      }
    });
  });
});
