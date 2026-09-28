import { describe, it, expect } from 'vitest';
import { buildHealthAutoExportWebhookUrl } from '../routes/daten/components/HealthAutoExportModal.js';

describe('Health Auto Export Webhook URL logic (#98)', () => {
  it('falls back to window.location.origin when no baseUrl is provided', () => {
    expect(buildHealthAutoExportWebhookUrl()).toBe(
      `${window.location.origin}/api/sources/health-auto-export/webhook`,
    );
  });

  it('constructs token-authenticated webhook URL when 32-byte secret is provided', () => {
    const secret = 'a'.repeat(64);
    const url = buildHealthAutoExportWebhookUrl('https://longevity.maxrommel.de', secret);
    expect(url).toBe(`https://longevity.maxrommel.de/api/sources/health-auto-export/webhook/${secret}`);
  });

  it('handles custom base URL with or without trailing slash', () => {
    const secret = 'test-token-123';
    expect(buildHealthAutoExportWebhookUrl('http://localhost:3000/', secret)).toBe(
      'http://localhost:3000/api/sources/health-auto-export/webhook/test-token-123',
    );
    expect(buildHealthAutoExportWebhookUrl('http://localhost:3000', secret)).toBe(
      'http://localhost:3000/api/sources/health-auto-export/webhook/test-token-123',
    );
  });
});
