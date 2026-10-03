import { useState } from 'react';
import { Check, Copy, ExternalLink, Gift } from 'lucide-react';
import { Modal, Btn } from '../../components/ui.js';
import type { PartnerOffer } from '../../api/types.js';

interface VoucherRevealModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: PartnerOffer;
  voucherCode: string;
}

export function VoucherRevealModal({ isOpen, onClose, offer, voucherCode }: VoucherRevealModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(voucherCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Modal onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, textAlign: 'center' }}>
        <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'rgba(29,158,117,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: '#0f6e56' }}>
          <Gift size={26} />
        </div>

        <div>
          <div style={{ fontSize: 18, fontWeight: 500, color: '#22221f' }}>Dein Gutscheincode ist bereit!</div>
          <div style={{ fontSize: 13, color: '#55544f', marginTop: 4 }}>
            {offer.title} · <strong style={{ color: '#0f6e56' }}>{offer.valueLabel}</strong>
          </div>
        </div>

        <div style={{ padding: '18px 24px', borderRadius: 14, background: 'rgba(0,0,0,0.03)', border: '2px dashed rgba(29,158,117,0.4)', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
          <div style={{ fontSize: 11, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Gutscheincode</div>
          <code style={{ fontSize: 20, fontWeight: 700, letterSpacing: '0.12em', color: '#0f6e56' }} data-testid="voucher-code-display">
            {voucherCode}
          </code>
          <Btn small variant="secondary" onClick={handleCopy} testId="voucher-copy-btn">
            {copied ? <><Check size={13} style={{ marginRight: 4 }} /> Kopiert!</> : <><Copy size={13} style={{ marginRight: 4 }} /> Code kopieren</>}
          </Btn>
        </div>

        <p style={{ fontSize: 12, color: '#888780', margin: 0 }}>
          Löse diesen Code beim Bezahlvorgang des Partners ein. Der Vorteil ist in deiner Übersicht gespeichert.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 8 }}>
          {offer.partnerUrl && (
            <a
              href={offer.partnerUrl}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <Btn variant="primary">
                Im Partnershop einlösen <ExternalLink size={13} style={{ marginLeft: 6 }} />
              </Btn>
            </a>
          )}
          <Btn variant="ghost" onClick={onClose}>Schließen</Btn>
        </div>
      </div>
    </Modal>
  );
}
