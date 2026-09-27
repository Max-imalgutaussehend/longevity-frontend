import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getCsrfTokenFromCookie, fetchCsrfToken, apiClient } from '../api/client.js';

describe('Frontend CSRF Protection Client (#103)', () => {
  const originalCookie = document.cookie;

  beforeEach(() => {
    // Clear cookies
    document.cookie = 'XSRF-TOKEN=; Max-Age=0; path=/';
    vi.restoreAllMocks();
  });

  afterEach(() => {
    document.cookie = originalCookie;
  });

  it('extracts CSRF token from document.cookie when XSRF-TOKEN is present', () => {
    document.cookie = 'other=123';
    document.cookie = 'XSRF-TOKEN=my-secure-csrf-token-abc';
    document.cookie = 'foo=bar';
    expect(getCsrfTokenFromCookie()).toBe('my-secure-csrf-token-abc');
  });

  it('returns null when XSRF-TOKEN cookie is missing', () => {
    document.cookie = 'other=123; foo=bar';
    expect(getCsrfTokenFromCookie()).toBeNull();
  });

  it('handles URL-encoded tokens correctly', () => {
    document.cookie = 'XSRF-TOKEN=token%2Bspecial%2Fchars%3D';
    expect(getCsrfTokenFromCookie()).toBe('token+special/chars=');
  });

  it('fetchCsrfToken returns existing cookie token without network call', async () => {
    document.cookie = 'XSRF-TOKEN=cookie-token-123';
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    const token = await fetchCsrfToken();
    expect(token).toBe('cookie-token-123');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('fetchCsrfToken fetches from /auth/csrf when cookie is missing', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ csrfToken: 'fetched-token-xyz' }),
    } as Response);

    const token = await fetchCsrfToken();
    expect(token).toBe('fetched-token-xyz');
    expect(fetchSpy).toHaveBeenCalledWith('/api/auth/csrf', { credentials: 'include' });
  });

  it('apiClient includes X-CSRF-Token on mutating requests (POST)', async () => {
    document.cookie = 'XSRF-TOKEN=active-csrf-token';

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    } as Response);

    await apiClient('/score/simulate', {
      method: 'POST',
      body: JSON.stringify({ overrides: { vo2max: 50 } }),
    });

    expect(fetchSpy).toHaveBeenCalled();
    const calledInit = fetchSpy.mock.calls[0][1];
    const headers = calledInit?.headers as Record<string, string>;
    expect(headers['X-CSRF-Token']).toBe('active-csrf-token');
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('apiClient does NOT include X-CSRF-Token on safe requests (GET)', async () => {
    document.cookie = 'XSRF-TOKEN=active-csrf-token';

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: [] }),
    } as Response);

    await apiClient('/score/history', { method: 'GET' });

    expect(fetchSpy).toHaveBeenCalled();
    const calledInit = fetchSpy.mock.calls[0][1];
    const headers = (calledInit?.headers ?? {}) as Record<string, string>;
    expect(headers['X-CSRF-Token']).toBeUndefined();
  });

  it('apiClient does NOT require CSRF token for public auth login/register', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    } as Response);

    await apiClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    // Did not make extra fetch to /auth/csrf
    expect(fetchSpy.mock.calls[0][0]).toBe('/api/auth/login');
  });
});
