import { useState } from 'react';
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
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [sex, setSex] = useState<'m' | 'f' | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sex) { setError('Bitte Geschlecht auswählen.'); return; }
    if (password !== passwordConfirm) { setError('Die Passwörter stimmen nicht überein.'); return; }
    setError(null);
    setLoading(true);
    try {
      await apiClient('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, birthDate, sex }) });
      sessionStorage.setItem('longevity_auto_open_tutorial', 'true');
      setRegistered(true);
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Registrierung fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <AuthShell>
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <img src={brandIcon} alt="Longevity" style={{ width: 100, height: 100, objectFit: 'contain', display: 'block', margin: '0 auto 16px' }} />
          </div>
          <Card style={{ padding: '36px 36px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#888780', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
              Fast geschafft
            </div>
            <div style={{ fontSize: 16, fontWeight: 500, color: '#22221f', marginBottom: 12 }}>
              Bitte bestätige deine E-Mail-Adresse
            </div>
            <p style={{ fontSize: 13, color: '#55544f', lineHeight: 1.7, marginBottom: 24 }}>
              Wir haben dir einen Bestätigungslink an <strong>{email}</strong> geschickt. Öffne die E-Mail und klicke auf den Link, um dein Konto vollständig zu nutzen.
            </p>
            <Btn full testId="register-go-dashboard" onClick={() => {
              sessionStorage.setItem('longevity_auto_open_tutorial', 'true');
              navigate('/dashboard');
            }}>Weiter zum Dashboard</Btn>
          </Card>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <img src={brandIcon} alt="Longevity" style={{ width: 100, height: 100, objectFit: 'contain', display: 'block', margin: '0 auto 16px' }} />
          <div style={{ fontSize: 24, fontWeight: 500, color: '#22221f', letterSpacing: '-0.01em' }}>Konto erstellen</div>
        </div>
        <Card style={{ padding: '36px 36px 32px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <FieldLabel>E-Mail</FieldLabel>
                <GlassInput type="email" placeholder="name@domain.de" value={email} onChange={setEmail} testId="register-email" name="email" />
              </div>
              <div>
                <FieldLabel>Passwort</FieldLabel>
                <GlassInput type="password" placeholder="Mindestens 10 Zeichen" value={password} onChange={setPassword} testId="register-password" name="password" />
              </div>
              <div>
                <FieldLabel>Passwort bestätigen</FieldLabel>
                <GlassInput type="password" placeholder="Passwort wiederholen" value={passwordConfirm} onChange={setPasswordConfirm} testId="register-password-confirm" name="passwordConfirm" />
              </div>
              <div>
                <FieldLabel>Geburtsdatum</FieldLabel>
                <GlassInput type="date" value={birthDate} onChange={setBirthDate} testId="register-birthdate" name="birthDate" />
              </div>
              <div>
                <FieldLabel>Biologisches Geschlecht (für Score-Referenzkurven)</FieldLabel>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {(['m', 'f'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      data-testid={`register-sex-${s}`}
                      onClick={() => setSex(s)}
                      style={{
                        padding: '9px 12px',
                        borderRadius: 8,
                        border: sex === s ? '2px solid #0f6e56' : '1px solid rgba(0,0,0,0.12)',
                        background: sex === s ? 'rgba(15,110,86,0.08)' : 'rgba(255,255,255,0.7)',
                        color: sex === s ? '#0f6e56' : '#55544f',
                        fontWeight: sex === s ? 500 : 400,
                        cursor: 'pointer',
                        fontSize: 13,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {s === 'm' ? 'Männlich' : 'Weiblich'}
                    </button>
                  ))}
                </div>
              </div>
              {error && <p data-testid="register-error" style={{ color: '#a32d2d', fontSize: 13, margin: 0 }}>{error}</p>}
              <div style={{ paddingTop: 6 }}>
                <Btn type="submit" full testId="register-submit">{loading ? 'Einen Moment…' : 'Konto erstellen'}</Btn>
              </div>
            </div>
          </form>
        </Card>
        <p style={{ textAlign: 'center', fontSize: 13, color: '#888780', marginTop: 20 }}>
          Bereits registriert?{' '}
          <Link to="/login" style={{ color: '#0f6e56', textDecoration: 'none' }}>Anmelden</Link>
        </p>
        <p style={{ textAlign: 'center', fontSize: 11, color: '#a3a29c', marginTop: 16 }}>
          <Link to="/impressum" style={{ color: '#a3a29c', textDecoration: 'none' }}>Impressum</Link>
          {' · '}
          <Link to="/datenschutz" style={{ color: '#a3a29c', textDecoration: 'none' }}>Datenschutz</Link>
        </p>
      </div>
    </AuthShell>
  );
}
