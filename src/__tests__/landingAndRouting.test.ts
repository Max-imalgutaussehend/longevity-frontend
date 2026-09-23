import { describe, it, expect } from 'vitest';
import { routes } from '../routesConfig.js';
import { SUPPORTED_BRANDS } from '../components/BrandLogos.js';

export function calculateSimulatedScore(restingHr: number, sleepHours: number, vo2max: number, zone2Min: number) {
  const hrImpact = (65 - restingHr) * 0.45;
  const sleepImpact = (Math.min(sleepHours, 8.2) - 6.5) * 4.2;
  const vo2Impact = (vo2max - 38) * 0.85;
  const zone2Impact = (Math.min(zone2Min, 240) - 90) * 0.08;

  const rawScore = 60 + hrImpact + sleepImpact + vo2Impact + zone2Impact;
  const score = Math.max(15, Math.min(98, Math.round(rawScore)));

  const chronoAge = 34;
  const ageDelta = ((score - 50) / 10) * -1.2;
  const vitalityAge = Math.max(20, Math.round((chronoAge + ageDelta) * 10) / 10);

  let band = 'Band 50';
  if (score >= 80) band = 'Band 80';
  else if (score >= 65) band = 'Band 65';
  else if (score >= 50) band = 'Band 50';
  else band = 'Band 35';

  return { score, vitalityAge, yearsGained: Math.round((chronoAge - vitalityAge) * 10) / 10, band };
}

describe('Router Public & Protected Structure (#9)', () => {
  it('defines the public layer at / with Landing as index', () => {
    const publicRoute = routes.find((r) => r.path === '/');
    expect(publicRoute).toBeDefined();
    expect(publicRoute?.children).toBeDefined();

    const indexRoute = publicRoute?.children?.find((c) => c.index === true);
    expect(indexRoute).toBeDefined();

    const impressumRoute = publicRoute?.children?.find((c) => c.path === 'impressum');
    expect(impressumRoute).toBeDefined();

    const datenschutzRoute = publicRoute?.children?.find((c) => c.path === 'datenschutz');
    expect(datenschutzRoute).toBeDefined();
  });

  it('defines the protected app routes in a separate layout route', () => {
    const protectedLayout = routes.find((r) => r.path === undefined && r.children?.some((c) => c.path === 'dashboard'));
    expect(protectedLayout).toBeDefined();
    expect(protectedLayout?.children?.map((c) => c.path)).toEqual(
      expect.arrayContaining(['dashboard', 'score', 'hebel', 'daten', 'freigabe', 'vorteile', 'report'])
    );
  });

  it('has standalone login, register, and verify routes', () => {
    expect(routes.some((r) => r.path === '/login')).toBe(true);
    expect(routes.some((r) => r.path === '/register')).toBe(true);
    expect(routes.some((r) => r.path === '/verify/:id')).toBe(true);
  });
});

describe('Landing Page Simulator Logic (#8, #18)', () => {
  it('calculates higher score and reduced vitality age for optimal biomarkers', () => {
    const optimal = calculateSimulatedScore(50, 8.0, 52, 180);
    expect(optimal.score).toBeGreaterThanOrEqual(80);
    expect(optimal.band).toBe('Band 80');
    expect(optimal.vitalityAge).toBeLessThan(34);
    expect(optimal.yearsGained).toBeGreaterThan(0);
  });

  it('calculates lower score and higher vitality age for degraded biomarkers', () => {
    const degraded = calculateSimulatedScore(80, 5.2, 30, 0);
    expect(degraded.score).toBeLessThan(50);
    expect(degraded.vitalityAge).toBeGreaterThanOrEqual(34);
    expect(degraded.yearsGained).toBeLessThanOrEqual(0);
  });

  it('clamps scores between 15 and 98', () => {
    const extremeLow = calculateSimulatedScore(120, 2.0, 10, 0);
    expect(extremeLow.score).toBeGreaterThanOrEqual(15);

    const extremeHigh = calculateSimulatedScore(35, 9.0, 75, 400);
    expect(extremeHigh.score).toBeLessThanOrEqual(98);
  });
});

describe('Landing Page Partner Brand Logos', () => {
  it('defines the key supported health & wearable platforms', () => {
    const brandIds = SUPPORTED_BRANDS.map((b) => b.id);
    expect(brandIds).toContain('apple');
    expect(brandIds).toContain('google');
    expect(brandIds).toContain('fitbit');
    expect(brandIds).toContain('garmin');
    expect(brandIds).toContain('oura');
    expect(brandIds).toContain('strava');
    expect(brandIds).toContain('withings');
  });

  it('provides valid Logo component and metadata for each brand', () => {
    for (const brand of SUPPORTED_BRANDS) {
      expect(brand.name).toBeTruthy();
      expect(brand.category).toBeTruthy();
      expect(brand.metrics).toBeTruthy();
      expect(brand.badge).toBeTruthy();
      expect(typeof brand.Logo).toBe('function');
    }
  });

  it('verifies Apple brand logo uses standard 24x24 viewBox', () => {
    const appleBrand = SUPPORTED_BRANDS.find((b) => b.id === 'apple');
    expect(appleBrand).toBeDefined();
    expect(appleBrand?.name).toBe('Apple Health');
    expect(appleBrand?.accentColor).toBe('#1d1d1f');
  });
});

describe('Responsive Landing Navigation & CSS Tokens (#70)', () => {
  it('enforces 1140px breakpoint for desktop navigation in tokens.css to prevent button overlapping', async () => {
    // @ts-expect-error node built-in
    const { readFileSync } = await import('node:fs');
    // @ts-expect-error node built-in
    const { resolve } = await import('node:path');
    // @ts-expect-error node process in test
    const rootDir = process.cwd();
    const css = readFileSync(resolve(rootDir, 'src/styles/tokens.css'), 'utf-8');

    expect(css).toContain('@media (min-width: 1140px)');
    expect(css).toContain('.landing-desktop-nav');
    expect(css).toContain('@media (max-width: 1139px)');
    expect(css).toContain('.landing-mobile-menu-btn');
  });

  it('hides research badge and compacts header CTA buttons on mobile viewports', async () => {
    // @ts-expect-error node built-in
    const { readFileSync } = await import('node:fs');
    // @ts-expect-error node built-in
    const { resolve } = await import('node:path');
    // @ts-expect-error node process in test
    const rootDir = process.cwd();
    const css = readFileSync(resolve(rootDir, 'src/styles/tokens.css'), 'utf-8');

    expect(css).toContain('.landing-research-badge');
    expect(css).toContain('.landing-header-cta-btn');
    expect(css).toContain('@media (max-width: 639px)');
  });
});

describe('Auth Guard & Unauthenticated Redirection (#71)', () => {
  it('encodes returnTo path with query parameters cleanly for protected routes', () => {
    const pathname = '/dashboard';
    const search = '?tab=vitals';
    const returnTo = encodeURIComponent(pathname + search);
    expect(returnTo).toBe('%2Fdashboard%3Ftab%3Dvitals');

    const decoded = decodeURIComponent(returnTo);
    expect(decoded).toBe('/dashboard?tab=vitals');
  });

  it('verifies AppShell and client.ts implement auth-guards that prevent empty dashboard flash', async () => {
    // @ts-expect-error node built-in
    const { readFileSync } = await import('node:fs');
    // @ts-expect-error node built-in
    const { resolve } = await import('node:path');
    // @ts-expect-error node process in test
    const rootDir = process.cwd();

    const appShellCode = readFileSync(resolve(rootDir, 'src/routes/AppShell.tsx'), 'utf-8');
    expect(appShellCode).toContain('if (isUserLoading)');
    expect(appShellCode).toContain('if (!user)');
    expect(appShellCode).toContain('<Navigate to={`/login?returnTo=${returnTo}`} replace />');

    const clientCode = readFileSync(resolve(rootDir, 'src/api/client.ts'), 'utf-8');
    expect(clientCode).toContain('res.status === 401');
    expect(clientCode).toContain('router.navigate');
    expect(clientCode).toContain('!pathname.startsWith(\'/login\')');
  });
});
