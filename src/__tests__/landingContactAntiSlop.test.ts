import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { CONTACT_REASONS } from '../routes/landing/landingTypes.js';
import { LandingTeamAndContact } from '../routes/landing/LandingTeamAndContact.js';

describe('Landing Contact Form Anti-AI & Anti-Slop Refactor (#117)', () => {
  describe('CONTACT_REASONS configuration', () => {
    it('defines exactly the 4 expected topics without emojis or AI-slop badges', () => {
      const ids = CONTACT_REASONS.map((r) => r.id);
      expect(ids).toEqual(['insurer', 'feedback', 'research', 'general']);

      // Emoji detection regex
      const emojiRegex = /\p{Extended_Pictographic}/u;
      for (const reason of CONTACT_REASONS) {
        expect(reason.label).not.toMatch(emojiRegex);
        expect(reason.label.trim().length).toBeGreaterThan(0);
        expect(reason.subject).not.toMatch(emojiRegex);
      }
    });

    it('requires company field only for insurer inquiries', () => {
      const insurer = CONTACT_REASONS.find((r) => r.id === 'insurer');
      expect(insurer?.companyRequired).toBe(true);

      const feedback = CONTACT_REASONS.find((r) => r.id === 'feedback');
      expect(feedback?.companyRequired).toBe(false);

      const research = CONTACT_REASONS.find((r) => r.id === 'research');
      expect(research?.companyRequired).toBe(false);

      const general = CONTACT_REASONS.find((r) => r.id === 'general');
      expect(general?.companyRequired).toBe(false);
    });
  });

  describe('LandingTeamAndContact UI Component', () => {
    it('renders clean header, form controls, and no fake live badges or pulse dots', () => {
      const html = renderToString(
        createElement(LandingTeamAndContact, {
          selectedReasonId: 'insurer',
          onSelectReasonId: () => {},
        })
      );

      // Clean header
      expect(html).toContain('Nachricht an das Team');
      expect(html).not.toContain('Kontaktformular &amp; Direktanfrage');
      expect(html).not.toContain('Team erreichbar');
      expect(html).not.toContain('pulse-emerald-dot');

      // Semantic form controls & a11y bindings
      expect(html).toContain('for="contact-reason"');
      expect(html).toContain('id="contact-reason"');
      expect(html).toContain('for="contact-company"');
      expect(html).toContain('id="contact-company"');
      expect(html).toContain('for="contact-name"');
      expect(html).toContain('id="contact-name"');
      expect(html).toContain('for="contact-email"');
      expect(html).toContain('id="contact-email"');
      expect(html).toContain('for="contact-message"');
      expect(html).toContain('id="contact-message"');

      // Autocomplete attributes
      expect(html).toContain('autoComplete="name"');
      expect(html).toContain('autoComplete="email"');

      // Clean mailto link without nested button launcher conflict
      expect(html).toContain('href="mailto:kontakt@longevity.app?subject=');
      expect(html).not.toContain('Mail öffnen');
      expect(html).not.toContain('Kopieren');

      // Submit button text for insurer
      expect(html).toContain('Anfrage senden');
      expect(html).not.toContain('Wird übermittelt');
    });

    it('renders general submit button text when general reason is selected', () => {
      const html = renderToString(
        createElement(LandingTeamAndContact, {
          selectedReasonId: 'feedback',
          onSelectReasonId: () => {},
        })
      );

      expect(html).toContain('Nachricht senden');
      expect(html).not.toContain('Anfrage senden');
    });
  });

  describe('CSS Tokens cleanup', () => {
    it('verifies pulse-emerald-dot and unused chip classes were removed from tokens.css', async () => {
      // @ts-expect-error node built-in
      const { readFileSync } = await import('node:fs');
      // @ts-expect-error node built-in
      const { resolve } = await import('node:path');
      // @ts-expect-error node process in test
      const rootDir = process.cwd();
      const css = readFileSync(resolve(rootDir, 'src/styles/tokens.css'), 'utf-8');

      expect(css).not.toContain('pulse-emerald-dot');
      expect(css).not.toContain('.team-topic-chip');
      expect(css).not.toContain('.team-email-badge');
    });
  });
});
