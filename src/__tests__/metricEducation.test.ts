import { describe, it, expect } from 'vitest';
import { METRIC_EDUCATION, METRIC_BADGE_LABELS, getMetricEducation } from '../lib/metricEducation.js';
import { METRIC_LABELS } from '../lib/formatters.js';
import { METRIC_RANGE } from '../routes/Hebel.js';

describe('metricEducation content (#94)', () => {
  it('provides complete education content for every metric used in the Hebel simulator', () => {
    for (const metric of Object.keys(METRIC_RANGE)) {
      const edu = getMetricEducation(metric);
      expect(edu, `missing education content for simulator metric "${metric}"`).toBeDefined();
    }
  });

  it('every entry has non-empty required fields and at least 3 actionable tips', () => {
    for (const [metric, edu] of Object.entries(METRIC_EDUCATION)) {
      expect(edu.title.length, `${metric}.title`).toBeGreaterThan(0);
      expect(edu.summary.length, `${metric}.summary`).toBeGreaterThan(0);
      expect(edu.whyItMatters.length, `${metric}.whyItMatters`).toBeGreaterThan(0);
      expect(edu.optimalRange.length, `${metric}.optimalRange`).toBeGreaterThan(0);
      expect(edu.sampleHabit.length, `${metric}.sampleHabit`).toBeGreaterThan(0);
      expect(edu.actionableTips.length, `${metric}.actionableTips`).toBeGreaterThanOrEqual(3);
      expect(['quick-win', 'high-impact', 'kasse']).toContain(edu.badge);
    }
  });

  it('every badge value has a display label', () => {
    for (const edu of Object.values(METRIC_EDUCATION)) {
      expect(METRIC_BADGE_LABELS[edu.badge]).toBeTruthy();
    }
  });

  it('getMetricEducation returns undefined for an unknown metric', () => {
    expect(getMetricEducation('does_not_exist')).toBeUndefined();
  });

  it('titles are consistent with the shared METRIC_LABELS where both are defined', () => {
    for (const [metric, edu] of Object.entries(METRIC_EDUCATION)) {
      const sharedLabel = METRIC_LABELS[metric];
      if (sharedLabel) {
        expect(edu.title, `${metric} title should match shared label`).toBe(sharedLabel);
      }
    }
  });
});
