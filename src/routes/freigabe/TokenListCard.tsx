import { Card, SectionLabel, Chip, Skeleton, Btn } from '../../components/ui.js';
import { getSourceLabel } from '../../lib/formatters.js';
import type { Token } from './freigabeTypes.js';

interface TokenListCardProps {
  tokens: Token[] | undefined;
  isLoading: boolean;
  onOpenCreate: () => void;
  onRevoke: (tokenId: string) => void;
}

export function TokenListCard({
  tokens,
  isLoading,
  onOpenCreate,
  onRevoke,
}: TokenListCardProps) {
  const getVerifyUrl = (id: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/verify/${id}`;
  };

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <SectionLabel>Aktive Nachweise</SectionLabel>
        <Btn small onClick={onOpenCreate} testId="create-token-btn">
          + Neuer Nachweis
        </Btn>
      </div>
      <p style={{ fontSize: 12, color: '#888780', marginBottom: 24 }}>
        Übertragen wird ausschließlich das Score-Band und das Ausstelldatum — kein exakter Score, keine Einzelwerte.
      </p>
      {isLoading ? (
        <Skeleton height={80} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tokens?.map((token) => {
            const revoked = Boolean(token.revokedAt);
            const expired = new Date() > new Date(token.expiresAt);
            const verifyUrl = getVerifyUrl(token.id);

            return (
              <div
                key={token.id}
                className="glass"
                style={{ borderRadius: 14, padding: '20px 24px', opacity: revoked ? 0.5 : 1 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span
                        style={{
                          padding: '5px 16px',
                          borderRadius: 999,
                          background: revoked ? 'rgba(0,0,0,0.05)' : 'rgba(29,158,117,0.10)',
                          color: revoked ? '#888780' : '#0f6e56',
                          fontSize: 15,
                          fontWeight: 500,
                          border: revoked ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(29,158,117,0.2)',
                        }}
                      >
                        Band {token.bandLow}–{token.bandHigh}
                      </span>
                      {token.verifiedOnly ? (
                        <Chip color="teal">GKV / PKV Verifiziert</Chip>
                      ) : (
                        <Chip color="neutral">Standard Score-Nachweis</Chip>
                      )}
                      {revoked && <Chip color="red">Widerrufen</Chip>}
                      {!revoked && expired && <Chip color="amber">Abgelaufen</Chip>}
                    </div>
                    <div style={{ fontSize: 12, color: '#888780', marginBottom: 4 }}>
                      Ausgestellt {new Date(token.issuedAt).toLocaleDateString('de-DE')} · Gültig bis{' '}
                      {new Date(token.expiresAt).toLocaleDateString('de-DE')}
                    </div>
                    {token.verifiedSources && token.verifiedSources.length > 0 && (
                      <div style={{ fontSize: 11, color: '#0f6e56', marginBottom: 4 }}>
                        Verifizierte Quellen: {token.verifiedSources.map((s) => getSourceLabel(s)).join(', ')}
                      </div>
                    )}
                    <code data-testid="token-verify-url" style={{ fontSize: 11, color: '#a3a29c' }}>
                      {verifyUrl}
                    </code>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Btn
                      small
                      variant="secondary"
                      onClick={() => navigator.clipboard?.writeText(verifyUrl)}
                    >
                      Link kopieren
                    </Btn>
                    {!revoked && (
                      <Btn
                        small
                        variant="danger"
                        onClick={() => onRevoke(token.id)}
                        testId="revoke-token-btn"
                      >
                        Widerrufen
                      </Btn>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {tokens?.length === 0 && (
            <p style={{ color: '#a3a29c', fontSize: 13 }}>Noch keine Nachweise erstellt.</p>
          )}
        </div>
      )}
    </Card>
  );
}
