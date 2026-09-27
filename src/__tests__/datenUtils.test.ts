import { describe, it, expect } from 'vitest';
import {
  formatMetricVal,
  daysAgoLabel,
  formatDate,
  renderMetricIcon,
  renderSourceIcon,
  getSourceSyncStatusInfo,
  timeAgo,
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

  describe('getSourceSyncStatusInfo', () => {
    it('returns ready status for undefined source', () => {
      const info = getSourceSyncStatusInfo(undefined, 'Bereit');
      expect(info.status).toBe('ready');
      expect(info.badgeLabel).toBe('Bereit');
      expect(info.badgeColor).toBe('neutral');
      expect(info.isConnected).toBe(false);
    });

    it('returns token_expired when syncStatus is token_expired', () => {
      const info = getSourceSyncStatusInfo({
        id: 's1',
        kind: 'withings',
        adapter: 'withings',
        enabled: true,
        syncStatus: 'token_expired',
        lastSyncAt: null,
        sampleCount: 10,
      });
      expect(info.status).toBe('token_expired');
      expect(info.isTokenExpired).toBe(true);
      expect(info.badgeColor).toBe('amber');
    });

    it('returns error status when syncStatus is error', () => {
      const info = getSourceSyncStatusInfo({
        id: 's1',
        kind: 'oura',
        adapter: 'oura',
        enabled: true,
        connected: true,
        syncStatus: 'error',
        lastSyncAt: null,
        sampleCount: 5,
      });
      expect(info.status).toBe('error');
      expect(info.isError).toBe(true);
      expect(info.badgeColor).toBe('red');
    });

    it('returns paused status when source is connected but disabled', () => {
      const info = getSourceSyncStatusInfo({
        id: 's1',
        kind: 'apple_health',
        adapter: 'mock',
        enabled: false,
        connected: true,
        lastSyncAt: null,
        sampleCount: 42,
      });
      expect(info.status).toBe('paused');
      expect(info.badgeLabel).toBe('Deaktiviert (42 pausiert)');
      expect(info.badgeColor).toBe('neutral');
    });

    it('returns ok status with sample count for active mock source', () => {
      const info = getSourceSyncStatusInfo({
        id: 's1',
        kind: 'apple_health',
        adapter: 'mock',
        enabled: true,
        connected: true,
        lastSyncAt: null,
        sampleCount: 150,
      });
      expect(info.status).toBe('ok');
      expect(info.badgeLabel).toBe('Mock-Daten aktiv (150)');
      expect(info.badgeColor).toBe('amber');
    });

    it('returns ok status with teal color for active real source', () => {
      const info = getSourceSyncStatusInfo({
        id: 's1',
        kind: 'strava',
        adapter: 'strava',
        enabled: true,
        connected: true,
        lastSyncAt: '2026-09-20T10:00:00Z',
        sampleCount: 20,
      });
      expect(info.status).toBe('ok');
      expect(info.badgeLabel).toBe('Verbunden (20)');
      expect(info.badgeColor).toBe('teal');
    });
  });

  describe('timeAgo', () => {
    it('returns "Heute" for recent timestamps within 1 minute', () => {
      const nowIso = new Date().toISOString();
      expect(timeAgo(nowIso)).toBe('Heute');
    });

    it('returns minutes ago for timestamps under 1 hour', () => {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      expect(timeAgo(fiveMinAgo)).toBe('Vor 5 Min.');
    });

    it('returns days ago for dates within a week', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      expect(timeAgo(threeDaysAgo)).toBe('Vor 3 Tagen');
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
