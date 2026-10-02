import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { fetchCurrentUser, type CurrentUser } from '../api/client.js';
import { PublicHeader } from './public/PublicHeader.js';
import { PublicFooter } from './public/PublicFooter.js';

/**
 * Public layout shell wrapping public pages (Landing, Impressum, Datenschutz).
 * Provides responsive floating header, background ambient canvas, and footer.
 */
export function Component() {
  const location = useLocation();
  const [user, setUser] = useState<CurrentUser | null>(null);

  // Check authentication safely without triggering 401 redirect
  useEffect(() => {
    let active = true;
    fetchCurrentUser().then((currentUser) => {
      if (active) {
        setUser(currentUser);
      }
    });
    return () => {
      active = false;
    };
  }, [location.pathname]);

  const scrollTo = (id: string) => {
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Background canvas */}
      <div className="bg-canvas" style={{ zIndex: 0 }}>
        <div className="bg-orb" />
        <div className="bg-orb" />
      </div>

      <PublicHeader user={user} />

      {/* Main Page Body */}
      <main style={{ flex: 1, position: 'relative', zIndex: 1, paddingTop: isHome ? 0 : 96 }}>
        <Outlet context={{ user }} />
      </main>

      <PublicFooter onScrollTo={scrollTo} />
    </div>
  );
}

export { Component as PublicShell };
export default Component;
