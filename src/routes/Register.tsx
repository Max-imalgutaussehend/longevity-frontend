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
  const [birthDate, setBirthDate] = useState('');
  const [sex, setSex] = useState<'m' | 'f' | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sex) { setError('Bitte Geschlecht auswählen.'); return; }
    setError(null);
    setLoading(true);
    try {
      await apiClient('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, birthDate, sex }) });
      navigate('/dashboard');
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Registrierung fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <img src={brandIcon} alt="Longevity" style={{ width: 120, height: 120, objectFit: 'contain', display: 'block', margin: '0 auto 20px' }} />
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
                <FieldLabel>Geburtsdatum</FieldLabel>
                <GlassInput type="date" value={birthDate} onChange={setBirthDate} testId="register-birthdate" name="birthDate" />
              </div>
              <div>
                <FieldLabel>Biologisches Geschlecht</FieldLabel>
                <p style={{ fontSize: 12, color: '#a3a29c', marginBottom: 10, lineHeight: 1.5, margin: '0 0 10px' }}>
                  Die Score-Referenzkurven sind nach Geschlecht kalibriert.
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['m', 'f'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      data-testid={`register-sex-${s}`}
                      onClick={() => setSex(s)}
                      style={{
                        flex: 1, padding: '10px', borderRadius: 12,
                        border: `1px solid ${sex === s ? 'rgba(29,158,117,0.4)' : 'rgba(0,0,0,0.1)'}`,
                        background: sex === s ? 'rgba(29,158,117,0.10)' : 'rgba(255,255,255,0.45)',
                        color: sex === s ? '#0f6e56' : '#55544f',
                        fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                        backdropFilter: 'blur(8px)',
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
      </div>
    </AuthShell>
  );
}
