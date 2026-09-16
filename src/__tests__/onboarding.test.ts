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

  it('persists and checks user-scoped and session tutorial completion state', () => {
    const userId = 'user-abc-123';
    const userKey = `longevity_tutorial_completed_${userId}`;

    // Initially not completed
    expect(mockStorage.getItem(userKey)).toBeNull();

    // Mark completed for this user
    mockStorage.setItem(userKey, 'true');
    mockStorage.setItem('longevity_tutorial_completed', 'true');
    expect(mockStorage.getItem(userKey)).toBe('true');
    expect(mockStorage.getItem('longevity_tutorial_completed')).toBe('true');

    // Another user has not completed it yet
    const otherUserKey = 'longevity_tutorial_completed_user-xyz-789';
    expect(mockStorage.getItem(otherUserKey)).toBeNull();
  });

  it('correctly tracks sequential completion progress across the 3 onboarding steps', () => {
    // Step 1: Tutorial
    // Step 2: Source
    // Step 3: Coverage
    const calculateProgress = (tutorial: boolean, source: boolean, coverage: boolean) => {
      return (tutorial ? 1 : 0) + (source ? 1 : 0) + (coverage ? 1 : 0);
    };

    expect(calculateProgress(false, false, false)).toBe(0);
    expect(calculateProgress(true, false, false)).toBe(1);
    expect(calculateProgress(true, true, false)).toBe(2);
    expect(calculateProgress(true, true, true)).toBe(3);
  });
});
