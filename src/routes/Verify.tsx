import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { apiClient } from '../api/client.js';
import { Card } from '../components/ui.js';
import brandIcon from '../assets/brand-icon.png';

interface VerifyResult {
  band: { low: number; high: number };
  issuedAt: string;
  expiresAt: string;
  valid: boolean;
  reason?: 'not_found' | 'invalid_signature' | 'revoked' | 'expired';
}

const REASON_TEXT: Record<string, string> = {
  not_found: 'Dieser Nachweis existiert nicht.',
  invalid_signature: 'Die Signatur des Nachweises ist ungültig.',
  revoked: 'Dieser Nachweis wurde vom Inhaber widerrufen.',
  expired: 'Die Gültigkeitsdauer dieses Nachweises ist abgelaufen.',
};

export function Component() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery<VerifyResult>({
    queryKey: ['verify', id],
    queryFn: () => apiClient<VerifyResult>(`/verify/${id}`),
  });

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

        <div style={{ width: '100%', maxWidth: 460 }}>
          <Card style={{ textAlign: 'center', padding: '48px 44px' }}>
            {isLoading ? (
              <div style={{ color: '#a3a29c', fontSize: 14 }}>Signatur wird geprüft…</div>
            ) : data?.valid ? (
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
          {id && (
            <div style={{ textAlign: 'center', fontSize: 11, color: '#a3a29c', marginTop: 16 }}>
              longevity.maxrommel.de · {id}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
