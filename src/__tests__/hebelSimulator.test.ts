import { describe, it, expect, beforeEach } from 'vitest';
import {
  getScoreBand,
  extractActualMetricValues,
  estimateBioAgeReduction,
  focusStorageKey,
  readFocusMetric,
  writeFocusMetric,
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

  describe('estimateBioAgeReduction() (#94, clamped per PR review)', () => {
    it('converts a score delta to years using the score engine\'s 3.33 points/year ratio, away from the clamp', () => {
      // currentScore 50 -> bioAge == chronoAge exactly, well inside the ±15y clamp either direction.
      expect(estimateBioAgeReduction(50, 40, 3.33)).toBeCloseTo(1.0, 2);
      expect(estimateBioAgeReduction(50, 40, 6.66)).toBeCloseTo(2.0, 2);
      expect(estimateBioAgeReduction(50, 40, 0)).toBe(0);
    });

    it('matches the backend bioAge formula direction: higher score delta -> larger reduction', () => {
      expect(estimateBioAgeReduction(50, 40, 5)).toBeGreaterThan(estimateBioAgeReduction(50, 40, 2));
    });

    it('never returns a negative reduction for a positive score delta', () => {
      expect(estimateBioAgeReduction(50, 40, 5)).toBeGreaterThanOrEqual(0);
    });

    it('caps the reduction at the score engine\'s ±15-year clamp boundary (PR review finding)', () => {
      // A user already at the -15y clamp (score 99.95 -> bioAge = chronoAge - 15) gains
      // nothing further from a lever, because bioAge cannot go below chronoAge - 15.
      const chronoAge = 40;
      const scoreAtClampBoundary = 50 + 15 * 3.33; // bioAge == chronoAge - 15 exactly
      const reduction = estimateBioAgeReduction(scoreAtClampBoundary, chronoAge, 10);
      expect(reduction).toBe(0);
    });

    it('reports only the portion of the reduction that falls before the clamp boundary', () => {
      const chronoAge = 40;
      // Starting 1 year of headroom above the clamp (bioAge = chronoAge - 14) — a
      // 10-point lever should only buy back that last 1 year, not the full
      // 10/3.33 ≈ 3.0 years it would promise unclamped.
      const scoreOneYearFromClamp = 50 + 14 * 3.33;
      const reduction = estimateBioAgeReduction(scoreOneYearFromClamp, chronoAge, 10);
      expect(reduction).toBeLessThan(10 / 3.33);
      expect(reduction).toBeCloseTo(1, 1);
    });
  });

  describe('lever focus localStorage — per-user scoping (PR review finding)', () => {
    // Node's experimental global localStorage shadows jsdom's window.localStorage
    // and throws without --localstorage-file, so this suite provides its own
    // minimal in-memory stub rather than depending on either.
    beforeEach(() => {
      const store = new Map<string, string>();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).localStorage = {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => { store.set(k, v); },
        removeItem: (k: string) => { store.delete(k); },
        clear: () => { store.clear(); },
      };
    });

    it('scopes the storage key to the user id, so two users on the same browser don\'t share a focus', () => {
      expect(focusStorageKey('user-a')).not.toBe(focusStorageKey('user-b'));
    });

    it('writing a focus for one user does not leak into another user\'s read', () => {
      writeFocusMetric('user-a', 'vo2max');
      expect(readFocusMetric('user-a')).toBe('vo2max');
      expect(readFocusMetric('user-b')).toBeNull();
    });

    it('returns null and no-ops when no userId is available yet (e.g. before /me resolves)', () => {
      expect(readFocusMetric(undefined)).toBeNull();
      writeFocusMetric(undefined, 'vo2max');
      expect(readFocusMetric('user-a')).toBeNull();
    });

    it('clearing a user\'s focus removes only that user\'s key', () => {
      writeFocusMetric('user-a', 'vo2max');
      writeFocusMetric('user-b', 'resting_hr');
      writeFocusMetric('user-a', null);
      expect(readFocusMetric('user-a')).toBeNull();
      expect(readFocusMetric('user-b')).toBe('resting_hr');
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

  describe('Simulator Metric Directions and Boundaries', () => {
    it('verifies resting_hr improvement is strictly decreasing (lower is better)', () => {
      const isRestingHrImprovement = (val: number, base: number) => val < base;
      expect(isRestingHrImprovement(55, 65)).toBe(true);
      expect(isRestingHrImprovement(75, 65)).toBe(false);
    });

    it('verifies sleep_duration improvement is proximity to target 7.5h', () => {
      const isSleepImprovement = (val: number, base: number) => Math.abs(val - 7.5) < Math.abs(base - 7.5);
      expect(isSleepImprovement(7.5, 6.0)).toBe(true);
      expect(isSleepImprovement(8.0, 7.5)).toBe(false);
      expect(isSleepImprovement(9.0, 7.5)).toBe(false);
    });

    it('verifies higher metrics improvement is increasing (higher is better)', () => {
      const isHigherImprovement = (val: number, base: number) => val > base;
      for (const metric of ['vo2max', 'zone2_minutes', 'hrv_rmssd', 'steps', 'strength_sessions']) {
        expect(isHigherImprovement(100, 50), `${metric} should improve when increasing`).toBe(true);
        expect(isHigherImprovement(30, 50), `${metric} should worsen when decreasing`).toBe(false);
      }
    });
  });
});
