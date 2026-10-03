import { Card, PageTitle, Btn, Chip, Skeleton } from '../../components/ui.js';
import type { InsurerClaim } from '../../api/types.js';

interface InsurerClaimsSectionProps {
  claims: InsurerClaim[] | undefined;
  claimsLoading: boolean;
  onDecide: (claim: InsurerClaim, decision: 'accepted' | 'rejected') => void;
}

export function InsurerClaimsSection({ claims, claimsLoading, onDecide }: InsurerClaimsSectionProps) {
  return (
    <div style={{ marginTop: 40 }}>
      <PageTitle title="Eingereichte Nachweise & Prämien-Anträge" sub="Offene Anträge prüfen und Auszahlungen autorisieren" />
      {claimsLoading ? <Skeleton height={100} /> : claims && claims.length > 0 ? (
        <div style={{ display: 'grid', gap: 12 }}>
          {claims.map((c) => (
            <Card key={c.id} style={{ padding: 20 }} data-testid={`claim-row-${c.id}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#22221f' }}>{c.offerTitle}</span>
                    {c.status === 'submitted' && <Chip color="amber">In Prüfung</Chip>}
                    {c.status === 'accepted' && <Chip color="green">Genehmigt</Chip>}
                    {c.status === 'rejected' && <Chip color="red">Abgelehnt</Chip>}
                    {c.payoutMethod && <Chip color="teal">{c.payoutMethod === 'bank_transfer' ? 'Girokonto' : c.payoutMethod === 'contribution_offset' ? 'Beitragsverrechnung' : c.payoutMethod}</Chip>}
                  </div>
                  <div style={{ fontSize: 13, color: '#55544f' }}>
                    {c.userDisplayName ?? c.userEmail} · Band {c.bandLow}–{c.bandHigh}
                  </div>
                  {c.payoutIbanMasked && (
                    <div style={{ fontSize: 12, color: '#0f6e56', marginTop: 4 }}>
                      Auszahlung an: {c.payoutAccountHolder || 'Mitglied'} · <code>{c.payoutIbanMasked}</code>
                    </div>
                  )}
                </div>
                {c.status === 'submitted' && (
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <Btn small variant="secondary" onClick={() => onDecide(c, 'rejected')} testId={`claim-reject-${c.id}`}>Ablehnen</Btn>
                    <Btn small onClick={() => onDecide(c, 'accepted')} testId={`claim-accept-${c.id}`}>Annehmen</Btn>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : <p style={{ fontSize: 13, color: '#888780' }}>Noch keine Nachweise eingereicht.</p>}
    </div>
  );
}
