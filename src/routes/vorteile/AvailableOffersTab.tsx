import { ShieldCheck, Building2 } from 'lucide-react';
import { Card, Chip, Skeleton, Btn } from '../../components/ui.js';
import type { PartnerOffer, ScoreResult, User } from '../../api/types.js';
import { OfferCard } from './OfferCard.js';

interface AvailableOffersTabProps {
  offers: PartnerOffer[] | undefined;
  isLoading: boolean;
  score: ScoreResult | undefined;
  user: User | undefined;
  onOpenInsurerModal: () => void;
  onClaimPayout: (offer: PartnerOffer) => void;
  onClaimVoucher: (offer: PartnerOffer) => void;
  onGenerateCertificate: (offer: PartnerOffer) => void;
  onViewClaim: () => void;
}

export function AvailableOffersTab({
  offers,
  isLoading,
  score,
  user,
  onOpenInsurerModal,
  onClaimPayout,
  onClaimVoucher,
  onGenerateCertificate,
  onViewClaim,
}: AvailableOffersTabProps) {
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Card><Skeleton height={80} /></Card>
        <Card><Skeleton height={80} /></Card>
      </div>
    );
  }

  const isInsurerLinked = Boolean(user?.organizationId);
  const qualifiedOffers = offers?.filter((o) => o.qualified) ?? [];
  const nextOffers = offers?.filter((o) => !o.qualified) ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Insurer Banner */}
      {isInsurerLinked ? (
        <div style={{ padding: '12px 18px', borderRadius: 12, background: 'rgba(29,158,117,0.06)', border: '1px solid rgba(29,158,117,0.18)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={16} color="#0f6e56" />
            <span style={{ fontSize: 13, fontWeight: 500, color: '#1d2c25' }}>Versichert bei {user?.organization?.name}</span>
            <Chip color="teal">Verifiziert ✓</Chip>
          </div>
          <button onClick={onOpenInsurerModal} style={{ background: 'none', border: 'none', color: '#0f6e56', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }} data-testid="edit-insurer-btn">
            Ändern / Details →
          </button>
        </div>
      ) : (
        <Card className="glass-deep" style={{ borderLeft: '4px solid #1d9e75', padding: '18px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(29,158,117,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f6e56' }}>
                <Building2 size={20} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#22221f' }}>Krankenkasse verknüpfen</div>
                <div style={{ fontSize: 12, color: '#55544f', marginTop: 2 }}>Verbinde deine Krankenkasse für exklusive Wahltarife und Beitragsnachlässe nach § 65a SGB V.</div>
              </div>
            </div>
            <Btn small variant="primary" onClick={onOpenInsurerModal} testId="connect-insurer-banner-btn">Jetzt verknüpfen</Btn>
          </div>
        </Card>
      )}

      {/* Qualified Offers */}
      {qualifiedOffers.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0f6e56', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            Erfüllt & bereit zur Einlösung ({qualifiedOffers.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {qualifiedOffers.map((o) => (
              <OfferCard
                key={o.id}
                offer={o}
                score={score}
                onClaimPayout={onClaimPayout}
                onClaimVoucher={onClaimVoucher}
                onGenerateCertificate={onGenerateCertificate}
                onViewClaim={onViewClaim}
              />
            ))}
          </div>
        </div>
      )}

      {/* Next Tier Offers */}
      {nextOffers.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            Nächste Prämien-Stufen ({nextOffers.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {nextOffers.map((o) => (
              <OfferCard
                key={o.id}
                offer={o}
                score={score}
                onClaimPayout={onClaimPayout}
                onClaimVoucher={onClaimVoucher}
                onGenerateCertificate={onGenerateCertificate}
                onViewClaim={onViewClaim}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
