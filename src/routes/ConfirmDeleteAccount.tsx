import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { apiClient } from '../api/client.js';
import { Card, Btn } from '../components/ui.js';
import brandIcon from '../assets/brand-icon.png';

type Status = 'confirm' | 'loading' | 'success' | 'error';

export function Component() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<Status>(token ? 'confirm' : 'error');
  const [errorTitle, setErrorTitle] = useState<string | null>(
    token ? null : 'Ungültiger Lösch-Bestätigungslink.',
  );

  function handleConfirm() {
    if (!token) return;
    setStatus('loading');
    apiClient('/account/confirm-delete', { method: 'POST', body: JSON.stringify({ token }) })
      .then(() => {
        // Clear any cached profile data so a subsequent navigation doesn't
        // briefly show stale ['me'] state for the now-deleted account.
        queryClient.clear();
        setStatus('success');
      })
      .catch((err: unknown) => {
        setErrorTitle((err as Error).message ?? 'Löschung konnte nicht bestätigt werden.');
        setStatus('error');
      });
  }

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
            {status === 'confirm' && (
              <>
                <div style={{ fontSize: 11, color: '#854f0b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>
                  Konto unwiderruflich löschen
                </div>
                <p style={{ fontSize: 13, color: '#55544f', lineHeight: 1.6, marginBottom: 24 }}>
                  Bitte bestätige, dass dein Konto und alle gespeicherten Gesundheitsdaten endgültig gelöscht werden sollen. Diese Aktion kann nicht rückgängig gemacht werden.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Btn full variant="danger" onClick={handleConfirm} testId="confirm-delete-account-button">
                    Konto endgültig löschen
                  </Btn>
                  <Link to="/login" style={{ textDecoration: 'none' }}>
                    <Btn full variant="secondary">Abbrechen</Btn>
                  </Link>
                </div>
              </>
            )}
            {status === 'loading' && (
              <div style={{ color: '#a3a29c', fontSize: 14 }}>Konto wird gelöscht…</div>
            )}
            {status === 'success' && (
              <>
                <div style={{ fontSize: 11, color: '#888780', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>
                  Konto gelöscht
                </div>
                <div data-testid="delete-account-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 32px', borderRadius: 999, background: 'rgba(29,158,117,0.10)', color: '#0f6e56', fontSize: 16, fontWeight: 500, border: '1px solid rgba(29,158,117,0.22)', marginBottom: 20 }}>
                  <AlertTriangle size={20} color="#0f6e56" />
                  <span>Konto erfolgreich gelöscht</span>
                </div>
                <p style={{ fontSize: 13, color: '#55544f', lineHeight: 1.6, marginBottom: 24 }}>
                  Dein Konto und alle gespeicherten Gesundheitsdaten wurden unwiderruflich gelöscht.
                </p>
                <Btn full testId="delete-account-back-home" onClick={() => navigate('/login?accountDeleted=true')}>
                  Zur Startseite
                </Btn>
              </>
            )}
            {status === 'error' && (
              <>
                <div style={{ fontSize: 11, color: '#854f0b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>
                  Bestätigung fehlgeschlagen
                </div>
                <p data-testid="delete-account-error" style={{ fontSize: 13, color: '#55544f', marginBottom: 24 }}>
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
