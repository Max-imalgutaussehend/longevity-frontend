import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client.js';

interface VerifyResult {
  band: { low: number; high: number };
  issuedAt: string;
  expiresAt: string;
  valid: boolean;
  reason?: 'not_found' | 'invalid_signature' | 'revoked' | 'expired';
}

const REASON_TEXT: Record<string, string> = {
  not_found: 'Nachweis nicht gefunden.',
  invalid_signature: 'Signatur ungültig.',
  revoked: 'Nachweis wurde widerrufen.',
  expired: 'Nachweis ist abgelaufen.',
};

export function Component() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery<VerifyResult>({
    queryKey: ['verify', id],
    queryFn: () => apiClient<VerifyResult>(`/verify/${id}`),
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--neutral-50)' }}>
      <div style={{ width: '100%', maxWidth: 400, background: 'var(--neutral-0)', border: '1px solid var(--neutral-200)', borderRadius: 10, padding: 40, textAlign: 'center' }}>
        {isLoading ? (
          <div style={{ color: 'var(--neutral-400)' }}>Prüfe Nachweis…</div>
        ) : !data?.valid ? (
          <>
            <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--danger-700)', marginBottom: 8 }}>Nachweis ungültig</div>
            <div style={{ fontSize: 14, color: 'var(--neutral-700)' }}>{REASON_TEXT[data?.reason ?? ''] ?? 'Ungültiger Nachweis.'}</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 12, color: 'var(--neutral-500)', marginBottom: 8 }}>Longevity Band</div>
            <div style={{ fontSize: 56, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--accent-600)', lineHeight: 1, marginBottom: 16 }}>
              {data.band.low}–{data.band.high}
            </div>
            <div style={{ fontSize: 12, color: 'var(--neutral-500)' }}>
              Ausgestellt {new Date(data.issuedAt).toLocaleDateString('de')} · Gültig bis {new Date(data.expiresAt).toLocaleDateString('de')}
            </div>
            <div style={{ marginTop: 16, fontSize: 12, color: 'var(--neutral-500)', borderTop: '1px solid var(--neutral-200)', paddingTop: 16 }}>
              Signatur geprüft. Dieser Nachweis enthält ausschließlich das Band, keinen Einzelwert.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
