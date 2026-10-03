import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, Gift, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { apiClient } from '../../api/client.js';
import { Card, Chip, Skeleton, Btn } from '../../components/ui.js';
import type { UserClaim } from '../../api/types.js';

interface MyClaimsTabProps {
  onOpenReceipt: (claimId: string) => void;
  onOpenVoucher: (claim: UserClaim) => void;
  onOpenCertificate: (claim: UserClaim) => void;
}

export function MyClaimsTab({ onOpenReceipt, onOpenVoucher, onOpenCertificate }: MyClaimsTabProps) {
  const { data: claims, isLoading } = useQuery<UserClaim[]>({
    queryKey: ['my-claims'],
    queryFn: () => apiClient<UserClaim[]>('/me/claims'),
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Card><Skeleton height={80} /></Card>
        <Card><Skeleton height={80} /></Card>
      </div>
    );
  }

  if (!claims || claims.length === 0) {
    return (
      <Card style={{ textAlign: 'center', padding: '36px 24px' }}>
        <FileText size={32} color="#888780" style={{ margin: '0 auto 12px' }} />
        <div style={{ fontSize: 15, fontWeight: 500, color: '#22221f' }}>Noch keine Prämien oder Nachweise beantragt</div>
        <p style={{ fontSize: 13, color: '#888780', maxWidth: 420, margin: '8px auto 0' }}>
          Sobald du dich für einen Vorteil qualifizierst und die Prämie anforderst, kannst du den Bearbeitungs- und Auszahlungsstatus hier verfolgen.
        </p>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {claims.map((claim) => {
        const isPayout = claim.payoutMethod === 'bank_transfer' || claim.payoutMethod === 'contribution_offset';
        const isVoucher = claim.payoutMethod === 'voucher' || claim.offer?.benefitType === 'voucher';
        const isCertificate = claim.payoutMethod === 'self_submitted' || claim.offer?.benefitType === 'certificate';
        const voucherPayload = claim.rewardPayload as { voucherCode?: string } | null;
        const hasCode = Boolean(voucherPayload?.voucherCode);

        return (
          <Card key={claim.id} data-testid={`my-claim-row-${claim.id}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 15, fontWeight: 500, color: '#22221f' }}>{claim.offer?.title}</span>
                  {isCertificate ? (
                    claim.selfSubmittedAt ? (
                      <Chip color="green"><CheckCircle2 size={11} style={{ marginRight: 4 }} /> In Kassen-App eingereicht</Chip>
                    ) : (
                      <Chip color="teal"><ShieldCheck size={11} style={{ marginRight: 4 }} /> PDF ausgestellt</Chip>
                    )
                  ) : (
                    <>
                      {claim.status === 'submitted' && <Chip color="amber"><Clock size={11} style={{ marginRight: 4 }} /> Eingegangen</Chip>}
                      {claim.status === 'processing' && <Chip color="teal"><Clock size={11} style={{ marginRight: 4 }} /> In Bearbeitung</Chip>}
                      {claim.status === 'accepted' && <Chip color="green"><CheckCircle2 size={11} style={{ marginRight: 4 }} /> Genehmigt</Chip>}
                      {claim.status === 'rejected' && <Chip color="red"><AlertCircle size={11} style={{ marginRight: 4 }} /> Abgelehnt</Chip>}
                    </>
                  )}
                  <Chip color="neutral">Band {claim.bandLow}–{claim.bandHigh}</Chip>
                </div>

                <div style={{ fontSize: 13, color: '#55544f' }}>
                  {claim.offer?.partnerName} · <strong style={{ color: '#0f6e56' }}>{claim.offer?.valueLabel}</strong>
                </div>

                <div style={{ fontSize: 12, color: '#888780', marginTop: 6 }}>
                  {isCertificate ? `Ausgestellt am ${new Date(claim.submittedAt).toLocaleDateString('de-DE')}` : `Eingereicht am ${new Date(claim.submittedAt).toLocaleDateString('de-DE')}`}
                  {claim.decidedAt && !isCertificate && ` · Aktualisiert am ${new Date(claim.decidedAt).toLocaleDateString('de-DE')}`}
                  {claim.rewardPayload?.transactionRef && ` · Vorgang: ${claim.rewardPayload.transactionRef}`}
                </div>

                {isCertificate && (
                  <div style={{ fontSize: 12, color: '#0f6e56', marginTop: 4 }}>
                    Offizieller Nachweis nach § 65a SGB V · Reiche dieses PDF in der App deiner Krankenkasse ein.
                    {claim.selfSubmittedAt && ` (Als hochgeladen markiert am ${new Date(claim.selfSubmittedAt).toLocaleDateString('de-DE')})`}
                  </div>
                )}

                {claim.kvnr && (
                  <div style={{ fontSize: 11, color: '#55544f', marginTop: 4 }}>
                    Versichertennr. (KVNR): <code>{claim.kvnr}</code>
                  </div>
                )}

                {claim.contactEmail && (
                  <div style={{ fontSize: 11, color: '#0f6e56', marginTop: 4 }}>
                    Gutschein-Zustellung per E-Mail an: <code>{claim.contactEmail}</code>
                  </div>
                )}

                {claim.payoutIbanMasked && (
                  <div style={{ fontSize: 11, color: '#55544f', marginTop: 4 }}>
                    Auszahlung auf Girokonto: <code>{claim.payoutIbanMasked}</code>
                  </div>
                )}

                {claim.rejectionReason && (
                  <div style={{ fontSize: 12, color: '#a32d2d', marginTop: 6, background: 'rgba(163,45,45,0.06)', padding: '6px 10px', borderRadius: 8 }}>
                    <strong>Grund der Ablehnung:</strong> {claim.rejectionReason}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                {isPayout && claim.status === 'accepted' && (
                  <Btn small variant="secondary" onClick={() => onOpenReceipt(claim.id)} testId={`open-receipt-${claim.id}`}>
                    <FileText size={12} style={{ marginRight: 4 }} /> Beleg anzeigen
                  </Btn>
                )}
                {isVoucher && claim.status === 'accepted' && hasCode && (
                  <Btn small onClick={() => onOpenVoucher(claim)} testId={`open-voucher-${claim.id}`}>
                    <Gift size={12} style={{ marginRight: 4 }} /> Gutschein anzeigen
                  </Btn>
                )}
                {isCertificate && (
                  <Btn small variant="secondary" onClick={() => onOpenCertificate(claim)} testId={`open-cert-${claim.id}`}>
                    <ShieldCheck size={12} style={{ marginRight: 4 }} /> Kassen-Nachweis (PDF)
                  </Btn>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
