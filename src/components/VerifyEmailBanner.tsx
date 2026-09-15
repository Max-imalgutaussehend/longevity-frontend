import { useState } from 'react';
import { apiClient } from '../api/client.js';

export function VerifyEmailBanner() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function handleResend() {
    setStatus('sending');
    try {
      await apiClient('/auth/resend-verification', { method: 'POST' });
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div
      data-testid="verify-email-banner"
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
        padding: '12px 20px', marginBottom: 24, borderRadius: 12,
        background: 'rgba(133,79,11,0.08)', border: '1px solid rgba(133,79,11,0.2)',
        fontSize: 13, color: '#854f0b',
      }}
    >
      <span>
        {status === 'sent'
          ? 'Bestätigungslink erneut gesendet — bitte prüfe dein Postfach.'
          : 'Bitte bestätige deine E-Mail-Adresse, um dein Konto vollständig zu nutzen.'}
      </span>
      {status !== 'sent' && (
        <button
          type="button"
          data-testid="verify-email-resend"
          onClick={handleResend}
          disabled={status === 'sending'}
          style={{
            background: 'transparent', border: '1px solid rgba(133,79,11,0.4)', borderRadius: 8,
            padding: '6px 14px', color: '#854f0b', fontSize: 12, fontWeight: 500,
            cursor: status === 'sending' ? 'default' : 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
          }}
        >
          {status === 'sending' ? 'Wird gesendet…' : status === 'error' ? 'Erneut versuchen' : 'Link erneut senden'}
        </button>
      )}
    </div>
  );
}
