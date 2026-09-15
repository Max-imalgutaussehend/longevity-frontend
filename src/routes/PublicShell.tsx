import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import brandIcon from '../assets/brand-icon.png';
import { Btn } from '../components/ui.js';

interface AuthUser {
  id: string;
  email: string;
  displayName?: string | null;
}

export function Component() {
  const location = useLocation();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  // Check authentication safely without triggering 401 redirect
  useEffect(() => {
    let active = true;
    const base = import.meta.env.VITE_API_BASE_URL ?? '/api';
    fetch(`${base}/me`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.id) {
          setUser(data);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [location.pathname]);

  // Active section scroll spy
  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection('');
      return;
    }

    const sectionIds = ['produkt', 'funktionen', 'simulator', 'datenschutz', 'kassen', 'ueber-uns'];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 250;
      let current = '';

      // If scrolled near bottom of page, activate last section
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100) {
        current = 'ueber-uns';
        setActiveSection(current);
        return;
      }

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            current = id;
            break;
          }
        }
      }

      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      window.location.href = `/#${id}`;
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isHome = location.pathname === '/';

  const getNavLinkStyle = (id: string): React.CSSProperties => {
    const isActive = activeSection === id;
    return {
      background: isActive ? 'rgba(29, 158, 117, 0.14)' : 'transparent',
      color: isActive ? '#0f6e56' : '#55544f',
      boxShadow: isActive ? '0 0 0 1px rgba(29, 158, 117, 0.28) inset' : 'none',
      fontWeight: isActive ? 500 : 400,
      borderRadius: 999,
      padding: '7px 14px',
      border: 'none',
      fontFamily: 'inherit',
      fontSize: 13,
      cursor: 'pointer',
      transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
      whiteSpace: 'nowrap',
    };
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Background canvas */}
      <div className="bg-canvas" style={{ zIndex: 0 }}>
        <div className="bg-orb" />
        <div className="bg-orb" />
      </div>

      {/* Floating Fixed Public Header */}
      <header
        style={{
          position: 'fixed',
          top: 16,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: '0 20px',
          maxWidth: 1140,
          width: '100%',
          margin: '0 auto',
        }}
      >
        <div
          className="glass-deep"
          style={{
            borderRadius: 999,
            padding: '7px 16px 7px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 30px rgba(15, 40, 28, 0.12), 0 1px 0 rgba(255, 255, 255, 0.9) inset',
            background: isHome ? 'rgba(255, 255, 255, 0.82)' : 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
          }}
        >
          {/* Brand Logo & Name */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              textDecoration: 'none',
              color: '#22221f',
            }}
          >
            <img
              src={brandIcon}
              alt="Longevity"
              style={{ width: 32, height: 32, objectFit: 'contain' }}
            />
            <span
              style={{
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: '#1d9e75',
              }}
            >
              LONGEVITY
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                padding: '2px 7px',
                borderRadius: 999,
                background: 'rgba(29, 158, 117, 0.12)',
                color: '#0f6e56',
                border: '1px solid rgba(29, 158, 117, 0.22)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Forschung
            </span>
          </Link>

          {/* Desktop Navigation with Active Scroll Spy */}
          <nav
            style={{
              display: 'none',
              alignItems: 'center',
              gap: 6,
            }}
            className="landing-desktop-nav"
          >
            <button
              onClick={() => scrollTo('produkt')}
              style={getNavLinkStyle('produkt')}
            >
              Produkt
            </button>
            <button
              onClick={() => scrollTo('funktionen')}
              style={getNavLinkStyle('funktionen')}
            >
              Funktionsweise
            </button>
            <button
              onClick={() => scrollTo('simulator')}
              style={getNavLinkStyle('simulator')}
            >
              Live-Simulator
            </button>
            <button
              onClick={() => scrollTo('datenschutz')}
              style={getNavLinkStyle('datenschutz')}
            >
              Datenschutz
            </button>
            <button
              onClick={() => scrollTo('kassen')}
              style={getNavLinkStyle('kassen')}
            >
              Für Krankenkassen
            </button>
            <button
              onClick={() => scrollTo('ueber-uns')}
              style={getNavLinkStyle('ueber-uns')}
            >
              Über uns
            </button>
          </nav>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <Btn small variant={user ? 'primary' : 'secondary'}>
                Zum Dashboard →
              </Btn>
            </Link>
            {!user && (
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <Btn variant="primary" small>
                  Registrieren
                </Btn>
              </Link>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="landing-mobile-menu-btn"
              aria-label="Menü öffnen"
              style={{
                display: 'none',
                background: 'transparent',
                border: 'none',
                padding: '6px 8px',
                cursor: 'pointer',
                color: '#55544f',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu with Active State */}
        {mobileMenuOpen && (
          <div
            className="glass-deep"
            style={{
              marginTop: 8,
              borderRadius: 16,
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <button
              onClick={() => scrollTo('produkt')}
              style={{ ...getNavLinkStyle('produkt'), textAlign: 'left' }}
            >
              Produkt
            </button>
            <button
              onClick={() => scrollTo('funktionen')}
              style={{ ...getNavLinkStyle('funktionen'), textAlign: 'left' }}
            >
              Funktionsweise
            </button>
            <button
              onClick={() => scrollTo('simulator')}
              style={{ ...getNavLinkStyle('simulator'), textAlign: 'left' }}
            >
              Live-Simulator
            </button>
            <button
              onClick={() => scrollTo('datenschutz')}
              style={{ ...getNavLinkStyle('datenschutz'), textAlign: 'left' }}
            >
              Datenschutz
            </button>
            <button
              onClick={() => scrollTo('kassen')}
              style={{ ...getNavLinkStyle('kassen'), textAlign: 'left' }}
            >
              Für Krankenkassen
            </button>
            <button
              onClick={() => scrollTo('ueber-uns')}
              style={{ ...getNavLinkStyle('ueber-uns'), textAlign: 'left' }}
            >
              Über uns
            </button>
          </div>
        )}
      </header>

      {/* Main Page Body */}
      <main style={{ flex: 1, position: 'relative', zIndex: 1, paddingTop: isHome ? 0 : 96 }}>
        <Outlet />
      </main>

      {/* Footer */}
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
                  <button onClick={() => scrollTo('produkt')} style={footerLinkStyle}>
                    Produktübersicht
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollTo('funktionen')} style={footerLinkStyle}>
                    Funktionsweise (3 Säulen)
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollTo('simulator')} style={footerLinkStyle}>
                    Hebel-Simulator
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollTo('datenschutz')} style={footerLinkStyle}>
                    Zero-Knowledge Nachweise
                  </button>
                </li>
                <li>
                  <Link to="/dashboard" style={footerLinkStyle}>
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
                  <button onClick={() => scrollTo('kassen')} style={footerLinkStyle}>
                    Krankenkassen-Kooperation
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollTo('kassen')} style={footerLinkStyle}>
                    Erstkontakt-Formular
                  </button>
                </li>
                <li>
                  <Link to="/verify/demo-token" style={footerLinkStyle}>
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
                  <Link to="/impressum" style={footerLinkStyle}>
                    Impressum (§ 5 DDG)
                  </Link>
                </li>
                <li>
                  <Link to="/datenschutz" style={footerLinkStyle}>
                    Datenschutzerklärung (DSGVO)
                  </Link>
                </li>
                <li>
                  <a
                    href="https://github.com/Max-imalgutaussehend/LONGEVITY"
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
              <Link to="/impressum" style={{ color: '#888780', textDecoration: 'none' }}>Impressum</Link>
              <Link to="/datenschutz" style={{ color: '#888780', textDecoration: 'none' }}>Datenschutz</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
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
