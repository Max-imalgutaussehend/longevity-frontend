import { describe, it, expect } from 'vitest';
import type { Source } from '../api/types.js';
import { getSourceSyncStatusInfo } from '../routes/Daten.js';

export function getSourcesStatusChip(sources: Source[]): 'mock' | 'real' | 'none' {
  const hasActiveMockSource = sources.some(
    (s) => s.enabled && s.adapter === 'mock',
  );
  const hasRealConnectedSource = sources.some(
    (s) => s.enabled && s.adapter !== 'mock' && s.kind !== 'lab',
  );

  if (hasActiveMockSource) return 'mock';
  if (hasRealConnectedSource) return 'real';
  return 'none';
}

describe('getSourcesStatusChip', () => {
  it('shows mock when mock source is enabled', () => {
    const sources: Source[] = [
      { id: '1', kind: 'apple_health', adapter: 'mock', enabled: true, lastSyncAt: null, sampleCount: 150 },
    ];
    expect(getSourcesStatusChip(sources)).toBe('mock');
  });

  it('does NOT show mock when mock source is disabled / removed', () => {
    // This was the bug: previously it showed Mock-Daten aktiv even when mock source was disabled or removed!
    const sources: Source[] = [
      { id: '1', kind: 'apple_health', adapter: 'mock', enabled: false, lastSyncAt: null, sampleCount: 0 },
    ];
    expect(getSourcesStatusChip(sources)).toBe('none');
  });

  it('does NOT show mock when sources list is empty', () => {
    expect(getSourcesStatusChip([])).toBe('none');
  });

  it('shows real when a real source (e.g. Google Fit) is enabled', () => {
    const sources: Source[] = [
      { id: '1', kind: 'google_fit', adapter: 'oauth', enabled: true, lastSyncAt: '2026-09-13T12:00:00Z', sampleCount: 200 },
      { id: '2', kind: 'apple_health', adapter: 'mock', enabled: false, lastSyncAt: null, sampleCount: 0 },
    ];
    expect(getSourcesStatusChip(sources)).toBe('real');
  });

  it('shows none when real source is deactivated', () => {
    const sources: Source[] = [
      { id: '1', kind: 'google_fit', adapter: 'oauth', enabled: false, lastSyncAt: '2026-09-13T12:00:00Z', sampleCount: 200 },
    ];
    expect(getSourcesStatusChip(sources)).toBe('none');
  });
});

describe('getSourceSyncStatusInfo', () => {
  it('returns ready status for undefined source', () => {
    const info = getSourceSyncStatusInfo(undefined, 'Bereit');
    expect(info.status).toBe('ready');
    expect(info.badgeLabel).toBe('Bereit');
    expect(info.badgeColor).toBe('neutral');
    expect(info.isTokenExpired).toBe(false);
    expect(info.needsReconnect).toBe(false);
    expect(info.isConnected).toBe(false);
  });

  it('detects token_expired status explicitly', () => {
    const src: Source = {
      id: 'src-1',
      kind: 'withings',
      adapter: 'oauth',
      enabled: true,
      connected: false,
      syncStatus: 'token_expired',
      syncError: 'invalid_grant',
      lastSyncAt: '2026-09-15T10:00:00Z',
      sampleCount: 42,
    };
    const info = getSourceSyncStatusInfo(src);
    expect(info.status).toBe('token_expired');
    expect(info.badgeLabel).toBe('Token abgelaufen');
    expect(info.badgeColor).toBe('amber');
    expect(info.isTokenExpired).toBe(true);
    expect(info.needsReconnect).toBe(true);
  });

  it('detects token expiration when disconnected but existing samples exist', () => {
    const src: Source = {
      id: 'src-2',
      kind: 'oura',
      adapter: 'oauth',
      enabled: true,
      connected: false,
      lastSyncAt: '2026-09-14T08:00:00Z',
      sampleCount: 120,
    };
    const info = getSourceSyncStatusInfo(src);
    expect(info.status).toBe('token_expired');
    expect(info.badgeLabel).toBe('Token abgelaufen');
    expect(info.needsReconnect).toBe(true);
  });

  it('detects sync error status', () => {
    const src: Source = {
      id: 'src-3',
      kind: 'strava',
      adapter: 'oauth',
      enabled: true,
      connected: true,
      syncStatus: 'error',
      syncError: 'Network timeout (504 Gateway Timeout)',
      lastSyncAt: '2026-09-15T09:00:00Z',
      sampleCount: 15,
    };
    const info = getSourceSyncStatusInfo(src);
    expect(info.status).toBe('error');
    expect(info.badgeLabel).toBe('Sync-Fehler');
    expect(info.badgeColor).toBe('red');
    expect(info.isError).toBe(true);
    expect(info.needsReconnect).toBe(true);
  });

  it('shows paused badge when connected but disabled', () => {
    const src: Source = {
      id: 'src-4',
      kind: 'google_fit',
      adapter: 'oauth',
      enabled: false,
      connected: true,
      syncStatus: 'ok',
      lastSyncAt: '2026-09-15T11:00:00Z',
      sampleCount: 50,
    };
    const info = getSourceSyncStatusInfo(src);
    expect(info.status).toBe('paused');
    expect(info.badgeLabel).toBe('Deaktiviert (50 pausiert)');
    expect(info.badgeColor).toBe('neutral');
    expect(info.needsReconnect).toBe(false);
  });

  it('shows connected ok badge for active real source', () => {
    const src: Source = {
      id: 'src-5',
      kind: 'google_fit',
      adapter: 'oauth',
      enabled: true,
      connected: true,
      syncStatus: 'ok',
      lastSyncAt: '2026-09-15T12:00:00Z',
      sampleCount: 100,
    };
    const info = getSourceSyncStatusInfo(src);
    expect(info.status).toBe('ok');
    expect(info.badgeLabel).toBe('Verbunden (100)');
    expect(info.badgeColor).toBe('teal');
    expect(info.needsReconnect).toBe(false);
  });

  it('shows mock badge for mock source', () => {
    const src: Source = {
      id: 'src-6',
      kind: 'apple_health',
      adapter: 'mock',
      enabled: true,
      connected: true,
      syncStatus: 'ok',
      lastSyncAt: '2026-09-15T12:00:00Z',
      sampleCount: 250,
    };
    const info = getSourceSyncStatusInfo(src);
    expect(info.status).toBe('ok');
    expect(info.badgeLabel).toBe('Mock-Daten aktiv (250)');
    expect(info.badgeColor).toBe('amber');
  });
});

