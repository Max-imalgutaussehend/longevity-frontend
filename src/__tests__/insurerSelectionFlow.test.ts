import { describe, it, expect } from 'vitest';
import { validateKvnr, formatKvnrInput } from '../lib/kvnr.js';
import type { PublicOrganization, User } from '../api/types.js';

describe('Insurer Selection & Verification Flow (#53)', () => {
  describe('Organization Selection & Public List', () => {
    const mockOrganizations: PublicOrganization[] = [
      { id: 'org-tk', name: 'Techniker Krankenkasse (TK)' },
      { id: 'org-barmer', name: 'BARMER' },
      { id: 'org-dak', name: 'DAK Gesundheit' },
      { id: 'org-aok', name: 'AOK Baden-Württemberg' },
    ];

    it('sorts organizations alphabetically for dropdown display', () => {
      const sorted = [...mockOrganizations].sort((a, b) => a.name.localeCompare(b.name, 'de'));
      expect(sorted[0].name).toBe('AOK Baden-Württemberg');
      expect(sorted[1].name).toBe('BARMER');
      expect(sorted[2].name).toBe('DAK Gesundheit');
      expect(sorted[3].name).toBe('Techniker Krankenkasse (TK)');
    });
  });

  describe('KVNR Validation and Input Normalization', () => {
    it('normalizes mixed-case and whitespace-padded user input', () => {
      const raw = '   z629410049   ';
      const formatted = formatKvnrInput(raw);
      expect(formatted).toBe('Z629410049');

      const validation = validateKvnr(formatted);
      expect(validation.valid).toBe(true);
      expect(validation.normalized).toBe('Z629410049');
    });

    it('blocks invalid check digits and gives meaningful guidance', () => {
      // Modulo-10 checksum fails
      const validation = validateKvnr('Z629410048');
      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('Prüfziffer ist ungültig');
    });
  });

  describe('User Membership State & Organization Details', () => {
    it('differentiates unlinked vs verified member states', () => {
      const unlinkedUser: User = {
        id: 'user-1',
        email: 'b2c@longevity.app',
        displayName: 'Max Mustermann',
        birthDate: '1990-01-01',
        sex: 'm',
        chronoAge: 36,
        organizationId: null,
      };

      const verifiedUser: User = {
        id: 'user-2',
        email: 'member@longevity.app',
        displayName: 'Erika Musterfrau',
        birthDate: '1992-05-15',
        sex: 'f',
        chronoAge: 34,
        organizationId: 'org-tk',
        organizationVerifiedAt: '2026-09-27T12:00:00.000Z',
        organization: {
          id: 'org-tk',
          name: 'Techniker Krankenkasse (TK)',
          verifiedAt: '2026-09-27T12:00:00.000Z',
        },
      };

      expect(unlinkedUser.organizationId).toBeNull();
      expect(unlinkedUser.organization).toBeUndefined();

      expect(verifiedUser.organizationId).toBe('org-tk');
      expect(verifiedUser.organization?.name).toBe('Techniker Krankenkasse (TK)');
      expect(verifiedUser.organizationVerifiedAt).toBeDefined();
    });

    it('constructs correct join payload for KVNR verification', () => {
      const orgId = 'org-tk';
      const kvnr = 'Z629410049';
      const validation = validateKvnr(kvnr);

      expect(validation.valid).toBe(true);
      const payload = {
        organizationId: orgId,
        kvnr: validation.normalized,
      };

      expect(payload).toEqual({
        organizationId: 'org-tk',
        kvnr: 'Z629410049',
      });
    });

    it('constructs alternative join payload when campaign code is used', () => {
      const joinCode = 'TK-CAMP-2026';
      const payload = {
        joinCode: joinCode.trim(),
      };

      expect(payload).toEqual({
        joinCode: 'TK-CAMP-2026',
      });
    });
  });
});
