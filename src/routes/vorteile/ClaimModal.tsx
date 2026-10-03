import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, ArrowRight, Building2, CreditCard } from 'lucide-react';
import { apiClient } from '../../api/client.js';
import { Modal, Btn, GlassInput, FieldLabel } from '../../components/ui.js';
import type { PartnerOffer, User } from '../../api/types.js';

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: PartnerOffer;
  user: User | undefined;
  onSuccess: () => void;
}

export function ClaimModal({ isOpen, onClose, offer, user, onSuccess }: ClaimModalProps) {
  const qc = useQueryClient();
  const isMember = Boolean(offer.organizationId && user?.organizationId === offer.organizationId);

  const [method, setMethod] = useState<'bank_transfer' | 'contribution_offset'>(
    isMember ? 'contribution_offset' : 'bank_transfer'
  );
  const [kvnr, setKvnr] = useState('');
  const [showCustomBank, setShowCustomBank] = useState(!isMember);
  const [iban, setIban] = useState('');
  const [accountHolder, setAccountHolder] = useState(user?.displayName || '');
  const [error, setError] = useState<string | null>(null);

  const claimMut = useMutation({
    mutationFn: () =>
      apiClient(`/offers/${offer.id}/claim`, {
        method: 'POST',
        body: JSON.stringify({
          payoutMethod: method,
          kvnr: kvnr.trim() || undefined,
          iban: showCustomBank && iban.trim() ? iban.trim() : undefined,
          accountHolder: showCustomBank && iban.trim() ? accountHolder.trim() : undefined,
        }),
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    claimMut.mutate();
  };

  return (
    <Modal onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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

        <div>
          <FieldLabel htmlFor="claim-kvnr">Versichertennummer (KVNR, optional)</FieldLabel>
          <GlassInput id="claim-kvnr" placeholder="z. B. A123456789" value={kvnr} onChange={setKvnr} testId="claim-kvnr-input" />
        </div>

        <div>
          <FieldLabel>Auszahlungsoption wählen</FieldLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', cursor: isMember ? 'pointer' : 'not-allowed', background: method === 'contribution_offset' ? 'rgba(29,158,117,0.08)' : 'rgba(255,255,255,0.4)', opacity: isMember ? 1 : 0.55 }}>
              <input type="radio" name="payoutMethod" checked={method === 'contribution_offset'} disabled={!isMember} onChange={() => setMethod('contribution_offset')} />
              <Building2 size={16} color="#0f6e56" />
              <div style={{ fontSize: 13, color: '#22221f' }}>
                <strong>Beitragsverrechnung</strong> (Verrechnung über Krankenkasse)
              </div>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', cursor: 'pointer', background: method === 'bank_transfer' ? 'rgba(29,158,117,0.08)' : 'rgba(255,255,255,0.4)' }}>
              <input type="radio" name="payoutMethod" checked={method === 'bank_transfer'} onChange={() => setMethod('bank_transfer')} />
              <CreditCard size={16} color="#0f6e56" />
              <div style={{ fontSize: 13, color: '#22221f' }}>
                <strong>Banküberweisung</strong> auf Girokonto
              </div>
            </label>
          </div>
        </div>

        {method === 'bank_transfer' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {isMember && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#55544f', cursor: 'pointer' }}>
                <input type="checkbox" checked={showCustomBank} onChange={(e) => setShowCustomBank(e.target.checked)} />
                Abweichende IBAN für Auszahlung angeben
              </label>
            )}
            {showCustomBank && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div>
                  <FieldLabel htmlFor="claim-iban">IBAN (optional)</FieldLabel>
                  <GlassInput id="claim-iban" placeholder="DE89 3705 0198 0000 0123 45" value={iban} onChange={setIban} testId="claim-iban-input" />
                </div>
                <div>
                  <FieldLabel htmlFor="claim-holder">Kontoinhaber</FieldLabel>
                  <GlassInput id="claim-holder" placeholder="Vorname Nachname" value={accountHolder} onChange={setAccountHolder} testId="claim-holder-input" />
                </div>
              </div>
            )}
            {!showCustomBank && (
              <div style={{ fontSize: 11, color: '#888780' }}>
                Auszahlung erfolgt auf das bei deiner Krankenkasse hinterlegte Girokonto.
              </div>
            )}
          </div>
        )}

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
