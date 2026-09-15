import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client.js';
import type { User } from '../api/types.js';
import { TutorialModal } from '../components/TutorialModal.js';
import brandIcon from '../assets/brand-icon.png';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/score',     label: 'Score' },
  { to: '/hebel',     label: 'Hebel' },
  { to: '/daten',     label: 'Daten' },
  { to: '/freigabe',  label: 'Freigabe' },
  { to: '/vorteile',  label: 'Vorteile' },
  { to: '/report',    label: 'Bericht' },
] as const;

export function Component() {
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const { data: user, isLoading: isUserLoading } = useQuery<User & { role?: string }>({
    queryKey: ['me'],
    queryFn: () => apiClient('/me'),
  });

  useEffect(() => {
    if (!isUserLoading && user && (user.role === 'insurer_admin' || user.role === 'insurer_staff')) {
      navigate('/insurer/overview', { replace: true });
    }
  }, [isUserLoading, user, navigate]);

  // Auto-launch tutorial on first visit if not yet completed
  useEffect(() => {
    const hasCompleted = localStorage.getItem('longevity_tutorial_completed');
    if (!hasCompleted) {
      // Small timeout for smooth initial render
      const timer = setTimeout(() => setShowTutorial(true), 400);
      return () => clearTimeout(timer);
    }
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showProfileMenu]);

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? '??';

  async function handleLogout() {
    await apiClient('/auth/logout', { method: 'POST' }).catch(() => {});
    window.location.href = '/login';
  }

  return (
    <>
      {/* Animated background */}
      <div className="bg-canvas">
        <div className="bg-orb" />
        <div className="bg-orb" />
      </div>

      {/* Hover-reveal pill nav */}
      <div className="pill-nav-wrap">
        <div className="pill-nav-trigger" aria-hidden="true" />
        <div className="pill-nav-bar">
          <nav className="pill-nav" style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '5px 6px', borderRadius: 999 }}>
            <span style={{ display: 'flex', alignItems: 'center', padding: '2px 12px 2px 6px', borderRight: '1px solid rgba(29,158,117,0.18)', marginRight: 4 }}>
              <img src={brandIcon} alt="Longevity" style={{ width: 36, height: 36, objectFit: 'contain' }} />
            </span>

            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  padding: '7px 15px', borderRadius: 999,
                  textDecoration: 'none',
                  background: isActive ? 'rgba(29,158,117,0.12)' : 'transparent',
                  color: isActive ? '#0f6e56' : '#55544f',
                  fontWeight: isActive ? 500 : 400,
                  fontSize: 13,
                  whiteSpace: 'nowrap' as const,
                  transition: 'background 0.15s, color 0.15s',
                  boxShadow: isActive ? '0 0 0 1px rgba(29,158,117,0.22) inset' : 'none',
                })}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  if (!el.classList.contains('active')) el.style.background = 'rgba(255,255,255,0.55)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  if (!el.classList.contains('active')) el.style.background = 'transparent';
                }}
              >
                {item.label}
              </NavLink>
            ))}

            <span style={{ width: 1, height: 18, background: 'rgba(168,168,156,0.3)', margin: '0 6px', flexShrink: 0 }} />

            {/* Profile Avatar Trigger */}
            <div style={{ position: 'relative' }} ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu((prev) => !prev)}
                title="Profil & Einstellungen"
                style={{
                  width: 32, height: 32, borderRadius: 999,
                  background: showProfileMenu ? '#0f6e56' : 'rgba(29,158,117,0.12)',
                  color: showProfileMenu ? '#fff' : '#0f6e56',
                  fontSize: 11, fontWeight: 500,
                  border: '1px solid rgba(29,158,117,0.22)',
                  cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
              >
                {initials}
              </button>

              {/* Profile Glass Popover Menu */}
              {showProfileMenu && (
                <div style={{
                  position: 'absolute',
                  top: 42,
                  right: 0,
                  width: 250,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: 16,
                  boxShadow: '0 16px 36px -8px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  zIndex: 200,
                  animation: 'fadeIn 0.15s ease',
                }}>
                  <div style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#22221f' }}>
                      {user?.displayName || 'Mein Konto'}
                    </div>
                    <div style={{ fontSize: 11, color: '#888780', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.email}
                    </div>
                    {user?.birthDate && (
                      <div style={{ fontSize: 11, color: '#55544f', marginTop: 4 }}>
                        Geboren: {new Date(user.birthDate).toLocaleDateString('de-DE')} ({user.sex === 'm' ? 'M' : 'W'})
                      </div>
                    )}
                  </div>

                  {/* Tutorial launch button */}
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowTutorial(true);
                    }}
                    style={{
                      background: 'rgba(29,158,117,0.08)',
                      border: '1px solid rgba(29,158,117,0.2)',
                      borderRadius: 10,
                      padding: '8px 12px',
                      color: '#0f6e56',
                      fontSize: 12,
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                      transition: 'background 0.15s',
                    }}
                  >
                    <span>✨</span>
                    <span>Interaktives Tutorial</span>
                  </button>

                  {/* Legal Links */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 8 }}>
                    <Link
                      to="/impressum"
                      onClick={() => setShowProfileMenu(false)}
                      style={{ color: '#55544f', textDecoration: 'none', padding: '4px 6px', borderRadius: 6 }}
                    >
                      ⚖️ Impressum & Disclaimer
                    </Link>
                    <Link
                      to="/datenschutz"
                      onClick={() => setShowProfileMenu(false)}
                      style={{ color: '#55544f', textDecoration: 'none', padding: '4px 6px', borderRadius: 6 }}
                    >
                      🛡️ Datenschutzerklärung
                    </Link>
                  </div>

                  {/* Logout */}
                  <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 8 }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#a32d2d',
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: 'pointer',
                        padding: '4px 6px',
                        width: '100%',
                        textAlign: 'left',
                        fontFamily: 'inherit',
                      }}
                    >
                      🚪 Abmelden
                    </button>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Page content & Footer */}
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <main className="main-content" style={{ padding: '128px 48px 60px', flex: 1 }}>
          <div style={{ maxWidth: 1060, margin: '0 auto' }}>
            <Outlet />

            {/* Subtle, elegant footer */}
            <footer style={{
              marginTop: 80,
              paddingTop: 24,
              borderTop: '1px solid rgba(0,0,0,0.06)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              fontSize: 12,
              color: '#888780',
            }}>
              <div>
                <strong style={{ color: '#55544f' }}>LONGEVITY</strong> · Wissenschaftlich fundiertes Vitalitäts-Tracking (DHBW)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <button
                  type="button"
                  onClick={() => setShowTutorial(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0f6e56',
                    cursor: 'pointer',
                    fontSize: 12,
                    padding: 0,
                    fontWeight: 500,
                    fontFamily: 'inherit',
                  }}
                >
                  ✨ Tutorial ansehen
                </button>
                <span>·</span>
                <Link to="/impressum" style={{ color: '#55544f', textDecoration: 'none' }}>Impressum</Link>
                <span>·</span>
                <Link to="/datenschutz" style={{ color: '#55544f', textDecoration: 'none' }}>Datenschutz</Link>
              </div>
            </footer>
          </div>
        </main>
      </div>

      {/* Interactive Onboarding Tutorial Modal */}
      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
    </>
  );
}

