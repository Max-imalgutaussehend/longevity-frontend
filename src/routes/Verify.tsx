import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Check, ShieldCheck, Lock, ArrowRight } from 'lucide-react';
import { apiClient } from '../api/client.js';
import { Card, Chip, Btn, GlassInput } from '../components/ui.js';
import brandIcon from '../assets/brand-icon.png';
import { getSourceLabel } from '../lib/formatters.js';

interface VerifyResult {
  band: { low: number; high: number };
  issuedAt: string;
  expiresAt: string;
  valid: boolean;
  reason?: 'not_found' | 'invalid_signature' | 'revoked' | 'expired';
  verifiedOnly?: boolean;
  trustLevel?: 'unverified' | 'cloud_verified' | 'certified_medical';
  verifiedSources?: string[];
  certificateType?: string;
  sampleCount?: number;
  activeDays?: number;
  issuer?: string;
}

const REASON_TEXT: Record<string, string> = {
  not_found: 'Dieser Nachweis existiert nicht.',
  invalid_signature: 'Die Signatur des Nachweises ist ungültig.',
  revoked: 'Dieser Nachweis wurde vom Inhaber widerrufen.',
  expired: 'Die Gültigkeitsdauer dieses Nachweises ist abgelaufen.',
};

export function parseTokenInput(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  const match = trimmed.match(/(?:^|\/)verify\/([^/?#]+)/i);
  if (match) return match[1];
  return trimmed;
}

export function Component() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading } = useQuery<VerifyResult>({
    queryKey: ['verify', id],
    queryFn: () => apiClient<VerifyResult>(`/verify/${id}`),
    enabled: Boolean(id),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = parseTokenInput(searchInput);
    if (cleanId) {
      navigate(`/verify/${cleanId}`);
    }
  };

  return (
    <>
      <div className="bg-canvas">
        <div className="bg-orb" />
        <div className="bg-orb" />
        <div className="bg-orb" />
        <div className="bg-orb" />
      </div>
      <div style={{
        position: 'relative', zIndex: 1, minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', padding: 24,
      }}>
        <img src={brandIcon} alt="Longevity" style={{ width: 52, height: 52, objectFit: 'contain', marginBottom: 40 }} />

        <div style={{ width: '100%', maxWidth: 480 }}>
          {!id ? (
            <Card style={{ padding: '40px 36px', textAlign: 'center' }}>
              <div style={{
                display: 'inline-flex',
                padding: '6px 14px',
                borderRadius: 999,
                background: 'rgba(29,158,117,0.12)',
                color: '#0f6e56',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 16,
                alignItems: 'center',
                gap: 6,
              }}>
                <ShieldCheck size={16} color="#0f6e56" />
                <span>Öffentliche Token-Verifikation</span>
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 500, color: '#22221f', margin: '0 0 10px 0' }}>
                Vitalitätsnachweis prüfen
              </h1>
              <p style={{ fontSize: 13, color: '#55544f', lineHeight: 1.6, marginBottom: 24 }}>
                Gib eine Token-ID oder die vollständige Nachweis-URL ein, um die kryptografische Ed25519-Signatur und Gültigkeit zu verifizieren.
              </p>
              <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <GlassInput
                  placeholder="z. B. demo-token oder vollständige URL"
                  value={searchInput}
                  onChange={setSearchInput}
                  testId="verify-token-input"
                  name="tokenId"
                />
                <Btn type="submit" full testId="verify-token-submit" disabled={!searchInput.trim()}>
                  Nachweis prüfen <ArrowRight size={15} style={{ marginLeft: 6 }} />
                </Btn>
              </form>
              <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', marginTop: 24, paddingTop: 18 }}>
                <span style={{ fontSize: 12, color: '#888780' }}>Demo-Zertifikat ausprobieren: </span>
                <Link
                  to="/verify/demo-token"
                  data-testid="verify-test-demo-token"
                  style={{ fontSize: 12, color: '#0f6e56', fontWeight: 500, textDecoration: 'none' }}
                >
                  Demo-Token anzeigen →
                </Link>
              </div>
            </Card>
          ) : (
            <>
              <Card style={{ textAlign: 'center', padding: '48px 40px' }}>
                {isLoading ? (
                  <div style={{ color: '#a3a29c', fontSize: 14 }}>Signatur wird geprüft…</div>
                ) : data?.valid ? (
                  data.verifiedOnly ? (
                    <>
                      <div style={{
                        fontSize: 11,
                        color: '#0f6e56',
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        marginBottom: 20,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        background: 'rgba(29,158,117,0.12)',
                        padding: '6px 14px',
                        borderRadius: 999,
                        border: '1px solid rgba(29,158,117,0.25)',
                      }}>
                        <ShieldCheck size={16} color="#0f6e56" />
                        <span>Offizieller Krankenkassen-Nachweis · Signatur geprüft</span>
                      </div>

                      <div data-testid="verify-band" style={{
                        display: 'inline-flex',
                        padding: '14px 36px',
                        borderRadius: 999,
                        background: 'linear-gradient(135deg, rgba(29,158,117,0.15) 0%, rgba(15,110,86,0.10) 100%)',
                        color: '#0f6e56',
                        fontSize: 32,
                        fontWeight: 600,
                        border: '1px solid rgba(29,158,117,0.3)',
                        marginBottom: 24,
                      }}>
                        Band {data.band.low} – {data.band.high}
                      </div>

                      <p style={{ fontSize: 13, color: '#55544f', lineHeight: 1.7, marginBottom: 20 }}>
                        Der Inhaber hat einen Vitalitätsscore im Band <strong>{data.band.low}–{data.band.high}</strong> nachgewiesen.<br />
                        Ausgestellt {new Date(data.issuedAt).toLocaleDateString('de-DE')} · Gültig bis {new Date(data.expiresAt).toLocaleDateString('de-DE')}.
                      </p>

                      <div style={{
                        textAlign: 'left',
                        padding: '16px 20px',
                        background: 'rgba(29,158,117,0.04)',
                        borderRadius: 14,
                        border: '1px solid rgba(29,158,117,0.16)',
                        fontSize: 12,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                        marginBottom: 20,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#888780' }}>Zertifikat</span>
                          <span style={{ fontWeight: 500, color: '#22221f' }}>{data.certificateType ?? 'GKV / PKV Verifizierter Prämiennachweis'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#888780' }}>Vertrauensstufe</span>
                          <Chip color="teal">
                            {data.trustLevel === 'certified_medical' ? 'Medizinisch zertifiziert' : 'Cloud-verifiziert (OAuth)'}
                          </Chip>
                        </div>
                        {data.verifiedSources && data.verifiedSources.length > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#888780' }}>Verifizierte Quellen</span>
                            <span style={{ fontWeight: 500, color: '#0f6e56' }}>
                              {data.verifiedSources.map((s) => getSourceLabel(s)).join(', ')}
                            </span>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#888780' }}>Mock- & Entwicklungsdaten</span>
                          <span style={{ fontWeight: 500, color: '#0f6e56', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Check size={13} color="#0f6e56" />
                            100% Ausgeschlossen (0 Werte)
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#888780' }}>Manuelle Eingaben & Uploads</span>
                          <span style={{ fontWeight: 500, color: '#0f6e56', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Check size={13} color="#0f6e56" />
                            Ausgeschlossen
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#888780' }}>Aussteller</span>
                          <span style={{ fontSize: 11, color: '#55544f' }}>{data.issuer ?? 'LONGEVITY Health Intermediary'}</span>
                        </div>
                      </div>

                      <div style={{
                        fontSize: 11,
                        color: '#888780',
                        padding: '12px 16px',
                        background: 'rgba(0,0,0,0.03)',
                        borderRadius: 10,
                        lineHeight: 1.6,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 8,
                      }}>
                        <Lock size={15} color="#0f6e56" style={{ flexShrink: 0, marginTop: 2 }} />
                        <div>
                          <strong>Manipulationssicher & Betrugsgeschützt:</strong> Dieser Nachweis basiert ausschließlich auf kryptografisch verifizierten Cloud- & Labordaten mit physiologischer Plausibilitätsprüfung. Mock-Daten und manuelle Eingaben sind ausgeschlossen.
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 11, color: '#888780', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <span>Score-Nachweis · Signatur geprüft</span>
                        <Check size={14} color="#0f6e56" />
                      </div>
                      <div data-testid="verify-band" style={{ display: 'inline-flex', padding: '14px 32px', borderRadius: 999, background: 'rgba(29,158,117,0.10)', color: '#0f6e56', fontSize: 32, fontWeight: 500, border: '1px solid rgba(29,158,117,0.22)', marginBottom: 28 }}>
                        Band {data.band.low} – {data.band.high}
                      </div>
                      <p style={{ fontSize: 13, color: '#55544f', lineHeight: 1.7, marginBottom: 24 }}>
                        Der Inhaber hat einen Vitalitätsscore im Band {data.band.low}–{data.band.high} nachgewiesen.<br />
                        Ausgestellt {new Date(data.issuedAt).toLocaleDateString('de-DE')} · Gültig bis {new Date(data.expiresAt).toLocaleDateString('de-DE')}.
                      </p>
                      <div style={{ fontSize: 12, color: '#a3a29c', padding: '12px 16px', background: 'rgba(0,0,0,0.03)', borderRadius: 10 }}>
                        Dieser Nachweis enthält ausschließlich das Score-Band und das Datum. Kein exakter Score, keine Einzelwerte, keine personenbezogenen Daten.
                      </div>
                    </>
                  )
                ) : (
                  <>
                    <div style={{
                      fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 28,
                      color: data?.reason === 'revoked' ? '#a32d2d' : '#854f0b',
                    }}>
                      {data?.reason === 'revoked' ? 'Nachweis widerrufen' : 'Nachweis ungültig'}
                    </div>
                    <div data-testid="verify-invalid" style={{ display: 'inline-flex', padding: '14px 32px', borderRadius: 999, background: 'rgba(163,45,45,0.08)', color: '#a32d2d', fontSize: 22, fontWeight: 500, border: '1px solid rgba(163,45,45,0.2)', marginBottom: 24 }}>
                      Ungültig
                    </div>
                    <p style={{ fontSize: 13, color: '#55544f' }}>
                      {REASON_TEXT[data?.reason ?? ''] ?? 'Dieser Nachweis ist ungültig.'}
                    </p>
                  </>
                )}
              </Card>
              <div style={{ textAlign: 'center', fontSize: 12, color: '#a3a29c', marginTop: 16, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
                <Link to="/verify" data-testid="verify-search-another" style={{ color: '#0f6e56', textDecoration: 'none', fontWeight: 500 }}>
                  ← Anderen Nachweis prüfen
                </Link>
                <span>·</span>
                <span>{window.location.hostname} · {id}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
