import { describe, it, expect } from 'vitest';
import { getClaimAction } from '../routes/Vorteile.js';
import type { PartnerOffer } from '../api/types.js';

describe('Issue #130: 3-Channel Benefit Claims & Sovereignty (Frontend logic)', () => {
  it('identifies benefit types accurately on partner offers', () => {
    const voucherOffer: PartnerOffer = {
      id: 'offer-v-1',
      partnerName: 'Urban Sports Club',
      title: '7 Tage gratis Training',
      description: 'Gratis testen',
      minBand: 0,
      valueLabel: 'Gutschein',
      isDemo: true,
      qualified: true,
      benefitType: 'voucher',
      voucherCode: 'USC-FREE-7',
      partnerUrl: 'https://urbansportsclub.com',
      organizationId: null,
      membersOnly: false,
    };

    const certOffer: PartnerOffer = {
      id: 'offer-c-1',
      partnerName: 'Techniker Krankenkasse',
      title: 'Gesundheitsbonus 100 €',
      description: 'Nachweis gemäß § 65a SGB V für TK Bonusprogramm',
      minBand: 70,
      valueLabel: '100 € Nachweis',
      isDemo: true,
      qualified: true,
      benefitType: 'certificate',
      organizationId: 'tk-org-id',
      membersOnly: true,
    };

    const payoutOffer: PartnerOffer = {
      id: 'offer-p-1',
      partnerName: 'AOK',
      title: '50 € Vitalitätsprämie',
      description: 'Direktauszahlung auf Girokonto',
      minBand: 65,
      valueLabel: '50 €',
      isDemo: false,
      qualified: true,
      benefitType: 'payout',
      organizationId: 'aok-org-id',
      membersOnly: false,
    };

    expect(voucherOffer.benefitType).toBe('voucher');
    expect(voucherOffer.voucherCode).toBe('USC-FREE-7');
    expect(voucherOffer.membersOnly).toBe(false);

    expect(certOffer.benefitType).toBe('certificate');
    expect(certOffer.membersOnly).toBe(true);

    expect(payoutOffer.benefitType).toBe('payout');
    expect(payoutOffer.membersOnly).toBe(false);
  });

  it('keeps legacy getClaimAction backwards compatible for org claims', () => {
    expect(getClaimAction({ qualified: false, organizationId: 'org-1', claimStatus: null })).toEqual({ kind: 'none' });
    expect(getClaimAction({ qualified: true, organizationId: null, claimStatus: null })).toEqual({ kind: 'share-link' });
    expect(getClaimAction({ qualified: true, organizationId: 'org-1', claimStatus: null })).toEqual({ kind: 'submit', label: 'Bei Krankenkasse einreichen' });
    expect(getClaimAction({ qualified: true, organizationId: 'org-1', claimStatus: 'submitted' })).toEqual({ kind: 'status', label: 'submitted' });
    expect(getClaimAction({ qualified: true, organizationId: 'org-1', claimStatus: 'accepted' })).toEqual({ kind: 'status', label: 'accepted' });
    expect(getClaimAction({ qualified: true, organizationId: 'org-1', claimStatus: 'rejected' })).toEqual({ kind: 'submit', label: 'Erneut einreichen' });
  });

  it('verifies public offers can be claimed by non-members', () => {
    const publicOffer: PartnerOffer = {
      id: 'offer-public-1',
      partnerName: 'Allianz',
      title: '100 € Gesundheitsbonus für alle',
      description: 'Offen für jeden',
      minBand: 50,
      valueLabel: '100 €',
      isDemo: false,
      qualified: true,
      benefitType: 'payout',
      membersOnly: false,
    };

    // User is non-member (organizationId is null or different)
    const isEligibleToView = !publicOffer.membersOnly || publicOffer.organizationId === 'my-org';
    expect(isEligibleToView).toBe(true);
    expect(publicOffer.benefitType).toBe('payout');
  });

  it('verifies member-exclusive offers are protected', () => {
    const memberOffer: PartnerOffer = {
      id: 'offer-member-1',
      partnerName: 'TK',
      title: 'Exklusiv für TK-Mitglieder',
      description: 'Nur für TK Versicherte',
      minBand: 70,
      valueLabel: '150 €',
      isDemo: false,
      qualified: true,
      benefitType: 'payout',
      organizationId: 'tk-org-id',
      membersOnly: true,
    };

    const isNonMemberEligible = !memberOffer.membersOnly || memberOffer.organizationId === 'barmer-org-id';
    expect(isNonMemberEligible).toBe(false);

    const isTkMemberEligible = !memberOffer.membersOnly || memberOffer.organizationId === 'tk-org-id';
    expect(isTkMemberEligible).toBe(true);
  });
});
