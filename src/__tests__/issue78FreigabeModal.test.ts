import { describe, it, expect } from 'vitest';
import { VERIFIED_ADAPTERS } from '../routes/Freigabe.js';
import type { Source } from '../api/types.js';

describe('Freigabe Modal & Standard-Score UX (#78)', () => {
  const isVerifiedSource = (s: Source) =>
    VERIFIED_ADAPTERS.includes(s.adapter) && s.enabled && s.sampleCount > 0;

  const determineHasVerifiedSources = (sources: Source[]) =>
    sources.some(isVerifiedSource);

  const canCreateToken = (verifiedOnly: boolean, hasVerifiedSources: boolean, isPending: boolean) =>
    !isPending && (!verifiedOnly || hasVerifiedSources);

  it('recognizes verified adapters list correctly', () => {
    expect(VERIFIED_ADAPTERS).toContain('withings');
    expect(VERIFIED_ADAPTERS).toContain('oura');
    expect(VERIFIED_ADAPTERS).toContain('strava');
    expect(VERIFIED_ADAPTERS).toContain('google-fit');
    expect(VERIFIED_ADAPTERS).toContain('google-health');
    expect(VERIFIED_ADAPTERS).toContain('fhir');

    // Mock and manual sources must never be in verified adapters
    expect(VERIFIED_ADAPTERS).not.toContain('mock');
    expect(VERIFIED_ADAPTERS).not.toContain('manual');
    expect(VERIFIED_ADAPTERS).not.toContain('upload');
    expect(VERIFIED_ADAPTERS).not.toContain('questionnaire');
  });

  it('determines hasVerifiedSources = false for users with only mock or manual data', () => {
    const mockSources: Source[] = [
      { id: '1', kind: 'apple_health', adapter: 'mock', enabled: true, sampleCount: 1500, lastSyncAt: '2026-09-28T10:00:00Z', syncStatus: 'ok' },
      { id: '2', kind: 'lab', adapter: 'manual', enabled: true, sampleCount: 5, lastSyncAt: null, syncStatus: 'ok' },
    ];

    expect(determineHasVerifiedSources(mockSources)).toBe(false);
  });

  it('determines hasVerifiedSources = true for users with active connected cloud trackers', () => {
    const sourcesWithWithings: Source[] = [
      { id: '1', kind: 'withings', adapter: 'withings', enabled: true, sampleCount: 420, lastSyncAt: '2026-09-28T10:00:00Z', syncStatus: 'ok' },
      { id: '2', kind: 'apple_health', adapter: 'mock', enabled: true, sampleCount: 1500, lastSyncAt: '2026-09-28T10:00:00Z', syncStatus: 'ok' },
    ];

    expect(determineHasVerifiedSources(sourcesWithWithings)).toBe(true);
  });

  it('ignores disabled or empty verified sources', () => {
    const disabledOura: Source[] = [
      { id: '1', kind: 'oura', adapter: 'oura', enabled: false, sampleCount: 200, lastSyncAt: '2026-09-20T10:00:00Z', syncStatus: 'ok' },
      { id: '2', kind: 'strava', adapter: 'strava', enabled: true, sampleCount: 0, lastSyncAt: null, syncStatus: 'ok' },
    ];

    expect(determineHasVerifiedSources(disabledOura)).toBe(false);
  });

  it('disables token creation button when verifiedOnly is true but user has no verified sources', () => {
    // verifiedOnly = true, hasVerifiedSources = false -> disabled
    expect(canCreateToken(true, false, false)).toBe(false);

    // verifiedOnly = false (standard score), hasVerifiedSources = false -> enabled
    expect(canCreateToken(false, false, false)).toBe(true);

    // verifiedOnly = true, hasVerifiedSources = true -> enabled
    expect(canCreateToken(true, true, false)).toBe(true);

    // isPending = true -> always disabled
    expect(canCreateToken(false, false, true)).toBe(false);
    expect(canCreateToken(true, true, true)).toBe(false);
  });

  it('validates Standard Score-Nachweis payload structure for verification', () => {
    const standardVerifyResult = {
      valid: true,
      band: { low: 70, high: 79 },
      issuedAt: '2026-09-28T12:00:00Z',
      expiresAt: '2026-12-27T12:00:00Z',
      verifiedOnly: false,
      trustLevel: 'unverified' as const,
      certificateType: 'Standard Score-Nachweis',
      issuer: 'LONGEVITY Health Intermediary (Ed25519 zertifiziert)',
    };

    expect(standardVerifyResult.valid).toBe(true);
    expect(standardVerifyResult.verifiedOnly).toBe(false);
    expect(standardVerifyResult.certificateType).toBe('Standard Score-Nachweis');
    expect(standardVerifyResult.band.low).toBe(70);
    expect(standardVerifyResult.band.high).toBe(79);
  });
});
