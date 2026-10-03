import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, ArrowRight, Building2 } from 'lucide-react';
import { apiClient } from '../../api/client.js';
import { Modal, Btn } from '../../components/ui.js';
import type { PartnerOffer, User } from '../../api/types.js';

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: PartnerOffer;
  user?: User | undefined;
  onSuccess: () => void;
}

export function ClaimModal({ isOpen, onClose, offer, onSuccess }: ClaimModalProps) {
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const claimMut = useMutation({
    mutationFn: () =>
      apiClient(`/offers/${offer.id}/claim`, {
        method: 'POST',
        body: JSON.stringify({ payoutMethod: 'contribution_offset' }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['offers'] });
      qc.invalidateQueries({ queryKey: ['my-claims'] });
      onSuccess();
      onClose();
    },
    onError: (err: unknown) => {
      setError((err as Error).message || 'Einreichung fehlgeschlagen. Bitte Angaben prüfen.');
    },
  });

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); claimMut.mutate(); }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 500, color: '#22221f' }}>Prämie beantragen</div>
          <div style={{ fontSize: 13, color: '#55544f', marginTop: 4 }}>
            {offer.title} · <strong style={{ color: '#0f6e56' }}>{offer.valueLabel}</strong>
          </div>
        </div>

        <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(29,158,117,0.07)', border: '1px solid rgba(29,158,117,0.20)', display: 'flex', gap: 10 }}>
          <ShieldCheck size={18} color="#0f6e56" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 11, color: '#1d2c25', lineHeight: 1.5 }}>
            <strong>Zero-Knowledge Schutz:</strong> Der Krankenkasse wird ausschließlich dein qualifiziertes Score-Band und die Haltedauer übermittelt – <em>keine medizinischen Daten</em>.
          </div>
        </div>

        <div style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Building2 size={20} color="#0f6e56" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 13, color: '#22221f', lineHeight: 1.5 }}>
            <strong>Auszahlung direkt über deine Krankenkasse ({offer.partnerName})</strong>
            <div style={{ fontSize: 12, color: '#55544f', marginTop: 4 }}>
              Da du als Mitglied verifiziert bist, wird die Prämie direkt mit deinen Beiträgen verrechnet bzw. auf dein bei der Kasse hinterlegtes Konto angewiesen. Es ist keine Eingabe von Bank- oder Versichertendaten erforderlich.
            </div>
          </div>
        </div>

        {error && <div style={{ fontSize: 12, color: '#a32d2d' }} data-testid="claim-error">{error}</div>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
          <Btn variant="ghost" onClick={onClose}>Abbrechen</Btn>
          <Btn type="submit" testId="claim-submit-btn" disabled={claimMut.isPending}>
            {claimMut.isPending ? 'Wird übermittelt...' : 'Prämie jetzt beantragen'} <ArrowRight size={14} style={{ marginLeft: 6 }} />
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
