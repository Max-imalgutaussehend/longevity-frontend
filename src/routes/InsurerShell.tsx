import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client.js';
import type { User } from '../api/types.js';
import brandIcon from '../assets/brand-icon.png';

const NAV_ITEMS = [
  { to: '/insurer/overview', label: 'Übersicht' },
  { to: '/insurer/vorteile', label: 'Vorteile' },
] as const;

export function Component() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const { data: user, isLoading } = useQuery<User & { role: string }>({
    queryKey: ['me'],
    queryFn: () => apiClient('/me'),
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && user && user.role !== 'insurer_admin' && user.role !== 'insurer_staff') {
      navigate('/dashboard', { replace: true });
    }
  }, [isLoading, user, navigate]);

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

  async function handleLogout() {
    await apiClient('/auth/logout', { method: 'POST' }).catch(() => {});
    window.location.href = '/login';
  }

  if (isLoading) {
    return (
      <div className="bg-canvas" style={{ minHeight: '100vh' }}>
        <div className="bg-orb" />
        <div className="bg-orb" />
      </div>
    );
  }

  if (!user) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />;
  }

  return (
    <>
      <div className="bg-canvas">
        <div className="bg-orb" />
        <div className="bg-orb" />
      </div>

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
                })}
              >
                {item.label}
              </NavLink>
            ))}

            <span style={{ width: 1, height: 18, background: 'rgba(168,168,156,0.3)', margin: '0 6px', flexShrink: 0 }} />

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
                }}
              >
                {user?.email?.slice(0, 2).toUpperCase() ?? '??'}
              </button>

              {showProfileMenu && (
                <div style={{
                  position: 'absolute', top: 42, right: 0, width: 220,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: 16,
                  boxShadow: '0 16px 36px -8px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
                  padding: '16px', display: 'flex', flexDirection: 'column', gap: 12, zIndex: 200,
                }}>
                  <div style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#22221f' }}>Krankenkassen-Zugang</div>
                    <div style={{ fontSize: 11, color: '#888780', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.email}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    style={{
                      background: 'transparent', border: 'none', color: '#a32d2d',
                      fontSize: 12, fontWeight: 500, cursor: 'pointer', padding: '4px 6px',
                      width: '100%', textAlign: 'left', fontFamily: 'inherit',
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    <LogOut size={14} /> Abmelden
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <main className="main-content" style={{ padding: '128px 48px 60px', flex: 1 }}>
          <div style={{ maxWidth: 1060, margin: '0 auto' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}
