import { describe, it, expect } from 'vitest';
import type { Source } from '../api/types.js';

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
