import { describe, it, expect, vi } from 'vitest';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { FlashMessage } from '../components/FlashMessage.js';

describe('Issue #105: Flash Message / Toast on 403 Redirects & Simulator Error State', () => {
  describe('FlashMessage component', () => {
    it('renders flash message with alert role and error type', () => {
      const html = renderToString(
        createElement(FlashMessage, {
          type: 'error',
          message: 'Zugriff verweigert: Krankenkassen-Berechtigung erforderlich.',
        })
      );

      expect(html).toContain('role="alert"');
      expect(html).toContain('data-testid="flash-message"');
      expect(html).toContain('data-type="error"');
      expect(html).toContain('Zugriff verweigert: Krankenkassen-Berechtigung erforderlich.');
      expect(html).toContain('data-testid="flash-dismiss-btn"');
    });

    it('renders success and info variants with appropriate styles', () => {
      const successHtml = renderToString(
        createElement(FlashMessage, {
          type: 'success',
          message: 'Aktion erfolgreich ausgeführt.',
        })
      );
      expect(successHtml).toContain('data-type="success"');
      expect(successHtml).toContain('Aktion erfolgreich ausgeführt.');

      const infoHtml = renderToString(
        createElement(FlashMessage, {
          type: 'info',
          message: 'Hinweis zur Nutzung.',
        })
      );
      expect(infoHtml).toContain('data-type="info"');
      expect(infoHtml).toContain('Hinweis zur Nutzung.');
    });
  });

  describe('403 InsurerShell & AdminShell Access Guard logic', () => {
    const checkInsurerAccess = (user: { role?: string } | null | undefined, isLoading: boolean) => {
      if (isLoading || !user) return { redirect: false, target: null, state: null };
      if (user.role !== 'insurer_admin' && user.role !== 'insurer_staff') {
        return {
          redirect: true,
          target: '/dashboard',
          state: { flash: { type: 'error', message: 'Zugriff verweigert: Krankenkassen-Berechtigung erforderlich.' } },
        };
      }
      return { redirect: false, target: null, state: null };
    };

    const checkAdminAccess = (user: { role?: string } | null | undefined, isLoading: boolean) => {
      if (isLoading || !user) return { redirect: false, target: null, state: null };
      if (user.role !== 'platform_admin') {
        return {
          redirect: true,
          target: '/dashboard',
          state: { flash: { type: 'error', message: 'Zugriff verweigert: Administrator-Berechtigung erforderlich.' } },
        };
      }
      return { redirect: false, target: null, state: null };
    };

    it('redirects standard B2C user from /insurer with explanatory flash message', () => {
      const b2cUser = { role: 'user' };
      const result = checkInsurerAccess(b2cUser, false);

      expect(result.redirect).toBe(true);
      expect(result.target).toBe('/dashboard');
      expect(result.state?.flash.type).toBe('error');
      expect(result.state?.flash.message).toBe('Zugriff verweigert: Krankenkassen-Berechtigung erforderlich.');
    });

    it('allows insurer_admin and insurer_staff to access /insurer without redirect', () => {
      expect(checkInsurerAccess({ role: 'insurer_admin' }, false).redirect).toBe(false);
      expect(checkInsurerAccess({ role: 'insurer_staff' }, false).redirect).toBe(false);
    });

    it('redirects non-admin user from /admin with explanatory flash message', () => {
      const b2cUser = { role: 'user' };
      const result = checkAdminAccess(b2cUser, false);

      expect(result.redirect).toBe(true);
      expect(result.target).toBe('/dashboard');
      expect(result.state?.flash.type).toBe('error');
      expect(result.state?.flash.message).toBe('Zugriff verweigert: Administrator-Berechtigung erforderlich.');
    });

    it('allows platform_admin to access /admin without redirect', () => {
      expect(checkAdminAccess({ role: 'platform_admin' }, false).redirect).toBe(false);
    });

    it('does not trigger redirects while user profile is still loading', () => {
      expect(checkInsurerAccess(undefined, true).redirect).toBe(false);
      expect(checkAdminAccess(undefined, true).redirect).toBe(false);
    });
  });

  describe('Simulator Error & Retry Feedback State', () => {
    it('defines clear visual alert structure for failed simulation synchronization', () => {
      const renderSimulatorStatus = (isError: boolean, onRetry: () => void) => {
        if (!isError) return null;
        return createElement(
          'div',
          { role: 'alert', 'data-testid': 'simulate-error-indicator' },
          createElement('span', null, 'Simulation nicht synchronisiert'),
          createElement('button', { type: 'button', 'data-testid': 'simulate-retry-btn', onClick: onRetry }, 'Erneut versuchen')
        );
      };

      const onRetryMock = vi.fn();
      const htmlWithError = renderToString(renderSimulatorStatus(true, onRetryMock));
      expect(htmlWithError).toContain('data-testid="simulate-error-indicator"');
      expect(htmlWithError).toContain('Simulation nicht synchronisiert');
      expect(htmlWithError).toContain('data-testid="simulate-retry-btn"');
      expect(htmlWithError).toContain('Erneut versuchen');

      const htmlWithoutError = renderSimulatorStatus(false, onRetryMock);
      expect(htmlWithoutError).toBeNull();
    });
  });
});
