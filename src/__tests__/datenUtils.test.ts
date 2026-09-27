import { describe, it, expect } from 'vitest';
import {
  formatMetricVal,
  daysAgoLabel,
  formatDate,
  renderMetricIcon,
  renderSourceIcon,
} from '../routes/daten/datenUtils.js';

describe('datenUtils', () => {
  describe('formatMetricVal', () => {
    it('formats steps as localized integer', () => {
      expect(formatMetricVal('steps', 12345)).toBe('12.345');
    });

    it('formats sleep_duration and vo2max with 1 decimal', () => {
      expect(formatMetricVal('sleep_duration', 7.5)).toBe('7.5');
      expect(formatMetricVal('vo2max', 45)).toBe('45.0');
    });

    it('formats resting_hr and systolic_bp as rounded string', () => {
      expect(formatMetricVal('resting_hr', 58.7)).toBe('59');
      expect(formatMetricVal('systolic_bp', 120.2)).toBe('120');
    });

    it('formats general metrics with 1 decimal or integer', () => {
      expect(formatMetricVal('other', 12)).toBe('12');
      expect(formatMetricVal('other', 12.34)).toBe('12.3');
    });
  });

  describe('daysAgoLabel', () => {
    it('returns null for null', () => {
      expect(daysAgoLabel(null)).toBeNull();
    });

    it('returns correct label for today (<1 day)', () => {
      expect(daysAgoLabel(0.3)).toBe('Heute eingetragen');
    });

    it('returns correct label for 1 day ago', () => {
      expect(daysAgoLabel(1.2)).toBe('Vor 1 Tag eingetragen');
    });

    it('returns correct label for multiple days ago', () => {
      expect(daysAgoLabel(4.8)).toBe('Vor 5 Tagen eingetragen');
    });
  });

  describe('formatDate', () => {
    it('returns "Noch nie" when given null or undefined', () => {
      expect(formatDate(null)).toBe('Noch nie');
      expect(formatDate(undefined)).toBe('Noch nie');
    });

    it('formats valid ISO date strings', () => {
      const res = formatDate('2026-09-20T10:00:00Z');
      expect(res).not.toBe('Noch nie');
      expect(res).toContain('2026');
    });
  });

  describe('icon renderers', () => {
    it('renders metric icon without crashing', () => {
      expect(renderMetricIcon('steps')).toBeDefined();
      expect(renderMetricIcon('resting_hr')).toBeDefined();
      expect(renderMetricIcon('unknown')).toBeDefined();
    });

    it('renders source icon without crashing', () => {
      expect(renderSourceIcon('google_fit')).toBeDefined();
      expect(renderSourceIcon('apple_health')).toBeDefined();
      expect(renderSourceIcon('unknown')).toBeDefined();
    });
  });
});
