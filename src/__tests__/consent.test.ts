import { describe, it, expect } from 'vitest';
import {
  CURRENT_HEALTH_DATA_CONSENT_VERSION,
  HEALTH_DATA_CONSENT_TEXT,
} from '../components/ConsentModal.js';

describe('GDPR Art. 9 Consent Specifications (#24)', () => {
  it('defines the correct version format', () => {
    expect(CURRENT_HEALTH_DATA_CONSENT_VERSION).toMatch(/^\d{4}-\d{2}-v\d+$/);
    expect(CURRENT_HEALTH_DATA_CONSENT_VERSION).toBe('2026-09-v1');
  });

  it('specifies explicit processing scope for special categories of personal data', () => {
    expect(HEALTH_DATA_CONSENT_TEXT).toContain('Gesundheitsdaten');
    expect(HEALTH_DATA_CONSENT_TEXT).toContain('Herzfrequenz');
    expect(HEALTH_DATA_CONSENT_TEXT).toContain('Herzfrequenzvariabilität');
    expect(HEALTH_DATA_CONSENT_TEXT).toContain('Schlafdauer');
    expect(HEALTH_DATA_CONSENT_TEXT).toContain('Schritte');
  });

  it('specifies concrete purpose of processing', () => {
    expect(HEALTH_DATA_CONSENT_TEXT).toContain('Zweck:');
    expect(HEALTH_DATA_CONSENT_TEXT).toContain('Longevity Scores');
  });

  it('explicitly states voluntary nature and revocation rights under Art. 7 Abs. 3 DSGVO', () => {
    expect(HEALTH_DATA_CONSENT_TEXT).toContain('Widerruf');
    expect(HEALTH_DATA_CONSENT_TEXT).toContain('freiwillig');
    expect(HEALTH_DATA_CONSENT_TEXT).toContain('Wirkung für die Zukunft');
  });
});

describe('ConsentModal Z-Index Layering (#80)', () => {
  it('renders with zIndex: 10050 to display above TutorialModal (zIndex: 9999)', async () => {
    const { renderToString } = await import('react-dom/server');
    const { createElement } = await import('react');
    const { QueryClient, QueryClientProvider } = await import('@tanstack/react-query');
    const { ConsentModal } = await import('../components/ConsentModal.js');

    const queryClient = new QueryClient();
    const html = renderToString(
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(ConsentModal, { isOpen: true, onClose: () => {} })
      )
    );

    expect(html).toContain('z-index:10050');
  });

  it('supports custom zIndex override if specified', async () => {
    const { renderToString } = await import('react-dom/server');
    const { createElement } = await import('react');
    const { QueryClient, QueryClientProvider } = await import('@tanstack/react-query');
    const { ConsentModal } = await import('../components/ConsentModal.js');

    const queryClient = new QueryClient();
    const html = renderToString(
      createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(ConsentModal, { isOpen: true, onClose: () => {}, zIndex: 12000 })
      )
    );

    expect(html).toContain('z-index:12000');
  });
});

