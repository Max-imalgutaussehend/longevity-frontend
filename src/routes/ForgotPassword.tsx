import { useState } from 'react';
import { Link } from 'react-router-dom';
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
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient('/auth/request-password-reset', { method: 'POST', body: JSON.stringify({ email }) });
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <AuthShell>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <img src={brandIcon} alt="Longevity" style={{ width: 100, height: 100, objectFit: 'contain', display: 'block', margin: '0 auto 20px' }} />
          <div style={{ fontSize: 24, fontWeight: 500, color: '#22221f', letterSpacing: '-0.01em' }}>Passwort vergessen</div>
        </div>
        <Card style={{ padding: '36px 36px 32px' }}>
          {sent ? (
            <p data-testid="forgot-password-sent" style={{ fontSize: 13, color: '#55544f', lineHeight: 1.7, margin: 0 }}>
              Falls ein Konto mit dieser E-Mail-Adresse existiert, haben wir dir einen Link zum Zurücksetzen des Passworts geschickt. Bitte prüfe dein Postfach.
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <p style={{ fontSize: 13, color: '#55544f', margin: 0 }}>
                  Gib deine E-Mail-Adresse ein, wir schicken dir einen Link zum Zurücksetzen deines Passworts.
                </p>
                <div>
                  <FieldLabel>E-Mail</FieldLabel>
                  <GlassInput type="email" placeholder="name@domain.de" value={email} onChange={setEmail} testId="forgot-password-email" name="email" />
                </div>
                <div style={{ paddingTop: 6 }}>
                  <Btn type="submit" full testId="forgot-password-submit">{loading ? 'Einen Moment…' : 'Link senden'}</Btn>
                </div>
              </div>
            </form>
          )}
        </Card>
        <p style={{ textAlign: 'center', fontSize: 13, color: '#888780', marginTop: 20 }}>
          <Link to="/login" style={{ color: '#0f6e56', textDecoration: 'none' }}>Zurück zur Anmeldung</Link>
        </p>
      </div>
    </AuthShell>
  );
}
