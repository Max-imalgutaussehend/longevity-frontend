import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client.js';
import type { User } from '../api/types.js';
import brandIcon from '../assets/brand-icon.png';

export function Component() {
  const navigate = useNavigate();
  const location = useLocation();

  const { data: user, isLoading } = useQuery<User & { role: string }>({
    queryKey: ['me'],
    queryFn: () => apiClient('/me'),
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && user && user.role !== 'platform_admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [isLoading, user, navigate]);

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
            <span style={{ padding: '7px 15px', fontSize: 13, fontWeight: 500, color: '#0f6e56' }}>Admin</span>
            <span style={{ width: 1, height: 18, background: 'rgba(168,168,156,0.3)', margin: '0 6px', flexShrink: 0 }} />
            <button
              onClick={handleLogout}
              title="Abmelden"
              style={{
                width: 32, height: 32, borderRadius: 999,
                background: 'transparent', color: '#a32d2d',
                border: '1px solid rgba(163,45,45,0.22)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <LogOut size={14} />
            </button>
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
