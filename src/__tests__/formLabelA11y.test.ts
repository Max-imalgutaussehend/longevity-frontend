import { describe, it, expect, vi } from 'vitest';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FieldLabel, GlassInput, GlassSelect } from '../components/ui.js';
import { Component as LoginComponent } from '../routes/Login.js';
import { Component as RegisterComponent } from '../routes/Register.js';
import { Component as ForgotPasswordComponent } from '../routes/ForgotPassword.js';
import { Component as ResetPasswordComponent } from '../routes/ResetPassword.js';
import { InsurerSelectModal } from '../components/InsurerSelectModal.js';

// Mock matchMedia for jsdom / SSR
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe('Form Label Accessibility & Autocomplete (#101)', () => {
  describe('UI Primitives (FieldLabel & GlassInput & GlassSelect)', () => {
    it('FieldLabel renders label with htmlFor attribute', () => {
      const html = renderToString(createElement(FieldLabel, { htmlFor: 'test-input-id', children: 'Test Label' }));
      expect(html).toContain('for="test-input-id"');
      expect(html).toContain('Test Label');
    });

    it('GlassInput renders id and autoComplete attributes', () => {
      const html = renderToString(
        createElement(GlassInput, {
          id: 'test-email',
          type: 'email',
          autoComplete: 'email',
          placeholder: 'name@test.de',
        })
      ).toLowerCase();
      expect(html).toContain('id="test-email"');
      expect(html).toContain('autocomplete="email"');
      expect(html).toContain('type="email"');
    });

    it('GlassSelect renders id attribute', () => {
      const html = renderToString(
        createElement(GlassSelect, {
          id: 'test-select',
          options: [{ value: 'a', label: 'Option A' }],
        })
      );
      expect(html).toContain('id="test-select"');
    });
  });

  describe('Auth Screens label associations and autocomplete attributes', () => {
    it('Login screen associates labels and has email & current-password autocomplete', () => {
      const rawHtml = renderToString(
        createElement(
          MemoryRouter,
          null,
          createElement(LoginComponent)
        )
      );
      const html = rawHtml.toLowerCase();

      // Email
      expect(html).toContain('for="login-email"');
      expect(html).toContain('id="login-email"');
      expect(html).toContain('autocomplete="email"');

      // Password
      expect(html).toContain('for="login-password"');
      expect(html).toContain('id="login-password"');
      expect(html).toContain('autocomplete="current-password"');
    });

    it('Register screen associates labels and has email, new-password, and bday autocomplete', () => {
      const rawHtml = renderToString(
        createElement(
          MemoryRouter,
          null,
          createElement(RegisterComponent)
        )
      );
      const html = rawHtml.toLowerCase();

      // Email
      expect(html).toContain('for="register-email"');
      expect(html).toContain('id="register-email"');
      expect(html).toContain('autocomplete="email"');

      // Password
      expect(html).toContain('for="register-password"');
      expect(html).toContain('id="register-password"');
      expect(html).toContain('autocomplete="new-password"');

      // Password confirmation
      expect(html).toContain('for="register-password-confirm"');
      expect(html).toContain('id="register-password-confirm"');

      // Birthdate
      expect(html).toContain('for="register-birthdate"');
      expect(html).toContain('id="register-birthdate"');
      expect(html).toContain('autocomplete="bday"');
    });

    it('ForgotPassword screen associates label and has email autocomplete', () => {
      const rawHtml = renderToString(
        createElement(
          MemoryRouter,
          null,
          createElement(ForgotPasswordComponent)
        )
      );
      const html = rawHtml.toLowerCase();

      expect(html).toContain('for="forgot-password-email"');
      expect(html).toContain('id="forgot-password-email"');
      expect(html).toContain('autocomplete="email"');
    });

    it('ResetPassword screen associates labels and has new-password autocomplete', () => {
      const rawHtml = renderToString(
        createElement(
          MemoryRouter,
          null,
          createElement(ResetPasswordComponent)
        )
      );
      const html = rawHtml.toLowerCase();

      expect(html).toContain('for="reset-password-input"');
      expect(html).toContain('id="reset-password-input"');
      expect(html).toContain('autocomplete="new-password"');

      expect(html).toContain('for="reset-password-confirm"');
      expect(html).toContain('id="reset-password-confirm"');
    });
  });

  describe('InsurerSelectModal label associations', () => {
    it('associates KVNR and dropdown labels with inputs', () => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });

      const html = renderToString(
        createElement(
          QueryClientProvider,
          { client: queryClient },
          createElement(InsurerSelectModal, { isOpen: true, onClose: () => {} })
        )
      );

      // Select dropdown
      expect(html).toContain('for="insurer-select-dropdown"');
      expect(html).toContain('id="insurer-select-dropdown"');

      // KVNR input
      expect(html).toContain('for="kvnr-input"');
      expect(html).toContain('id="kvnr-input"');
    });
  });
});
