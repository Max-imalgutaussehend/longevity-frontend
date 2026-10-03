import { useState } from 'react';
import { ShieldCheck, CheckCircle2, Clock, AlertCircle, ExternalLink, Gift, FileText, Banknote } from 'lucide-react';
import { Card, PageTitle, Btn, Chip, Skeleton } from '../../components/ui.js';
import type { InsurerClaim } from '../../api/types.js';

interface InsurerClaimsSectionProps {
  claims: InsurerClaim[] | undefined;
  claimsLoading: boolean;
  onDecide: (claim: InsurerClaim, decision: 'processing' | 'accepted' | 'rejected') => void;
}

export function InsurerClaimsSection({ claims, claimsLoading, onDecide }: InsurerClaimsSectionProps) {
  const [activeTab, setActiveTab] = useState<'portal' | 'certificates' | 'vouchers'>('portal');
  const [portalFilter, setPortalFilter] = useState<'all' | 'open' | 'closed'>('open');

  const portalClaims = claims?.filter((c) =>
    c.payoutMethod !== 'self_submitted' &&
    c.benefitType !== 'certificate' &&
    !(c.benefitType === 'voucher' && c.voucherDelivery === 'code_pool')
  ) ?? [];

  const certificateClaims = claims?.filter((c) =>
    c.payoutMethod === 'self_submitted' || c.benefitType === 'certificate'
  ) ?? [];

  const poolVoucherClaims = claims?.filter((c) =>
    c.benefitType === 'voucher' && c.voucherDelivery === 'code_pool'
  ) ?? [];

  const openPortalCount = portalClaims.filter((c) => c.status === 'submitted' || c.status === 'processing').length;

  const filteredPortalClaims = portalClaims.filter((c) => {
    if (portalFilter === 'open') return c.status === 'submitted' || c.status === 'processing';
    if (portalFilter === 'closed') return c.status === 'accepted' || c.status === 'rejected';
    return true;
  });

  return (
    <div style={{ marginTop: 40 }}>
      <PageTitle
        title="Antrags- & Nachweis-Verwaltung"
        sub="Portal-Prämienanträge entscheiden und ausgestellte Nachweise einsehen"
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginTop: 16, marginBottom: 16, borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: 10, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setActiveTab('portal')}
          style={{
            padding: '8px 16px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
            background: activeTab === 'portal' ? 'linear-gradient(135deg, #1d9e75 0%, #0f6e56 100%)' : 'rgba(0,0,0,0.04)',
            color: activeTab === 'portal' ? '#fff' : '#55544f',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
          data-testid="tab-insurer-portal-claims"
        >
          <Banknote size={14} />
          Portal-Prämienanträge {openPortalCount > 0 ? `(${openPortalCount} offen)` : `(${portalClaims.length})`}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('certificates')}
          style={{
            padding: '8px 16px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
            background: activeTab === 'certificates' ? 'linear-gradient(135deg, #1d9e75 0%, #0f6e56 100%)' : 'rgba(0,0,0,0.04)',
            color: activeTab === 'certificates' ? '#fff' : '#55544f',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
          data-testid="tab-insurer-cert-claims"
        >
          <FileText size={14} />
          Ausgestellte PDF-Nachweise ({certificateClaims.length})
        </button>

        {poolVoucherClaims.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab('vouchers')}
            style={{
              padding: '8px 16px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
              background: activeTab === 'vouchers' ? 'linear-gradient(135deg, #1d9e75 0%, #0f6e56 100%)' : 'rgba(0,0,0,0.04)',
              color: activeTab === 'vouchers' ? '#fff' : '#55544f',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
            data-testid="tab-insurer-voucher-claims"
          >
            <Gift size={14} />
            Sofort-Gutscheine ({poolVoucherClaims.length})
          </button>
        )}
      </div>

      {claimsLoading ? (
        <Skeleton height={100} />
      ) : activeTab === 'portal' ? (
        /* TAB 1: PORTAL CLAIMS (Decision required) */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ fontSize: 13, color: '#55544f' }}>
              Auszahlungen per Banküberweisung, Beitragsverrechnungen und Gutscheine per E-Mail zur Bearbeitung.
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['open', 'closed', 'all'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setPortalFilter(filter)}
                  style={{
                    padding: '4px 10px', borderRadius: 999, border: 'none', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
                    background: portalFilter === filter ? '#0f6e56' : 'rgba(0,0,0,0.05)',
                    color: portalFilter === filter ? '#fff' : '#55544f',
                  }}
                >
                  {filter === 'open' ? `Offen (${openPortalCount})` : filter === 'closed' ? `Abgeschlossen (${portalClaims.length - openPortalCount})` : `Alle (${portalClaims.length})`}
                </button>
              ))}
            </div>
          </div>

          {filteredPortalClaims.length > 0 ? (
            <div style={{ display: 'grid', gap: 12 }}>
              {filteredPortalClaims.map((c) => {
                const payload = c.rewardPayload as { transactionRef?: string; note?: string } | null;
                return (
                  <Card key={c.id} style={{ padding: 20 }} data-testid={`claim-row-${c.id}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 260 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 15, fontWeight: 500, color: '#22221f' }}>{c.offerTitle}</span>
                          {c.status === 'submitted' && <Chip color="amber"><Clock size={11} style={{ marginRight: 4 }} /> Eingegangen</Chip>}
                          {c.status === 'processing' && <Chip color="teal"><Clock size={11} style={{ marginRight: 4 }} /> In Bearbeitung</Chip>}
                          {c.status === 'accepted' && <Chip color="green"><CheckCircle2 size={11} style={{ marginRight: 4 }} /> Genehmigt</Chip>}
                          {c.status === 'rejected' && <Chip color="red"><AlertCircle size={11} style={{ marginRight: 4 }} /> Abgelehnt</Chip>}
                          {c.payoutMethod && (
                            <Chip color="teal">
                              {c.payoutMethod === 'bank_transfer'
                                ? 'Girokonto'
                                : c.payoutMethod === 'contribution_offset'
                                ? 'Beitragsverrechnung'
                                : 'Gutschein (E-Mail)'}
                            </Chip>
                          )}
                          <Chip color="neutral">Band {c.bandLow}–{c.bandHigh}</Chip>
                        </div>

                        <div style={{ fontSize: 13, color: '#55544f' }}>
                          {c.userDisplayName ? `${c.userDisplayName} (${c.userEmail})` : c.userEmail}
                        </div>

                        {c.kvnr && (
                          <div style={{ fontSize: 12, color: '#55544f', marginTop: 4 }}>
                            Versichertennr. (KVNR): <code>{c.kvnr}</code>
                          </div>
                        )}

                        {c.contactEmail && (
                          <div style={{ fontSize: 12, color: '#0f6e56', marginTop: 4 }}>
                            Gutschein-Zustellung an: <code>{c.contactEmail}</code>
                          </div>
                        )}

                        {c.payoutIbanMasked && (
                          <div style={{ fontSize: 12, color: '#0f6e56', marginTop: 4 }}>
                            Auszahlung an: {c.payoutAccountHolder || 'Mitglied'} · <code>{c.payoutIbanMasked}</code>
                          </div>
                        )}

                        <div style={{ fontSize: 11, color: '#888780', marginTop: 6 }}>
                          Eingereicht am {new Date(c.submittedAt).toLocaleDateString('de-DE')}
                          {c.decidedAt && ` · Entschieden am ${new Date(c.decidedAt).toLocaleDateString('de-DE')}`}
                          {payload?.transactionRef && ` · Kassen-Vorgang: ${payload.transactionRef}`}
                          {payload?.note && ` · Vermerk: ${payload.note}`}
                        </div>

                        {c.rejectionReason && (
                          <div style={{ fontSize: 12, color: '#a32d2d', marginTop: 6, background: 'rgba(163,45,45,0.06)', padding: '6px 10px', borderRadius: 8 }}>
                            <strong>Ablehnungsgrund:</strong> {c.rejectionReason}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                        {c.status === 'submitted' && (
                          <>
                            <Btn small variant="secondary" onClick={() => onDecide(c, 'processing')} testId={`claim-processing-${c.id}`}>In Bearbeitung</Btn>
                            <Btn small variant="secondary" onClick={() => onDecide(c, 'rejected')} testId={`claim-reject-${c.id}`}>Ablehnen</Btn>
                            <Btn small onClick={() => onDecide(c, 'accepted')} testId={`claim-accept-${c.id}`}>Annehmen</Btn>
                          </>
                        )}
                        {c.status === 'processing' && (
                          <>
                            <Btn small variant="secondary" onClick={() => onDecide(c, 'rejected')} testId={`claim-reject-${c.id}`}>Ablehnen</Btn>
                            <Btn small onClick={() => onDecide(c, 'accepted')} testId={`claim-accept-${c.id}`}>Abschließen</Btn>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card style={{ textAlign: 'center', padding: '36px 20px', color: '#888780' }}>
              <p style={{ margin: 0, fontSize: 13 }}>Keine Anträge in dieser Ansicht vorhanden.</p>
            </Card>
          )}
        </div>
      ) : activeTab === 'certificates' ? (
        /* TAB 2: CERTIFICATES (§ 65a SGB V - Informational & Audit only) */
        <div>
          <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(29,158,117,0.06)', border: '1px solid rgba(29,158,117,0.2)', display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
            <ShieldCheck size={20} color="#0f6e56" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: 13, color: '#1d2c25', lineHeight: 1.5 }}>
              <strong>Kryptografische Selbsteinreichung nach § 65a SGB V:</strong>
              <div style={{ marginTop: 2, color: '#55544f' }}>
                Diese Nachweise wurden von Versicherten mit digitaler Ed25519-Signatur generiert und werden eigenständig in Ihrer Kassen-App (z. B. TK-Bonusprogramm) oder per Post eingereicht.
              </div>
              <div style={{ marginTop: 4, color: '#0f6e56', fontWeight: 500 }}>
                ✓ Keine Bestätigung im LONGEVITY-Portal erforderlich: Diese Einträge dienen der Nachvollziehbarkeit und Echtheitsprüfung.
              </div>
            </div>
          </div>

          {certificateClaims.length > 0 ? (
            <div style={{ display: 'grid', gap: 12 }}>
              {certificateClaims.map((c) => (
                <Card key={c.id} style={{ padding: 20 }} data-testid={`claim-row-${c.id}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 260 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 15, fontWeight: 500, color: '#22221f' }}>{c.offerTitle}</span>
                        <Chip color="teal"><ShieldCheck size={11} style={{ marginRight: 4 }} /> PDF ausgestellt</Chip>
                        {c.selfSubmittedAt && (
                          <Chip color="green"><CheckCircle2 size={11} style={{ marginRight: 4 }} /> In Kassen-App eingereicht</Chip>
                        )}
                        <Chip color="neutral">Band {c.bandLow}–{c.bandHigh}</Chip>
                      </div>

                      <div style={{ fontSize: 13, color: '#55544f' }}>
                        {c.userDisplayName ? `${c.userDisplayName} (${c.userEmail})` : c.userEmail}
                      </div>

                      {c.kvnr && (
                        <div style={{ fontSize: 12, color: '#55544f', marginTop: 4 }}>
                          Versichertennr. (KVNR): <code>{c.kvnr}</code>
                        </div>
                      )}

                      <div style={{ fontSize: 11, color: '#888780', marginTop: 6 }}>
                        Generiert am {new Date(c.submittedAt).toLocaleDateString('de-DE')}
                        {c.selfSubmittedAt && (
                          <span style={{ color: '#0f6e56' }}>
                            {' '}· Vom Versicherten als in Kassen-App hochgeladen markiert ({new Date(c.selfSubmittedAt).toLocaleDateString('de-DE')})
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ flexShrink: 0 }}>
                      <a
                        href={c.verifyUrl || `/verify/${c.id}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ textDecoration: 'none' }}
                      >
                        <Btn small variant="secondary" testId={`verify-cert-link-${c.id}`}>
                          <ExternalLink size={12} style={{ marginRight: 6 }} /> Prüfsiegel verifizieren
                        </Btn>
                      </a>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card style={{ textAlign: 'center', padding: '36px 20px', color: '#888780' }}>
              <p style={{ margin: 0, fontSize: 13 }}>Bisher wurden keine Kassen-Nachweise ausgestellt.</p>
            </Card>
          )}
        </div>
      ) : (
        /* TAB 3: POOL VOUCHERS (Instant redeemed) */
        <div>
          <div style={{ fontSize: 13, color: '#55544f', marginBottom: 12 }}>
            Übersicht der automatisch aus dem Gutschein-Pool ausgegebenen Rabatt- und Aktionscodes.
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {poolVoucherClaims.map((c) => {
              const payload = c.rewardPayload as { voucherCode?: string } | null;
              return (
                <Card key={c.id} style={{ padding: 20 }} data-testid={`claim-row-${c.id}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 15, fontWeight: 500, color: '#22221f' }}>{c.offerTitle}</span>
                        <Chip color="green"><CheckCircle2 size={11} style={{ marginRight: 4 }} /> Automatisch eingelöst</Chip>
                        <Chip color="neutral">Band {c.bandLow}–{c.bandHigh}</Chip>
                      </div>

                      <div style={{ fontSize: 13, color: '#55544f' }}>
                        Eingelöst von {c.userDisplayName ? `${c.userDisplayName} (${c.userEmail})` : c.userEmail} am {new Date(c.submittedAt).toLocaleDateString('de-DE')}
                      </div>

                      {payload?.voucherCode && (
                        <div style={{ fontSize: 12, color: '#0f6e56', marginTop: 4 }}>
                          Ausgegebener Code: <code>{payload.voucherCode}</code>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
