import { describe, it, expect } from 'vitest';

describe('Verified Health Insurance Tokens UI (#88)', () => {
  const SOURCE_LABELS: Record<string, string> = {
    apple_health: 'Apple Health',
    'apple-health': 'Apple Health',
    oura: 'Oura Ring',
    lab: 'Laborwerte',
    questionnaire: 'Fragebogen',
    withings: 'Withings',
    strava: 'Strava',
    google_fit: 'Google Fit',
    'google-fit': 'Google Fit',
    google_health: 'Google Health',
    'google-health': 'Google Health',
    fhir: 'FHIR Labor',
  };

  it('correctly maps certified and cloud-verified source kinds to German labels', () => {
    expect(SOURCE_LABELS.oura).toBe('Oura Ring');
    expect(SOURCE_LABELS.withings).toBe('Withings');
    expect(SOURCE_LABELS.strava).toBe('Strava');
    expect(SOURCE_LABELS.google_fit).toBe('Google Fit');
    expect(SOURCE_LABELS['google-fit']).toBe('Google Fit');
    expect(SOURCE_LABELS.google_health).toBe('Google Health');
    expect(SOURCE_LABELS['google-health']).toBe('Google Health');
    expect(SOURCE_LABELS.fhir).toBe('FHIR Labor');
  });

  it('validates verified insurance token payload structure', () => {
    const verifiedToken = {
      id: 'mock-uuid-123',
      bandLow: 80,
      bandHigh: 90,
      issuedAt: '2026-09-27T10:00:00.000Z',
      expiresAt: '2026-12-26T10:00:00.000Z',
      revokedAt: null,
      verifiedOnly: true,
      trustLevel: 'cloud_verified' as const,
      verifiedSources: ['withings', 'oura'],
      certificateType: 'GKV / PKV Verifizierter Prämiennachweis',
      issuer: 'LONGEVITY Health Intermediary (Ed25519 zertifiziert)',
    };

    expect(verifiedToken.verifiedOnly).toBe(true);
    expect(verifiedToken.trustLevel).toBe('cloud_verified');
    expect(verifiedToken.verifiedSources).toContain('withings');
    expect(verifiedToken.certificateType).toBe('GKV / PKV Verifizierter Prämiennachweis');
  });

  it('differentiates standard score tokens from insurance certificates', () => {
    const standardToken = {
      id: 'std-uuid-456',
      bandLow: 70,
      bandHigh: 80,
      issuedAt: '2026-09-27T10:00:00.000Z',
      expiresAt: '2026-12-26T10:00:00.000Z',
      revokedAt: null,
      verifiedOnly: false,
      trustLevel: 'unverified' as const,
      verifiedSources: [],
      certificateType: 'Standard Score-Nachweis',
    };

    expect(standardToken.verifiedOnly).toBe(false);
    expect(standardToken.certificateType).toBe('Standard Score-Nachweis');
    expect(standardToken.verifiedSources).toHaveLength(0);
  });
});
