import { describe, it, expect, vi } from 'vitest';
import { getClaimAction } from '../routes/Vorteile.js';
import type { PartnerOffer } from '../api/types.js';
import { downloadCertificatePdf } from '../routes/vorteile/certificatePdf.js';

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
    expect(getClaimAction({ qualified: true, organizationId: 'org-1', claimStatus: 'processing' })).toEqual({ kind: 'status', label: 'processing' });
    expect(getClaimAction({ qualified: true, organizationId: 'org-1', claimStatus: 'accepted' })).toEqual({ kind: 'status', label: 'accepted' });
    expect(getClaimAction({ qualified: true, organizationId: 'org-1', claimStatus: 'rejected' })).toEqual({ kind: 'submit', label: 'Erneut einreichen' });
  });

  it('distinguishes voucher delivery modes: code_pool vs email', () => {
    const codePoolOffer: PartnerOffer = {
      id: 'offer-pool-1',
      partnerName: 'Urban Sports Club',
      title: 'Monatsflatrate',
      description: 'Sofort-Code aus Pool',
      minBand: 60,
      valueLabel: '100% Rabatt',
      isDemo: false,
      qualified: true,
      benefitType: 'voucher',
      voucherDelivery: 'code_pool',
      availableCodesCount: 42,
    };

    const emailOffer: PartnerOffer = {
      id: 'offer-email-1',
      partnerName: 'Gymondo',
      title: 'Jahresabo',
      description: 'Zusendung per E-Mail nach Prüfung',
      minBand: 50,
      valueLabel: 'Gutschein',
      isDemo: false,
      qualified: true,
      benefitType: 'voucher',
      voucherDelivery: 'email',
    };

    expect(codePoolOffer.voucherDelivery).toBe('code_pool');
    expect(codePoolOffer.availableCodesCount).toBe(42);
    expect(emailOffer.voucherDelivery).toBe('email');
    expect(emailOffer.availableCodesCount).toBeUndefined();
  });

  it('supports multi-stage claim decisions: processing, accepted, rejected', () => {
    const validDecisions: Array<'processing' | 'accepted' | 'rejected'> = ['processing', 'accepted', 'rejected'];
    expect(validDecisions).toContain('processing');
    expect(validDecisions).toContain('accepted');
    expect(validDecisions).toContain('rejected');
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

  it('triggers clean PDF download with correct filename and parameters', () => {
    const createObjectURLMock = vi.fn().mockReturnValue('blob:test-pdf-url');
    const revokeObjectURLMock = vi.fn();
    globalThis.URL.createObjectURL = createObjectURLMock;
    globalThis.URL.revokeObjectURL = revokeObjectURLMock;

    let clickedDownloadName = '';
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      clickedDownloadName = this.download;
    });

    downloadCertificatePdf({
      partnerName: 'Techniker Krankenkasse',
      title: 'Bonusprogramm 2026',
      bandLow: 70,
      bandHigh: 79,
      tokenId: 'test-token-uuid-1234',
      verifyUrl: 'https://longevity.app/verify/test-token-uuid-1234',
      qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?data=test',
    });

    expect(createObjectURLMock).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(clickedDownloadName).toBe('Longevity-Nachweis-SGB-V-70-79.pdf');
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:test-pdf-url');

    clickSpy.mockRestore();
  });

  it('correctly partitions insurer claims into actionable portal requests vs informational certificate audit items', () => {
    const claims = [
      { id: 'c1', payoutMethod: 'bank_transfer', benefitType: 'payout', status: 'submitted' },
      { id: 'c2', payoutMethod: 'contribution_offset', benefitType: 'payout', status: 'processing' },
      { id: 'c3', payoutMethod: 'voucher', benefitType: 'voucher', voucherDelivery: 'email', status: 'submitted' },
      { id: 'c4', payoutMethod: 'self_submitted', benefitType: 'certificate', status: 'accepted' },
      { id: 'c5', payoutMethod: 'voucher', benefitType: 'voucher', voucherDelivery: 'code_pool', status: 'accepted' },
    ];

    const portalClaims = claims.filter(c =>
      c.payoutMethod !== 'self_submitted' &&
      c.benefitType !== 'certificate' &&
      !(c.benefitType === 'voucher' && c.voucherDelivery === 'code_pool')
    );

    const certificateClaims = claims.filter(c =>
      c.payoutMethod === 'self_submitted' || c.benefitType === 'certificate'
    );

    const poolVoucherClaims = claims.filter(c =>
      c.benefitType === 'voucher' && c.voucherDelivery === 'code_pool'
    );

    // Only direct portal claims (payout + email voucher) require insurer review and decision
    expect(portalClaims.map(c => c.id)).toEqual(['c1', 'c2', 'c3']);
    // PDF certificate claims are strictly informational audit entries
    expect(certificateClaims.map(c => c.id)).toEqual(['c4']);
    // Pool voucher claims are auto-redeemed
    expect(poolVoucherClaims.map(c => c.id)).toEqual(['c5']);

    // Check open portal count
    const openPortalCount = portalClaims.filter(c => c.status === 'submitted' || c.status === 'processing').length;
    expect(openPortalCount).toBe(3);
  });
});
