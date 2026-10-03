import { useState } from 'react';
import { Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { Modal, Btn, GlassInput, FieldLabel } from '../../components/ui.js';
import type { PartnerOffer } from '../../api/types.js';

interface VoucherEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: PartnerOffer;
  defaultEmail: string;
  onSubmit: (email: string) => void;
  isPending: boolean;
}

export function VoucherEmailModal({
  isOpen,
  onClose,
  offer,
  defaultEmail,
  onSubmit,
  isPending,
}: VoucherEmailModalProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Bitte eine gültige E-Mail-Adresse angeben.');
      return;
    }
    setError(null);
    onSubmit(email.trim());
  };

  return (
    <Modal onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(29,158,117,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', color: '#0f6e56' }}>
            <Mail size={24} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 500, color: '#22221f' }}>Gutschein anfordern</div>
          <div style={{ fontSize: 13, color: '#55544f', marginTop: 4 }}>
            {offer.title} · <strong style={{ color: '#0f6e56' }}>{offer.valueLabel}</strong>
          </div>
        </div>

        <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(29,158,117,0.07)', border: '1px solid rgba(29,158,117,0.20)', display: 'flex', gap: 10 }}>
          <ShieldCheck size={18} color="#0f6e56" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 11, color: '#1d2c25', lineHeight: 1.5 }}>
            <strong>Versand per E-Mail:</strong> Dein Gutschein wird nach Prüfung durch unseren Partner direkt an die unten angegebene E-Mail-Adresse zugestellt.
          </div>
        </div>

        <div>
          <FieldLabel htmlFor="voucher-contact-email">Empfänger E-Mail-Adresse</FieldLabel>
          <GlassInput
            id="voucher-contact-email"
            type="email"
            placeholder="name@beispiel.de"
            value={email}
            onChange={setEmail}
            testId="voucher-contact-email-input"
          />
        </div>

        {error && <div style={{ fontSize: 12, color: '#a32d2d' }} data-testid="voucher-email-error">{error}</div>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
          <Btn variant="ghost" onClick={onClose}>Abbrechen</Btn>
          <Btn type="submit" testId="voucher-email-submit-btn" disabled={isPending}>
            {isPending ? 'Wird übermittelt...' : 'Gutschein per E-Mail anfordern'} <ArrowRight size={14} style={{ marginLeft: 6 }} />
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
