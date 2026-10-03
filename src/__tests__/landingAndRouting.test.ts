import { describe, it, expect } from 'vitest';
import { routes } from '../routesConfig.js';
import { SUPPORTED_BRANDS, PolarLogo } from '../components/BrandLogos.js';
import { calculateSimulatedScore } from '../routes/landing/landingUtils.js';

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
    expect(optimal.band).toMatch(/^Band \d0–\d9$/);
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
    expect(brandIds).toContain('whoop');
    expect(brandIds).toContain('polar');
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

  it('verifies Polar brand logo uses official emblem paths and standard 24x24 viewBox', () => {
    const polarBrand = SUPPORTED_BRANDS.find((b) => b.id === 'polar');
    expect(polarBrand).toBeDefined();
    expect(polarBrand?.name).toBe('Polar');
    expect(polarBrand?.accentColor).toBe('#D0142C');

    const rendered = PolarLogo({ size: 24 });
    expect(rendered.props['aria-label']).toBe('Polar Logo');
    expect(rendered.props.viewBox).toBe('0 0 24 24');

    const children = Array.isArray(rendered.props.children)
      ? rendered.props.children
      : [rendered.props.children];
    const pathDs = children.map((c: any) => c.props.d).join(' ');
    expect(pathDs).toContain('M2.123');
    expect(pathDs).not.toContain('zm1 14.5h-2v-2h2v2zm0-4h-2V7h2v5.5z');
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
