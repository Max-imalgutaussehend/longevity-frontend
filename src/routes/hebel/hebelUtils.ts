import type { ScoreResult } from '../../api/types.js';

export interface Lever {
  metric: string;
  currentValue: number | null;
  targetValue: number;
  delta: number;
  horizonWeeks: number;
}

export interface SimResult {
  base: ScoreResult;
  simulated: ScoreResult;
  perMetric: { metric: string; delta: number }[];
}

// Score-to-BioAge conversion used by the score engine (src/score/index.ts):
// bioAge = clamp(chronoAge - (score - 50) / 3.33, chronoAge - 15, chronoAge + 15)
// i.e. 3.33 score points ≈ 1 year of bio-age, clamped to ±15 years from chronoAge.
export const SCORE_POINTS_PER_BIOAGE_YEAR = 3.33;
export const BIOAGE_CLAMP_YEARS = 15;

export function clampBioAge(bioAge: number, chronoAge: number): number {
  return Math.min(chronoAge + BIOAGE_CLAMP_YEARS, Math.max(chronoAge - BIOAGE_CLAMP_YEARS, bioAge));
}

/**
 * Estimates how much a lever's score delta would reduce bio-age, applying the
 * same clamp the score engine uses — a lever's raw point delta alone can
 * promise more reduction than the engine will ever actually apply once a
 * user is already near the ±15-year clamp boundary.
 */
export function estimateBioAgeReduction(currentScore: number, chronoAge: number, scoreDelta: number): number {
  const currentBioAge = clampBioAge(chronoAge - (currentScore - 50) / SCORE_POINTS_PER_BIOAGE_YEAR, chronoAge);
  const projectedBioAge = clampBioAge(chronoAge - (currentScore + scoreDelta - 50) / SCORE_POINTS_PER_BIOAGE_YEAR, chronoAge);
  return Math.max(0, currentBioAge - projectedBioAge);
}

export const FOCUS_STORAGE_PREFIX = 'longevity_lever_focus_';

export function focusStorageKey(userId: string): string {
  return `${FOCUS_STORAGE_PREFIX}${userId}`;
}

export function readFocusMetric(userId: string | undefined): string | null {
  if (!userId) return null;
  try {
    return localStorage.getItem(focusStorageKey(userId));
  } catch {
    return null;
  }
}

export function writeFocusMetric(userId: string | undefined, metric: string | null) {
  if (!userId) return;
  try {
    if (metric) localStorage.setItem(focusStorageKey(userId), metric);
    else localStorage.removeItem(focusStorageKey(userId));
  } catch {
    // localStorage unavailable (private mode / disabled) — focus simply won't persist
  }
}

export const METRIC_RANGE: Record<string, [number, number, number]> = {
  vo2max: [25, 65, 0.5],
  resting_hr: [40, 100, 1],
  sleep_duration: [4, 10, 0.1],
  zone2_minutes: [0, 300, 5],
  hrv_rmssd: [15, 120, 1],
  steps: [1000, 20000, 500],
  strength_sessions: [0, 14, 0.5],
};

export const METRIC_COHORT_MEAN: Record<string, number> = {
  vo2max: 42,
  resting_hr: 65,
  sleep_duration: 7.5,
  zone2_minutes: 90,
  hrv_rmssd: 50,
  steps: 7500,
  strength_sessions: 1,
};

/**
 * Computes demographic-adjusted cohort means matching the score engine's reference norms.
 * Ensures the simulator baseline starts at the user's true neutral point (z = 0, delta = 0).
 */
export function getMetricCohortMean(
  metric: string,
  chronoAge?: number | null,
  sex?: 'm' | 'f' | string | null,
): number {
  const age = chronoAge ?? 35;
  const isFemale = sex === 'f';

  switch (metric) {
    case 'vo2max': {
      const mu = isFemale ? 40 - 0.30 * (age - 25) : 48 - 0.33 * (age - 25);
      return Math.round(mu * 10) / 10;
    }
    case 'resting_hr':
      return isFemale ? 70 : 66;
    case 'hrv_rmssd': {
      const mu = 55 - 0.5 * (age - 25);
      return Math.round(Math.max(15, mu));
    }
    case 'sleep_duration':
      return 7.5;
    case 'zone2_minutes':
      return 90;
    case 'steps':
      return 7500;
    case 'strength_sessions':
      return 1;
    default:
      return METRIC_COHORT_MEAN[metric] ?? 50;
  }
}

export function getScoreBand(scoreVal: number): string {
  const low = Math.min(90, Math.floor(scoreVal / 10) * 10);
  const high = low === 90 ? 100 : low + 9;
  return `${low} – ${high}`;
}

export function extractActualMetricValues(
  score: ScoreResult | undefined | null,
  levers: Lever[] | undefined | null
): Record<string, number | null> {
  const result: Record<string, number | null> = {};

  if (score?.domains) {
    for (const d of score.domains) {
      if (Array.isArray(d.metrics)) {
        for (const m of d.metrics) {
          if (m.value !== null && m.value !== undefined) {
            result[m.metric] = m.value;
          }
        }
      }
    }
  }

  if (levers) {
    for (const l of levers) {
      if (result[l.metric] === undefined && l.currentValue !== null && l.currentValue !== undefined) {
        result[l.metric] = l.currentValue;
      }
    }
  }

  return result;
}
