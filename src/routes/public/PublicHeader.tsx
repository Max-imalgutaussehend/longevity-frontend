import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import brandIcon from '../../assets/brand-icon.png';
import { Btn } from '../../components/ui.js';
import { APP_ROUTES } from '../../lib/routes.js';
import type { CurrentUser } from '../../api/client.js';

interface PublicHeaderProps {
  user: CurrentUser | null;
}

const SECTION_IDS = ['produkt', 'funktionen', 'simulator', 'datenschutz', 'kassen', 'ueber-uns'] as const;

export function PublicHeader({ user }: PublicHeaderProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const headerRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Click outside and Escape key to close mobile menu
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  // Active section scroll spy
  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection('');
      return;
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 250;
      let current = '';

      // If scrolled near bottom of page, activate last section
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100) {
        setActiveSection('ueber-uns');
        return;
      }

      for (const id of SECTION_IDS) {
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
      padding: '6px 10px',
      border: 'none',
      fontFamily: 'inherit',
      fontSize: 13,
      cursor: 'pointer',
      transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
      whiteSpace: 'nowrap',
    };
  };

  return (
    <>
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.25)',
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
            zIndex: 95,
          }}
        />
      )}

      <header
        ref={headerRef}
        style={{
          position: 'fixed',
          top: 16,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: '0 20px',
          maxWidth: 1200,
          width: '100%',
          margin: '0 auto',
        }}
      >
        <div
          className="glass-deep"
          style={{
            borderRadius: 999,
            padding: '6px 20px 6px 16px',
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
            to={APP_ROUTES.public.home()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              textDecoration: 'none',
              color: '#22221f',
              flexShrink: 0,
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
              className="landing-research-badge"
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
              gap: 4,
            }}
            className="landing-desktop-nav"
          >
            <button onClick={() => scrollTo('produkt')} style={getNavLinkStyle('produkt')}>
              Produkt
            </button>
            <button onClick={() => scrollTo('funktionen')} style={getNavLinkStyle('funktionen')}>
              Funktionsweise
            </button>
            <button onClick={() => scrollTo('simulator')} style={getNavLinkStyle('simulator')}>
              Live-Simulator
            </button>
            <button onClick={() => scrollTo('datenschutz')} style={getNavLinkStyle('datenschutz')}>
              Datenschutz
            </button>
            <button onClick={() => scrollTo('kassen')} style={getNavLinkStyle('kassen')}>
              Krankenkassen
            </button>
            <button onClick={() => scrollTo('ueber-uns')} style={getNavLinkStyle('ueber-uns')}>
              Über uns
            </button>
          </nav>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {user ? (
              <Link to={APP_ROUTES.app.dashboard()} style={{ textDecoration: 'none' }}>
                <Btn small variant="primary">
                  Zum Dashboard →
                </Btn>
              </Link>
            ) : (
              <>
                <Link
                  to={APP_ROUTES.public.login()}
                  className="landing-header-cta-btn landing-header-login-btn"
                  style={{ textDecoration: 'none' }}
                >
                  <Btn small variant="secondary">
                    Anmelden
                  </Btn>
                </Link>
                <Link
                  to={APP_ROUTES.public.register()}
                  className="landing-header-cta-btn landing-header-register-btn"
                  style={{ textDecoration: 'none' }}
                >
                  <Btn variant="primary" small>
                    Registrieren
                  </Btn>
                </Link>
              </>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="landing-mobile-menu-btn"
              aria-label={mobileMenuOpen ? 'Menü schließen' : 'Menü öffnen'}
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
              boxShadow: '0 12px 36px rgba(15, 40, 28, 0.15)',
            }}
          >
            {/* Primary Mobile Auth CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 10, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              {user ? (
                <Link to={APP_ROUTES.app.dashboard()} onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none' }}>
                  <Btn full variant="primary">
                    Zum Dashboard →
                  </Btn>
                </Link>
              ) : (
                <>
                  <Link to={APP_ROUTES.public.register()} onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none' }}>
                    <Btn full variant="primary">
                      Kostenlos registrieren
                    </Btn>
                  </Link>
                  <Link to={APP_ROUTES.public.login()} onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none' }}>
                    <Btn full variant="secondary">
                      Anmelden
                    </Btn>
                  </Link>
                </>
              )}
            </div>

            <button onClick={() => scrollTo('produkt')} style={{ ...getNavLinkStyle('produkt'), textAlign: 'left' }}>
              Produkt
            </button>
            <button onClick={() => scrollTo('funktionen')} style={{ ...getNavLinkStyle('funktionen'), textAlign: 'left' }}>
              Funktionsweise
            </button>
            <button onClick={() => scrollTo('simulator')} style={{ ...getNavLinkStyle('simulator'), textAlign: 'left' }}>
              Live-Simulator
            </button>
            <button onClick={() => scrollTo('datenschutz')} style={{ ...getNavLinkStyle('datenschutz'), textAlign: 'left' }}>
              Datenschutz
            </button>
            <button onClick={() => scrollTo('kassen')} style={{ ...getNavLinkStyle('kassen'), textAlign: 'left' }}>
              Krankenkassen
            </button>
            <button onClick={() => scrollTo('ueber-uns')} style={{ ...getNavLinkStyle('ueber-uns'), textAlign: 'left' }}>
              Über uns
            </button>
          </div>
        )}
      </header>
    </>
  );
}
