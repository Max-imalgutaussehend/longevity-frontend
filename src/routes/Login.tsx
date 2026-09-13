import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/client.js';
import { Card, Btn, GlassInput, FieldLabel } from '../components/ui.js';
import brandIcon from '../assets/brand-icon.png';

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="bg-canvas">
        <div className="bg-orb" />
        <div className="bg-orb" />
        <div className="bg-orb" />
        <div className="bg-orb" />
      </div>
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        {children}
      </div>
    </>
  );
}

export function Component() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    if (err === 'google_auth_failed') setError('Google-Anmeldung fehlgeschlagen.');
    if (err === 'no_email') setError('Keine E-Mail von Google erhalten.');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiClient('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      const returnTo = new URLSearchParams(window.location.search).get('returnTo') ?? '/dashboard';
      navigate(returnTo);
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Anmeldung fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const data = await apiClient<{ url: string | null }>('/auth/google/url', { method: 'POST' });
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch {
      setError('Google Login konnte nicht gestartet werden.');
    }
  };

  return (
    <AuthShell>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <img src={brandIcon} alt="Longevity" style={{ width: 120, height: 120, objectFit: 'contain', display: 'block', margin: '0 auto 20px' }} />
          <div style={{ fontSize: 24, fontWeight: 500, color: '#22221f', letterSpacing: '-0.01em' }}>Willkommen zurück</div>
        </div>
        <Card style={{ padding: '36px 36px 32px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <FieldLabel>E-Mail</FieldLabel>
                <GlassInput type="email" placeholder="name@domain.de" value={email} onChange={setEmail} testId="login-email" name="email" />
              </div>
              <div>
                <FieldLabel>Passwort</FieldLabel>
                <GlassInput type="password" placeholder="Mindestens 10 Zeichen" value={password} onChange={setPassword} testId="login-password" name="password" />
              </div>
              {error && <p style={{ color: '#a32d2d', fontSize: 13, margin: 0 }}>{error}</p>}
              <div style={{ paddingTop: 6 }}>
                <Btn type="submit" full testId="login-submit">{loading ? 'Einen Moment…' : 'Anmelden'}</Btn>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', margin: '6px 0 2px', gap: 10 }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.08)' }} />
                <span style={{ fontSize: 12, color: '#888780' }}>oder</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.08)' }} />
              </div>
              <Btn
                type="button"
                full
                variant="secondary"
                onClick={handleGoogleLogin}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                Mit Google anmelden
              </Btn>
            </div>
          </form>
        </Card>
        <p style={{ textAlign: 'center', fontSize: 13, color: '#888780', marginTop: 20 }}>
          Noch kein Konto?{' '}
          <Link to="/register" style={{ color: '#0f6e56', textDecoration: 'none' }}>Registrieren</Link>
        </p>
      </div>
    </AuthShell>
  );
}
