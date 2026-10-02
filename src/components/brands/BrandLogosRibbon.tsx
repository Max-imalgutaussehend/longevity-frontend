import { SUPPORTED_BRANDS } from './brandsConfig.js';

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
