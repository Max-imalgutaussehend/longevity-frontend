import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirm) { setError('Die Passwörter stimmen nicht überein.'); return; }
    setError(null);
    setLoading(true);
    try {
      await apiClient('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) });
      navigate('/login');
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Passwort konnte nicht zurückgesetzt werden.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <img src={brandIcon} alt="Longevity" style={{ width: 100, height: 100, objectFit: 'contain', display: 'block', margin: '0 auto 20px' }} />
          <div style={{ fontSize: 24, fontWeight: 500, color: '#22221f', letterSpacing: '-0.01em' }}>Neues Passwort setzen</div>
        </div>
        <Card style={{ padding: '36px 36px 32px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <FieldLabel>Neues Passwort</FieldLabel>
                <GlassInput type="password" placeholder="Mindestens 10 Zeichen" value={password} onChange={setPassword} testId="reset-password-input" name="password" />
              </div>
              <div>
                <FieldLabel>Passwort bestätigen</FieldLabel>
                <GlassInput type="password" placeholder="Passwort wiederholen" value={passwordConfirm} onChange={setPasswordConfirm} testId="reset-password-confirm" name="passwordConfirm" />
              </div>
              {error && <p data-testid="reset-password-error" style={{ color: '#a32d2d', fontSize: 13, margin: 0 }}>{error}</p>}
              <div style={{ paddingTop: 6 }}>
                <Btn type="submit" full testId="reset-password-submit">{loading ? 'Einen Moment…' : 'Passwort setzen'}</Btn>
              </div>
            </div>
          </form>
        </Card>
        <p style={{ textAlign: 'center', fontSize: 13, color: '#888780', marginTop: 20 }}>
          <Link to="/login" style={{ color: '#0f6e56', textDecoration: 'none' }}>Zurück zur Anmeldung</Link>
        </p>
      </div>
    </AuthShell>
  );
}
