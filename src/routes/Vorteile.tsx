import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client.js';
import { PageTitle, Chip } from '../components/ui.js';
import { InsurerSelectModal } from '../components/InsurerSelectModal.js';
import type { ScoreResult, User, PartnerOffer, UserClaim } from '../api/types.js';
import { AvailableOffersTab } from './vorteile/AvailableOffersTab.js';
import { MyClaimsTab } from './vorteile/MyClaimsTab.js';
import { ClaimModal } from './vorteile/ClaimModal.js';
import { VoucherRevealModal } from './vorteile/VoucherRevealModal.js';
import { VoucherEmailModal } from './vorteile/VoucherEmailModal.js';
import { CertificateWizardModal } from './vorteile/CertificateWizardModal.js';
import { ReceiptModal } from './vorteile/ReceiptModal.js';
import { calculatePointsGap, getClaimAction, type ClaimAction } from './vorteile/vorteileHelpers.js';

export { calculatePointsGap, getClaimAction, type ClaimAction };

export function Component() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<'available' | 'my-claims'>('available');
  const [showInsurerModal, setShowInsurerModal] = useState(false);

  const [payoutOffer, setPayoutOffer] = useState<PartnerOffer | null>(null);
  const [voucherModal, setVoucherModal] = useState<{ offer: PartnerOffer; code: string } | null>(null);
  const [emailVoucherOffer, setEmailVoucherOffer] = useState<PartnerOffer | null>(null);
  const [certOffer, setCertOffer] = useState<{ offer: PartnerOffer; claimId?: string | null; tokenId?: string | null } | null>(null);
  const [receiptClaimId, setReceiptClaimId] = useState<string | null>(null);

  const { data: user } = useQuery<User>({ queryKey: ['me'], queryFn: () => apiClient<User>('/me') });
  const { data: offers, isLoading: offersLoading } = useQuery<PartnerOffer[]>({ queryKey: ['offers'], queryFn: () => apiClient<PartnerOffer[]>('/offers') });
  const { data: score } = useQuery<ScoreResult>({ queryKey: ['score', 'current'], queryFn: () => apiClient<ScoreResult>('/score/current') });
  const { data: myClaims } = useQuery<UserClaim[]>({ queryKey: ['my-claims'], queryFn: () => apiClient<UserClaim[]>('/me/claims') });

  const claimVoucherMut = useMutation({
    mutationFn: (offer: PartnerOffer) => apiClient<{ id: string; rewardPayload?: { voucherCode?: string } }>(`/offers/${offer.id}/claim`, { method: 'POST', body: JSON.stringify({ payoutMethod: 'voucher' }) }),
    onSuccess: (res, offer) => {
      qc.invalidateQueries({ queryKey: ['offers'] });
      qc.invalidateQueries({ queryKey: ['my-claims'] });
      setVoucherModal({ offer, code: res.rewardPayload?.voucherCode || offer.voucherCode || 'VOUCHER' });
    },
  });

  const claimEmailVoucherMut = useMutation({
    mutationFn: ({ offer, contactEmail }: { offer: PartnerOffer; contactEmail: string }) =>
      apiClient(`/offers/${offer.id}/claim`, { method: 'POST', body: JSON.stringify({ payoutMethod: 'voucher', contactEmail }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['offers'] });
      qc.invalidateQueries({ queryKey: ['my-claims'] });
      setEmailVoucherOffer(null);
      setActiveTab('my-claims');
    },
  });

  const claimCertMut = useMutation({
    mutationFn: (offer: PartnerOffer) => apiClient<{ id: string; shareTokenId?: string }>(`/offers/${offer.id}/claim`, { method: 'POST', body: JSON.stringify({ payoutMethod: 'self_submitted' }) }),
    onSuccess: (res, offer) => {
      qc.invalidateQueries({ queryKey: ['offers'] });
      qc.invalidateQueries({ queryKey: ['my-claims'] });
      setCertOffer({ offer, claimId: res.id, tokenId: res.shareTokenId });
    },
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <PageTitle title="Vorteile & Prämien" />
        {score && <Chip color="teal">Dein Score: Band {score.band.low}–{score.band.high}</Chip>}
      </div>

      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: 10 }}>
        <button
          type="button"
          onClick={() => setActiveTab('available')}
          style={{
            padding: '8px 16px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
            background: activeTab === 'available' ? 'linear-gradient(135deg, #1d9e75 0%, #0f6e56 100%)' : 'rgba(0,0,0,0.04)',
            color: activeTab === 'available' ? '#fff' : '#55544f',
          }}
          data-testid="tab-available-offers"
        >
          Verfügbare Vorteile ({offers?.length ?? 0})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('my-claims')}
          style={{
            padding: '8px 16px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
            background: activeTab === 'my-claims' ? 'linear-gradient(135deg, #1d9e75 0%, #0f6e56 100%)' : 'rgba(0,0,0,0.04)',
            color: activeTab === 'my-claims' ? '#fff' : '#55544f',
          }}
          data-testid="tab-my-claims"
        >
          Meine Prämien & Nachweise ({myClaims?.length ?? 0})
        </button>
      </div>

      {activeTab === 'available' ? (
        <AvailableOffersTab
          offers={offers}
          isLoading={offersLoading}
          score={score}
          user={user}
          onOpenInsurerModal={() => setShowInsurerModal(true)}
          onClaimPayout={(o) => setPayoutOffer(o)}
          onClaimVoucher={(o) => (o.voucherDelivery === 'email' ? setEmailVoucherOffer(o) : claimVoucherMut.mutate(o))}
          onGenerateCertificate={(o) => claimCertMut.mutate(o)}
          onViewClaim={() => setActiveTab('my-claims')}
        />
      ) : (
        <MyClaimsTab
          onOpenReceipt={(id) => setReceiptClaimId(id)}
          onOpenVoucher={(claim) => setVoucherModal({ offer: claim.offer as unknown as PartnerOffer, code: (claim.rewardPayload as { voucherCode?: string })?.voucherCode || 'VOUCHER' })}
          onOpenCertificate={(claim) => setCertOffer({ offer: claim.offer as unknown as PartnerOffer, claimId: claim.id, tokenId: claim.shareTokenId })}
        />
      )}

      {payoutOffer && <ClaimModal isOpen={Boolean(payoutOffer)} onClose={() => setPayoutOffer(null)} offer={payoutOffer} user={user} onSuccess={() => setActiveTab('my-claims')} />}
      {voucherModal && <VoucherRevealModal isOpen={Boolean(voucherModal)} onClose={() => setVoucherModal(null)} offer={voucherModal.offer} voucherCode={voucherModal.code} />}
      {emailVoucherOffer && (
        <VoucherEmailModal
          isOpen={Boolean(emailVoucherOffer)}
          onClose={() => setEmailVoucherOffer(null)}
          offer={emailVoucherOffer}
          defaultEmail={user?.email || ''}
          onSubmit={(email) => claimEmailVoucherMut.mutate({ offer: emailVoucherOffer, contactEmail: email })}
          isPending={claimEmailVoucherMut.isPending}
        />
      )}
      {certOffer && <CertificateWizardModal isOpen={Boolean(certOffer)} onClose={() => setCertOffer(null)} offer={certOffer.offer} claimId={certOffer.claimId} verifyTokenId={certOffer.tokenId} />}
      {receiptClaimId && <ReceiptModal isOpen={Boolean(receiptClaimId)} onClose={() => setReceiptClaimId(null)} claimId={receiptClaimId} />}
      <InsurerSelectModal isOpen={showInsurerModal} onClose={() => setShowInsurerModal(false)} />
    </div>
  );
}

export { Component as Vorteile };
export default Component;
