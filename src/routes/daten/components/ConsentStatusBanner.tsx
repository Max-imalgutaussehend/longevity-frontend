import { Shield, ShieldCheck, ExternalLink } from 'lucide-react';
import { Btn } from '../../../components/ui.js';
import type { ConsentStatus } from '../datenTypes.js';

interface ConsentStatusBannerProps {
  consentData: ConsentStatus | undefined;
  onRevoke: () => void;
  isRevoking: boolean;
  onRequestConsent: () => void;
}

export function ConsentStatusBanner({
  consentData,
  onRevoke,
  isRevoking,
  onRequestConsent,
}: ConsentStatusBannerProps) {
  if (!consentData) return null;

  return (
    <div
      style={{
        background: consentData.hasConsented ? 'rgba(29,158,117,0.06)' : 'rgba(245,158,11,0.08)',
        border: consentData.hasConsented ? '1px solid rgba(29,158,117,0.2)' : '1px solid rgba(245,158,11,0.3)',
        borderRadius: 16,
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {consentData.hasConsented ? (
          <ShieldCheck size={20} color="#0f6e56" style={{ flexShrink: 0 }} />
        ) : (
          <Shield size={20} color="#d97706" style={{ flexShrink: 0 }} />
        )}
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: consentData.hasConsented ? '#0f6e56' : '#92400e',
            }}
          >
            {consentData.hasConsented
              ? `DSGVO Art. 9 Einwilligung aktiv (${consentData.version ?? '2026-09-v1'})`
              : 'DSGVO-Einwilligung erforderlich (Art. 9 DSGVO)'}
          </div>
          <div
            style={{
              fontSize: 11,
              color: consentData.hasConsented ? '#55544f' : '#78350f',
            }}
          >
            {consentData.hasConsented
              ? `Erteilt am ${
                  consentData.consentAt
                    ? new Date(consentData.consentAt).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })
                    : 'heute'
                } · Verarbeitung besonderer Kategorien personenbezogener Daten`
              : 'Vor dem Verbinden von Wearables oder Gesundheitsdaten ist deine ausdrückliche Einwilligung gesetzlich vorgeschrieben.'}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <a
          href="/datenschutz"
          target="_blank"
          rel="noreferrer"
          style={{
            fontSize: 12,
            color: '#0f6e56',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontWeight: 500,
          }}
        >
          Datenschutz <ExternalLink size={12} />
        </a>
        {consentData.hasConsented ? (
          <Btn
            small
            variant="ghost"
            onClick={() => {
              if (
                window.confirm(
                  'Möchtest du deine DSGVO-Einwilligung zur Verarbeitung von Gesundheitsdaten (Art. 9 DSGVO) wirklich widerrufen?',
                )
              ) {
                onRevoke();
              }
            }}
            disabled={isRevoking}
          >
            {isRevoking ? 'Wird widerrufen...' : 'Widerrufen'}
          </Btn>
        ) : (
          <Btn small onClick={onRequestConsent}>
            Einwilligung einsehen & erteilen
          </Btn>
        )}
      </div>
    </div>
  );
}
