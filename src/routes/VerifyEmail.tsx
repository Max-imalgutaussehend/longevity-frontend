import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { apiClient } from '../api/client.js';
import { Card, Btn } from '../components/ui.js';
import brandIcon from '../assets/brand-icon.png';

type Status = 'loading' | 'success' | 'error';

export function Component() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<Status>('loading');
  const [errorTitle, setErrorTitle] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current || !token) return;
    ran.current = true;
    apiClient('/auth/verify-email', { method: 'POST', body: JSON.stringify({ token }) })
      .then(() => setStatus('success'))
      .catch((err: unknown) => {
        setErrorTitle((err as Error).message ?? 'Verifikation fehlgeschlagen.');
        setStatus('error');
      });
  }, [token]);

  return (
    <>
      <div className="bg-canvas">
        <div className="bg-orb" />
        <div className="bg-orb" />
        <div className="bg-orb" />
        <div className="bg-orb" />
      </div>
      <div style={{
        position: 'relative', zIndex: 1, minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', padding: 24,
      }}>
        <img src={brandIcon} alt="Longevity" style={{ width: 52, height: 52, objectFit: 'contain', marginBottom: 40 }} />

        <div style={{ width: '100%', maxWidth: 440 }}>
          <Card style={{ textAlign: 'center', padding: '48px 44px' }}>
            {status === 'loading' && (
              <div style={{ color: '#a3a29c', fontSize: 14 }}>Verifikationslink wird geprüft…</div>
            )}
            {status === 'success' && (
              <>
                <div style={{ fontSize: 11, color: '#888780', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>
                  E-Mail bestätigt
                </div>
                <div data-testid="verify-email-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 32px', borderRadius: 999, background: 'rgba(29,158,117,0.10)', color: '#0f6e56', fontSize: 18, fontWeight: 500, border: '1px solid rgba(29,158,117,0.22)', marginBottom: 20 }}>
                  <Check size={20} color="#0f6e56" />
                  <span>Deine E-Mail-Adresse wurde bestätigt.</span>
                </div>
                <p style={{ fontSize: 13, color: '#55544f', lineHeight: 1.6, marginBottom: 24 }}>
                  Nächster Schritt: Verbinde deine erste Datenquelle (Wearable oder Labor), um deinen individuellen Vitalitätsscore und maßgeschneiderte Hebel zu berechnen.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Link to="/daten" style={{ textDecoration: 'none' }}>
                    <Btn full testId="verify-connect-source" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      Erste Datenquelle verbinden <ArrowRight size={14} />
                    </Btn>
                  </Link>
                  <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                    <Btn full variant="secondary" testId="verify-go-dashboard">
                      Direkt zum Dashboard
                    </Btn>
                  </Link>
                </div>
              </>
            )}
            {status === 'error' && (
              <>
                <div style={{ fontSize: 11, color: '#854f0b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>
                  Verifikation fehlgeschlagen
                </div>
                <p data-testid="verify-email-error" style={{ fontSize: 13, color: '#55544f', marginBottom: 24 }}>
                  {errorTitle}
                </p>
                <div>
                  <Link to="/login"><Btn>Zur Anmeldung</Btn></Link>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
