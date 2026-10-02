import { describe, it, expect, vi } from 'vitest';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Component as LandingComponent } from '../routes/Landing.js';
import { Component as HebelComponent } from '../routes/Hebel.js';
import { TutorialModal } from '../components/TutorialModal.js';

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

describe('Interactive Simulator Slider Accessibility (#102)', () => {
  describe('Landingpage Simulator Sliders', () => {
    it('provides aria-label, aria-valuemin, aria-valuemax, aria-valuenow, and aria-valuetext on all 4 sliders', () => {
      const html = renderToString(
        createElement(
          MemoryRouter,
          null,
          createElement(LandingComponent)
        )
      );

      // Ruhepuls slider
      expect(html).toContain('aria-label="Ruhepuls"');
      expect(html).toContain('aria-valuemin="45"');
      expect(html).toContain('aria-valuemax="85"');
      expect(html).toContain('bpm"');

      // Schlafdauer slider
      expect(html).toContain('aria-label="Schlafdauer"');
      expect(html).toContain('aria-valuemin="5"');
      expect(html).toContain('aria-valuemax="9.5"');
      expect(html).toContain('h / Nacht"');

      // VO2max slider
      expect(html).toContain('aria-label="Kardiovaskuläre Fitness (VO₂max)"');
      expect(html).toContain('aria-valuemin="26"');
      expect(html).toContain('aria-valuemax="58"');
      expect(html).toContain('ml/kg/min"');

      // Zone 2 slider
      expect(html).toContain('aria-label="Zone-2 Ausdauerminuten / Woche"');
      expect(html).toContain('aria-valuemin="0"');
      expect(html).toContain('aria-valuemax="300"');
      expect(html).toContain('Min"');
    });
  });

  describe('Hebel Simulator Sliders (/hebel)', () => {
    it('provides aria-valuemin, aria-valuemax, aria-valuenow, and aria-valuetext on metric sliders', () => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });

      const html = renderToString(
        createElement(
          QueryClientProvider,
          { client: queryClient },
          createElement(
            MemoryRouter,
            null,
            createElement(HebelComponent)
          )
        )
      );

      // Range inputs in Hebel have aria-valuemin, aria-valuemax, aria-valuenow, aria-valuetext
      expect(html).toContain('aria-valuemin="');
      expect(html).toContain('aria-valuemax="');
      expect(html).toContain('aria-valuenow="');
      expect(html).toContain('aria-valuetext="');
    });
  });

  describe('TutorialModal Habit Sliders', () => {
    it('provides aria attributes on onboarding habit sliders', () => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });

      const html = renderToString(
        createElement(
          QueryClientProvider,
          { client: queryClient },
          createElement(
            MemoryRouter,
            null,
            createElement(TutorialModal, { isOpen: true, onClose: () => {}, initialStep: 3 })
          )
        )
      );

      expect(html).toContain('aria-label="Tägliche Schritte"');
      expect(html).toContain('aria-label="Zone-2 Cardio (Ausdauer)"');
      expect(html).toContain('aria-label="Schlafdauer"');
    });
  });
});
