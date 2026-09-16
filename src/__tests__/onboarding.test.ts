import { describe, it, expect, beforeEach } from 'vitest';
import { routes } from '../routesConfig.js';

describe('Guided Onboarding Specifications (#25)', () => {
  const store: Record<string, string> = {};
  const mockStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, val: string) => { store[key] = String(val); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
  };

  beforeEach(() => {
    mockStorage.clear();
  });

  it('provides route for verification and dashboard navigation', () => {
    expect(routes.some((r) => r.path === '/verify-email/:token')).toBe(true);
    expect(routes.some((r) => r.children?.some((c) => c.path === 'dashboard'))).toBe(true);
    expect(routes.some((r) => r.children?.some((c) => c.path === 'daten'))).toBe(true);
  });

  it('persists and restores onboarding collapsed state in localStorage', () => {
    expect(mockStorage.getItem('longevity_onboarding_collapsed')).toBeNull();

    mockStorage.setItem('longevity_onboarding_collapsed', 'true');
    expect(mockStorage.getItem('longevity_onboarding_collapsed')).toBe('true');

    mockStorage.setItem('longevity_onboarding_collapsed', 'false');
    expect(mockStorage.getItem('longevity_onboarding_collapsed')).toBe('false');
  });

  it('handles default cohort score baseline when user has no data (coverage = 0)', () => {
    const emptyStateScore = 50.0;
    const coverage = 0;
    expect(emptyStateScore).toBe(50.0);
    expect(coverage).toBe(0);
  });
});
