import { Link } from 'react-router-dom';
import { APP_ROUTES } from '../../lib/routes.js';
import { SUPPORTED_BRANDS } from './brandsConfig.js';

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
        <Link to={APP_ROUTES.register} style={{ textDecoration: 'none' }}>
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
