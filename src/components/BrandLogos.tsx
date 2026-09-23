import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { apiClient } from '../api/client.js';

interface LogoProps {
  size?: number;
  className?: string;
  color?: string;
}

export function AppleLogo({ size = 20, className, color }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill={color ?? 'currentColor'}
      style={{ display: 'inline-block', flexShrink: 0 }}
      aria-label="Apple Health Logo"
    >
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z" />
    </svg>
  );
}

export function GoogleLogo({ size = 20, className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      style={{ display: 'inline-block', flexShrink: 0 }}
      aria-label="Google Health Logo"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export function FitbitLogo({ size = 20, className, color }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill={color ?? '#00B0B9'}
      style={{ display: 'inline-block', flexShrink: 0 }}
      aria-label="Fitbit Logo"
    >
      <circle cx="12" cy="2.5" r="1.5" />
      <circle cx="12" cy="6.3" r="1.8" />
      <circle cx="12" cy="10.1" r="2.1" />
      <circle cx="12" cy="13.9" r="2.1" />
      <circle cx="12" cy="17.7" r="1.8" />
      <circle cx="12" cy="21.5" r="1.5" />
      <circle cx="8.2" cy="6.3" r="1.5" />
      <circle cx="8.2" cy="10.1" r="1.8" />
      <circle cx="8.2" cy="13.9" r="1.8" />
      <circle cx="8.2" cy="17.7" r="1.5" />
      <circle cx="4.4" cy="10.1" r="1.5" />
      <circle cx="4.4" cy="13.9" r="1.5" />
      <circle cx="15.8" cy="6.3" r="1.5" />
      <circle cx="15.8" cy="10.1" r="1.8" />
      <circle cx="15.8" cy="13.9" r="1.8" />
      <circle cx="15.8" cy="17.7" r="1.5" />
      <circle cx="19.6" cy="10.1" r="1.5" />
      <circle cx="19.6" cy="13.9" r="1.5" />
    </svg>
  );
}

export function GarminLogo({ size = 20, className, color }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill={color ?? '#007CC3'}
      style={{ display: 'inline-block', flexShrink: 0 }}
      aria-label="Garmin Logo"
    >
      <path d="M12 2L2 21.5h20L12 2zm0 5.4l6.1 11.8H5.9L12 7.4z" />
    </svg>
  );
}

export function OuraLogo({ size = 20, className, color }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      style={{ display: 'inline-block', flexShrink: 0 }}
      aria-label="Oura Ring Logo"
    >
      <circle cx="12" cy="12" r="8.2" stroke={color ?? '#404040'} strokeWidth="2.8" />
      <circle cx="12" cy="12" r="4" fill={color ?? '#404040'} />
    </svg>
  );
}

export function StravaLogo({ size = 20, className, color }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill={color ?? '#FC4C02'}
      style={{ display: 'inline-block', flexShrink: 0 }}
      aria-label="Strava Logo"
    >
      <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7.01 13.828h4.167" />
    </svg>
  );
}

export function WithingsLogo({ size = 20, className, color }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill={color ?? '#0f6e56'}
      style={{ display: 'inline-block', flexShrink: 0 }}
      aria-label="Withings Logo"
    >
      <path d="M2.2 6.5h2.6l3.4 10.5 3-8.8-1.8-1.7h2.8l2 6.2 3.1-6.2h2.7l-4.8 12.2h-2.4l-3-9.5-3 9.5H2.2z" />
    </svg>
  );
}

export function WhoopLogo({ size = 20, className, color }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill={color ?? '#111111'}
      style={{ display: 'inline-block', flexShrink: 0 }}
      aria-label="Whoop Logo"
    >
      <path d="M3.5 6.5h3.6l4.2 11H7.7L3.5 6.5zm8.8 0h3.6l4.2 11h-3.6l-4.2-11z" />
    </svg>
  );
}

export function PolarLogo({ size = 20, className, color }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill={color ?? '#D0142C'}
      style={{ display: 'inline-block', flexShrink: 0 }}
      aria-label="Polar Logo"
    >
      <path d="M12 2.5l2.4 6.2 6.6.6-4.9 4.4 1.5 6.4-5.6-3.3-5.6 3.3 1.5-6.4-4.9-4.4 6.6-.6z" />
    </svg>
  );
}

export interface BrandPartner {
  id: string;
  name: string;
  category: string;
  metrics: string;
  badge: string;
  Logo: React.ComponentType<LogoProps>;
  accentColor: string;
}

export const SUPPORTED_BRANDS: BrandPartner[] = [
  {
    id: 'apple',
    name: 'Apple Health',
    category: 'iOS & Apple Watch',
    metrics: 'Schritte · Puls · HRV · Schlaf · VO2max',
    badge: 'Direkt-Import & Cloud',
    Logo: AppleLogo,
    accentColor: '#1d1d1f',
  },
  {
    id: 'google',
    name: 'Google Health & Fit',
    category: 'Android, Wear OS & Health Connect',
    metrics: 'Schritte · Ruhepuls · Schlaf · Aktivminuten',
    badge: 'Cloud Sync (OAuth)',
    Logo: GoogleLogo,
    accentColor: '#4285F4',
  },
  {
    id: 'fitbit',
    name: 'Fitbit',
    category: 'Smartwatches & Fitness-Tracker',
    metrics: 'Tagesaktivität · Pulszonen · Schlafanalyse',
    badge: 'Health Connect & Google',
    Logo: FitbitLogo,
    accentColor: '#00B0B9',
  },
  {
    id: 'garmin',
    name: 'Garmin',
    category: 'Sportuhren & Performance Wearables',
    metrics: 'VO2max · Herzfrequenz · Trainingsbelastung',
    badge: 'Connect Sync',
    Logo: GarminLogo,
    accentColor: '#007CC3',
  },
  {
    id: 'oura',
    name: 'Oura Ring',
    category: 'Smart Rings & Erholung',
    metrics: 'Sleep Score · Readiness · HRV-Trends',
    badge: 'Cloud API',
    Logo: OuraLogo,
    accentColor: '#55544f',
  },
  {
    id: 'strava',
    name: 'Strava',
    category: 'Lauf- & Radsport-Plattform',
    metrics: 'Ausdauereinheiten · Zone-2-Minuten · Pace',
    badge: 'OAuth Integration',
    Logo: StravaLogo,
    accentColor: '#FC4C02',
  },
  {
    id: 'withings',
    name: 'Withings',
    category: 'Klinische Waagen & Blutdruckmessgeräte',
    metrics: 'Blutdruck · Gewicht · Gefäßalter',
    badge: 'Health Cloud',
    Logo: WithingsLogo,
    accentColor: '#0f6e56',
  },
  {
    id: 'whoop',
    name: 'Whoop',
    category: 'Performance- & Erholungs-Tracker',
    metrics: 'Strain · Recovery · Herzfrequenzvariabilität',
    badge: 'Apple Health & Connect',
    Logo: WhoopLogo,
    accentColor: '#22221f',
  },
  {
    id: 'polar',
    name: 'Polar',
    category: 'Pulsuhren & Brustgurte',
    metrics: 'Herzfrequenzgenauigkeit · Kardiotraining',
    badge: 'Health Hub',
    Logo: PolarLogo,
    accentColor: '#D0142C',
  },
];

/**
 * Sleek, horizontal Brand Logo Ribbon shown directly under the Hero
 */
export function BrandLogosRibbon() {
  return (
    <div
      style={{
        width: '100%',
        padding: '24px 20px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        zIndex: 15,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          marginBottom: 16,
          maxWidth: '100%',
          padding: '0 8px',
        }}
      >
        <div style={{ height: 1, width: 32, background: 'rgba(0,0,0,0.1)', flexShrink: 1, minWidth: 8 }} />
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#71716b',
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          Nahtlose Verbindung zu deinen Lieblingsgeräten
        </span>
        <div style={{ height: 1, width: 32, background: 'rgba(0,0,0,0.1)', flexShrink: 1, minWidth: 8 }} />
      </div>

      <div
        className="brand-logo-ticker"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px 20px',
          maxWidth: 1040,
        }}
      >
        {SUPPORTED_BRANDS.map((b) => {
          const Logo = b.Logo;
          return (
            <div
              key={b.id}
              className="brand-logo-item"
              title={`${b.name} (${b.category})`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                borderRadius: 999,
                background: 'rgba(255, 255, 255, 0.65)',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
                cursor: 'default',
              }}
            >
              <Logo size={17} color={b.id === 'google' ? undefined : b.accentColor} />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#383834',
                  letterSpacing: '-0.01em',
                }}
              >
                {b.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Interactive Brand Logos Card shown directly on the user Dashboard
 */
export function BrandLogosDashboardCard() {
  const navigate = useNavigate();
  const { data: sources = [] } = useQuery<{ id: string; kind: string; enabled: boolean; sampleCount?: number; lastSyncAt?: string | null }[]>({
    queryKey: ['sources'],
    queryFn: () => apiClient('/sources'),
  });

  const isBrandConnected = (brandId: string) => {
    return sources.some((s) => {
      if (!s.enabled) return false;
      const hasData = (s.sampleCount ?? 0) > 0 || !!s.lastSyncAt;
      if (brandId === 'apple') return (s.kind === 'apple_health' || s.kind === 'health_auto_export') && hasData;
      if (brandId === 'google') return (s.kind === 'google_fit' || s.kind === 'google_health') && hasData;
      if (brandId === 'oura') return s.kind === 'oura' && hasData;
      return s.kind === brandId && hasData;
    });
  };

  const connectedCount = SUPPORTED_BRANDS.filter((b) => isBrandConnected(b.id)).length;

  return (
    <div
      data-testid="dashboard-brand-logos"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(248,252,250,0.88) 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: 18,
        border: '1px solid rgba(29, 158, 117, 0.18)',
        padding: '18px 22px',
        boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#22221f' }}>
            Kompatible Tracker & Gesundheits-Apps
          </span>
          <span
            style={{
              fontSize: 11,
              color: connectedCount > 0 ? '#0f6e56' : '#71716b',
              background: connectedCount > 0 ? 'rgba(29, 158, 117, 0.1)' : 'rgba(0,0,0,0.05)',
              padding: '2px 8px',
              borderRadius: 999,
              fontWeight: 500,
            }}
          >
            {connectedCount > 0 ? `${connectedCount} aktiv verbunden` : `${SUPPORTED_BRANDS.length} Plattformen unterstützt`}
          </span>
        </div>
        <button
          type="button"
          data-testid="dashboard-manage-sources-btn"
          onClick={() => navigate('/daten')}
          style={{
            fontSize: 12,
            color: '#0f6e56',
            fontWeight: 600,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: 0,
          }}
        >
          Tracker & Quellen verwalten →
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 12px', alignItems: 'center' }}>
        {SUPPORTED_BRANDS.map((b) => {
          const Logo = b.Logo;
          const connected = isBrandConnected(b.id);
          return (
            <button
              key={b.id}
              type="button"
              data-testid={`dashboard-brand-${b.id}`}
              onClick={() => navigate('/daten')}
              title={`${b.name} (${b.category}) – ${connected ? 'Aktiv verbunden' : 'Jetzt in Daten verknüpfen'}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '6px 13px',
                borderRadius: 999,
                background: connected ? 'rgba(29, 158, 117, 0.09)' : 'rgba(255, 255, 255, 0.85)',
                border: connected ? '1.5px solid rgba(29, 158, 117, 0.35)' : '1px solid rgba(0, 0, 0, 0.07)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px -2px rgba(0,0,0,0.08)';
                e.currentTarget.style.borderColor = 'rgba(29, 158, 117, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = connected ? 'rgba(29, 158, 117, 0.35)' : 'rgba(0, 0, 0, 0.07)';
              }}
            >
              <Logo size={15} color={b.id === 'google' ? undefined : b.accentColor} />
              <span style={{ fontSize: 12, fontWeight: 500, color: connected ? '#0f6e56' : '#22221f' }}>
                {b.name}
              </span>
              {connected && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: '#0f6e56',
                    color: '#fff',
                  }}
                >
                  <Check size={9} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Rich, interactive Brand Ecosystem Grid shown in the Product detail section
 */
export function BrandEcosystemSection() {
  return (
    <div style={{ width: '100%', marginBottom: 48 }}>
      <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 28px' }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#0f6e56',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 8,
          }}
        >
          Offenes Longevity-Ökosystem
        </p>
        <h3
          style={{
            fontSize: 'clamp(22px, 3vw, 28px)',
            fontWeight: 500,
            color: '#22221f',
            margin: '0 0 10px',
            letterSpacing: '-0.01em',
          }}
        >
          Unterstützte Wearables & Gesundheits-Apps
        </h3>
        <p style={{ fontSize: 14, color: '#55544f', margin: 0, lineHeight: 1.5 }}>
          LONGEVITY funktioniert herstellerunabhängig. Deine Rohdaten bleiben auf deinem Gerät und fließen nur
          als anonymisierte Vitalitätsparameter in deine Score-Berechnung ein.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {SUPPORTED_BRANDS.map((brand) => {
          const Logo = brand.Logo;
          return (
            <div
              key={brand.id}
              className="brand-ecosystem-card"
              style={{
                background: 'rgba(255, 255, 255, 0.85)',
                border: '1px solid rgba(0, 0, 0, 0.07)',
                borderRadius: 16,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: 'rgba(0, 0, 0, 0.03)',
                      border: '1px solid rgba(0, 0, 0, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Logo size={22} color={brand.id === 'google' ? undefined : brand.accentColor} />
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: 999,
                      background: 'rgba(29, 158, 117, 0.08)',
                      color: '#0f6e56',
                      border: '1px solid rgba(29, 158, 117, 0.2)',
                    }}
                  >
                    {brand.badge}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#22221f',
                    marginBottom: 4,
                  }}
                >
                  {brand.name}
                </div>
                <div style={{ fontSize: 12, color: '#888780', marginBottom: 10 }}>{brand.category}</div>
              </div>

              <div
                style={{
                  paddingTop: 10,
                  borderTop: '1px solid rgba(0, 0, 0, 0.05)',
                  fontSize: 12,
                  color: '#55544f',
                  lineHeight: 1.4,
                }}
              >
                <span style={{ fontWeight: 500, color: '#22221f' }}>Metriken:</span> {brand.metrics}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Link to="/register" style={{ textDecoration: 'none' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: '#0f6e56',
              padding: '8px 20px',
              borderRadius: 999,
              background: 'rgba(29, 158, 117, 0.08)',
              border: '1px solid rgba(29, 158, 117, 0.2)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Deine Gesundheits-Apps jetzt in unter 2 Minuten verbinden →
          </span>
        </Link>
      </div>
    </div>
  );
}
