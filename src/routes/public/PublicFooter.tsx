import { Link } from 'react-router-dom';
import brandIcon from '../../assets/brand-icon.png';
import { APP_ROUTES, EXTERNAL_LINKS } from '../../lib/routes.js';

interface PublicFooterProps {
  onScrollTo: (id: string) => void;
}

const footerLinkStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  padding: 0,
  fontFamily: 'inherit',
  fontSize: 13,
  color: '#55544f',
  cursor: 'pointer',
  textDecoration: 'none',
  textAlign: 'left',
  transition: 'color 0.15s',
};

export function PublicFooter({ onScrollTo }: PublicFooterProps) {
  return (
    <footer
      style={{
        position: 'relative',
        zIndex: 2,
        marginTop: 100,
        borderTop: '1px solid rgba(0, 0, 0, 0.08)',
        background: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '60px 24px 36px',
      }}
    >
      <div style={{ maxWidth: 1140, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 40,
            marginBottom: 48,
          }}
        >
          {/* Col 1: Mission */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <img src={brandIcon} alt="Longevity" style={{ width: 26, height: 26 }} />
              <span style={{ fontSize: 16, fontWeight: 600, color: '#1d9e75' }}>LONGEVITY</span>
            </div>
            <p style={{ fontSize: 13, color: '#55544f', lineHeight: 1.6, margin: 0 }}>
              Wissenschaftlich fundiertes Vitalitäts-Tracking und biologisches Altersmodell.
              Entwickelt im Rahmen eines Forschungsprojekts an der Dualen Hochschule Baden-Württemberg (DHBW).
            </p>
          </div>

          {/* Col 2: Produkt */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#22221f', marginBottom: 14 }}>
              Produkt & Features
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>
                <button onClick={() => onScrollTo('produkt')} style={footerLinkStyle}>
                  Produktübersicht
                </button>
              </li>
              <li>
                <button onClick={() => onScrollTo('funktionen')} style={footerLinkStyle}>
                  Funktionsweise (3 Säulen)
                </button>
              </li>
              <li>
                <button onClick={() => onScrollTo('simulator')} style={footerLinkStyle}>
                  Hebel-Simulator
                </button>
              </li>
              <li>
                <button onClick={() => onScrollTo('datenschutz')} style={footerLinkStyle}>
                  Zero-Knowledge Nachweise
                </button>
              </li>
              <li>
                <Link to={APP_ROUTES.app.dashboard()} style={footerLinkStyle}>
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Partner & Kassen */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#22221f', marginBottom: 14 }}>
              Partner & Kassen
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>
                <button onClick={() => onScrollTo('kassen')} style={footerLinkStyle}>
                  Krankenkassen-Kooperation
                </button>
              </li>
              <li>
                <button onClick={() => onScrollTo('kontakt')} style={footerLinkStyle}>
                  Direktkontakt & Team
                </button>
              </li>
              <li>
                <Link to={APP_ROUTES.public.verify('demo-token')} style={footerLinkStyle}>
                  Öffentliche Token-Verifikation
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Rechtliches & DHBW */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#22221f', marginBottom: 14 }}>
              Rechtliches & Projekt
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>
                <Link to={APP_ROUTES.public.impressum()} style={footerLinkStyle}>
                  Impressum (§ 5 DDG)
                </Link>
              </li>
              <li>
                <Link to={APP_ROUTES.public.datenschutz()} style={footerLinkStyle}>
                  Datenschutzerklärung (DSGVO)
                </Link>
              </li>
              <li>
                <a
                  href={EXTERNAL_LINKS.github}
                  target="_blank"
                  rel="noreferrer"
                  style={footerLinkStyle}
                >
                  GitHub Repository ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Medical disclaimer note */}
        <div
          style={{
            padding: '16px 20px',
            borderRadius: 12,
            background: 'rgba(168, 168, 156, 0.08)',
            border: '1px solid rgba(168, 168, 156, 0.2)',
            fontSize: 12,
            color: '#888780',
            lineHeight: 1.5,
            marginBottom: 28,
          }}
        >
          <strong>Wichtiger Hinweis: Kein Medizinprodukt.</strong> Die von LONGEVITY errechneten Scores, Vitalitätsalter und Hebel
          dienen ausschließlich der präventiven Information und Lebensstilreflexion. Sie stellen keine medizinische Diagnose, Therapie
          oder ärztliche Beratung dar.
        </div>

        {/* Bottom copyright line */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            fontSize: 12,
            color: '#888780',
            borderTop: '1px solid rgba(0, 0, 0, 0.05)',
            paddingTop: 20,
          }}
        >
          <div>© {new Date().getFullYear()} LONGEVITY. Ein DHBW-Lehr- und Forschungsprojekt.</div>
          <div style={{ display: 'flex', gap: 16 }}>
            <Link to={APP_ROUTES.public.impressum()} style={{ color: '#888780', textDecoration: 'none' }}>Impressum</Link>
            <Link to={APP_ROUTES.public.datenschutz()} style={{ color: '#888780', textDecoration: 'none' }}>Datenschutz</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
