import { describe, it, expect } from 'vitest';
import { parseTokenInput } from '../routes/Verify.js';
import { routes } from '../routesConfig.js';

describe('Public Token Verification & Search Mask (#77)', () => {
  describe('parseTokenInput()', () => {
    it('extracts token ID from plain strings with trimming', () => {
      expect(parseTokenInput('demo-token')).toBe('demo-token');
      expect(parseTokenInput('  abc-123-xyz  ')).toBe('abc-123-xyz');
      expect(parseTokenInput('')).toBe('');
    });

    it('extracts token ID from full URLs or paths', () => {
      expect(parseTokenInput('https://longevity.maxrommel.de/verify/demo-token')).toBe('demo-token');
      expect(parseTokenInput('http://localhost:5173/verify/token-uuid-456')).toBe('token-uuid-456');
      expect(parseTokenInput('/verify/some-share-token')).toBe('some-share-token');
      expect(parseTokenInput('https://example.com/verify/token-with-query?foo=bar#baz')).toBe('token-with-query');
    });
  });

  describe('Route Configuration', () => {
    it('registers both /verify and /verify/:id routes', () => {
      const verifyPath = routes.find((r) => r.path === '/verify');
      const verifyIdPath = routes.find((r) => r.path === '/verify/:id');

      expect(verifyPath).toBeDefined();
      expect(verifyIdPath).toBeDefined();
    });
  });
});
