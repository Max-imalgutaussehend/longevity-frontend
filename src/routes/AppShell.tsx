import { Outlet, NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client.js';
import type { User } from '../api/types.js';
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
  const { data: user } = useQuery<User>({
    queryKey: ['me'],
    queryFn: () => apiClient<User>('/me'),
  });

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

            <button
              onClick={handleLogout}
              title="Abmelden"
              style={{
                width: 32, height: 32, borderRadius: 999,
                background: 'rgba(29,158,117,0.12)', color: '#0f6e56',
                fontSize: 11, fontWeight: 500,
                border: '1px solid rgba(29,158,117,0.22)',
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {initials}
            </button>
          </nav>
        </div>
      </div>

      {/* Page content */}
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        <main style={{ padding: '128px 48px 80px' }}>
          <div style={{ maxWidth: 1060, margin: '0 auto' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}
