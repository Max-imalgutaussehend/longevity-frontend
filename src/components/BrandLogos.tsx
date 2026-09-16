import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: number;
  className?: string;
  color?: string;
}

export function AppleLogo({ size = 20, className, color }: LogoProps) {
  return (
    <svg
      viewBox="0 0 170 170"
      width={size}
      height={size}
      className={className}
      fill={color ?? 'currentColor'}
      style={{ display: 'inline-block', flexShrink: 0 }}
      aria-label="Apple Health Logo"
    >
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.7-11.64-13.98-5.99-9.13-10.74-19.46-14.24-30.98-3.5-11.53-5.26-22.37-5.26-32.53 0-14.02 3.42-25.7 10.25-35.03 6.83-9.33 15.68-14.15 26.54-14.45 4.35 0 9.42 1.25 15.22 3.75 5.8 2.5 9.49 3.86 11.06 4.09 1.96-.45 5.86-1.89 11.7-4.32 5.83-2.43 10.74-3.52 14.73-3.28 10.88.54 19.82 4.54 26.83 12 4.45 4.7 8.01 10.3 10.68 16.79-9.57 5.79-14.28 13.88-14.13 24.28.16 8.05 3.19 14.88 9.09 20.49 5.9 5.61 12.98 8.94 21.24 9.98-2.18 6.42-4.8 12.65-7.85 18.68zM119.22 33.15c0-6.96 2.54-13.51 7.62-19.64 5.08-6.13 11.4-10.02 18.96-11.68.76 6.85-1.28 13.25-6.12 19.2-4.84 5.95-11.08 9.77-18.72 11.45-.63-.82-1.74-1.92-1.74-1.92v2.59z" />
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
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div style={{ height: 1, width: 32, background: 'rgba(0,0,0,0.1)' }} />
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#71716b',
          }}
        >
          Nahtlose Verbindung zu deinen Lieblingsgeräten
        </span>
        <div style={{ height: 1, width: 32, background: 'rgba(0,0,0,0.1)' }} />
      </div>

      <div
        className="brand-logo-ticker"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px 28px',
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
