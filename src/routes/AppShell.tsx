import { Outlet, NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client.js';
import type { User } from '../api/generated.js';

export function Component() {
  useQuery<User>({
    queryKey: ['me'],
    queryFn: () => apiClient<User>('/me'),
  });

  const navItems = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/score', label: 'Score' },
    { to: '/hebel', label: 'Hebel' },
    { to: '/daten', label: 'Daten' },
    { to: '/freigabe', label: 'Freigabe' },
    { to: '/vorteile', label: 'Vorteile' },
    { to: '/report', label: 'Bericht' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={{
        width: 220, flexShrink: 0, borderRight: '1px solid var(--neutral-200)',
        background: 'var(--neutral-0)', padding: '24px 0', display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ padding: '0 16px 24px', fontWeight: 500, fontSize: 15 }}>LONGEVITY</div>
        {navItems.map(item => (
          <NavLink
            key={item.to} to={item.to}
            style={({ isActive }) => ({
              display: 'block', padding: '8px 16px', textDecoration: 'none',
              color: isActive ? 'var(--accent-600)' : 'var(--neutral-700)',
              background: isActive ? 'var(--accent-50)' : 'transparent',
              fontSize: 14,
            })}
          >
            {item.label}
          </NavLink>
        ))}
        <div style={{ marginTop: 'auto', padding: '16px' }}>
          <button
            onClick={async () => { await apiClient('/auth/logout', { method: 'POST' }); window.location.href = '/login'; }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neutral-500)', fontSize: 12 }}
          >
            Abmelden
          </button>
        </div>
      </nav>
      <main style={{ flex: 1, maxWidth: 1040, padding: 32 }}>
        <Outlet />
      </main>
    </div>
  );
}
