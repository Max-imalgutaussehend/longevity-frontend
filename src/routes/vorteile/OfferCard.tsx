import { Check, ArrowRight, Gift, FileText, Mail } from 'lucide-react';
import { Card, Chip, Btn } from '../../components/ui.js';
import type { PartnerOffer, ScoreResult } from '../../api/types.js';

interface OfferCardProps {
  offer: PartnerOffer;
  score: ScoreResult | undefined;
  onClaimPayout: (offer: PartnerOffer) => void;
  onClaimVoucher: (offer: PartnerOffer) => void;
  onGenerateCertificate: (offer: PartnerOffer) => void;
  onViewClaim: () => void;
}

export function OfferCard({
  offer,
  score,
  onClaimPayout,
  onClaimVoucher,
  onGenerateCertificate,
  onViewClaim,
}: OfferCardProps) {
  const isClaimed = Boolean(offer.claimStatus);
  const isVoucher = offer.benefitType === 'voucher';
  const isCert = offer.benefitType === 'certificate' || (!offer.organizationId && offer.benefitType !== 'voucher');
  const isEmailVoucher = isVoucher && offer.voucherDelivery === 'email';

  return (
    <Card key={offer.id} style={{ opacity: offer.qualified ? 1 : 0.72 }} data-testid={`offer-card-${offer.id}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 15, fontWeight: 500, color: '#22221f' }}>{offer.title}</span>
            {offer.qualified ? (
              <Chip color="green"><Check size={11} style={{ marginRight: 4 }} /> Erfüllt</Chip>
            ) : (
              <Chip color="neutral">Ab Band {offer.minBand}</Chip>
            )}
            {isVoucher && (
              <Chip color="amber">
                {isEmailVoucher ? <Mail size={11} style={{ marginRight: 4 }} /> : <Gift size={11} style={{ marginRight: 4 }} />}
                {isEmailVoucher ? 'Gutschein per E-Mail' : 'Sofort-Gutschein'}
              </Chip>
            )}
            {isCert && <Chip color="teal"><FileText size={11} style={{ marginRight: 4 }} /> § 65a SGB V</Chip>}
            {!offer.membersOnly && <Chip color="neutral">Für alle Versicherten</Chip>}
          </div>

          <div style={{ fontSize: 13, color: '#55544f' }}>{offer.description}</div>
          <div style={{ fontSize: 12, color: '#888780', marginTop: 4 }}>
            {offer.partnerName}
            {offer.minMonths && offer.minMonths > 0 ? ` · Mindesthaltedauer: ${offer.minMonths} Monate` : ''}
          </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: offer.qualified ? '#0f6e56' : '#888780' }}>
            {offer.valueLabel}
          </div>

          <div style={{ marginTop: 8 }}>
            {isClaimed ? (
              isCert ? (
                <Btn
                  small
                  variant="secondary"
                  onClick={() => onGenerateCertificate(offer)}
                  testId={`open-cert-btn-${offer.id}`}
                >
                  <FileText size={12} style={{ marginRight: 4 }} /> Nachweis ausgestellt · PDF ansehen
                </Btn>
              ) : isVoucher && offer.voucherDelivery === 'code_pool' ? (
                <Btn
                  small
                  variant="secondary"
                  onClick={() => onClaimVoucher(offer)}
                  testId={`open-voucher-btn-${offer.id}`}
                >
                  <Gift size={12} style={{ marginRight: 4 }} /> Gutschein anzeigen
                </Btn>
              ) : (
                <button
                  type="button"
                  onClick={onViewClaim}
                  style={{ background: 'none', border: 'none', color: '#0f6e56', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
                  data-testid={`offer-claimed-status-${offer.id}`}
                >
                  {offer.claimStatus === 'accepted'
                    ? 'Genehmigt ✓ Details →'
                    : offer.claimStatus === 'processing'
                    ? 'In Bearbeitung · Details →'
                    : offer.claimStatus === 'rejected'
                    ? 'Abgelehnt · Details →'
                    : 'In Prüfung · Details →'}
                </button>
              )
            ) : offer.qualified ? (
              isVoucher ? (
                <Btn small onClick={() => onClaimVoucher(offer)} testId={`claim-voucher-btn-${offer.id}`}>
                  {isEmailVoucher ? 'Gutschein anfordern' : 'Gutschein einlösen'} <ArrowRight size={12} style={{ marginLeft: 4 }} />
                </Btn>
              ) : isCert ? (
                <Btn small variant="secondary" onClick={() => onGenerateCertificate(offer)} testId={`generate-cert-btn-${offer.id}`}>
                  Kassen-Nachweis (PDF) →
                </Btn>
              ) : (
                <Btn small onClick={() => onClaimPayout(offer)} testId={`claim-payout-btn-${offer.id}`}>
                  Prämie beantragen <ArrowRight size={12} style={{ marginLeft: 4 }} />
                </Btn>
              )
            ) : (
              <span style={{ fontSize: 11, color: '#888780' }}>
                {score ? `Noch ${Math.max(0, offer.minBand - score.score).toFixed(0)} Pkt.` : `Band ${offer.minBand}+`}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
