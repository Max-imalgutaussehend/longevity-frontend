import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/client.js';
import { Card, Btn, GlassInput, FieldLabel } from '../components/ui.js';
import brandIcon from '../assets/brand-icon.png';

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
      await apiClient('/auth/accept-invite', { method: 'POST', body: JSON.stringify({ token, password }) });
      navigate('/dashboard');
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Einladung konnte nicht angenommen werden.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-canvas">
        <div className="bg-orb" />
        <div className="bg-orb" />
        <div className="bg-orb" />
        <div className="bg-orb" />
      </div>
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <img src={brandIcon} alt="Longevity" style={{ width: 100, height: 100, objectFit: 'contain', display: 'block', margin: '0 auto 16px' }} />
            <div style={{ fontSize: 24, fontWeight: 500, color: '#22221f', letterSpacing: '-0.01em' }}>Krankenkassen-Zugang aktivieren</div>
          </div>
          <Card style={{ padding: '36px 36px 32px' }}>
            <p style={{ fontSize: 13, color: '#55544f', lineHeight: 1.6, marginBottom: 20 }}>
              Bitte legen Sie ein Passwort fest, um Ihren Krankenkassen-Zugang zu aktivieren.
            </p>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <FieldLabel>Passwort</FieldLabel>
                  <GlassInput type="password" placeholder="Mindestens 10 Zeichen" value={password} onChange={setPassword} testId="invite-password" name="password" />
                </div>
                <div>
                  <FieldLabel>Passwort bestätigen</FieldLabel>
                  <GlassInput type="password" placeholder="Passwort wiederholen" value={passwordConfirm} onChange={setPasswordConfirm} testId="invite-password-confirm" name="passwordConfirm" />
                </div>
                {error && <p data-testid="invite-error" style={{ color: '#a32d2d', fontSize: 13, margin: 0 }}>{error}</p>}
                <div style={{ paddingTop: 6 }}>
                  <Btn type="submit" full testId="invite-submit">{loading ? 'Einen Moment…' : 'Zugang aktivieren'}</Btn>
                </div>
              </div>
            </form>
          </Card>
          <p style={{ textAlign: 'center', fontSize: 13, color: '#888780', marginTop: 20 }}>
            Bereits aktiviert?{' '}
            <Link to="/login" style={{ color: '#0f6e56', textDecoration: 'none' }}>Anmelden</Link>
          </p>
        </div>
      </div>
    </>
  );
}
