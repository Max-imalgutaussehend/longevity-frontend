import { useState } from 'react';
import { Modal, Btn, GlassInput, FieldLabel } from '../../components/ui.js';
import type { InsurerClaim } from '../../api/types.js';

interface ClaimDecideModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: InsurerClaim;
  decision: 'processing' | 'accepted' | 'rejected';
  onConfirm: (payload: { decision: 'processing' | 'accepted' | 'rejected'; transactionRef?: string; note?: string; rejectionReason?: string }) => void;
  isPending: boolean;
}

export function ClaimDecideModal({ isOpen, onClose, claim, decision, onConfirm, isPending }: ClaimDecideModalProps) {
  const [transactionRef, setTransactionRef] = useState('');
  const [note, setNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  if (!isOpen) return null;

  const isAccept = decision === 'accepted';
  const isProcessing = decision === 'processing';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      decision,
      transactionRef: isAccept && transactionRef.trim() ? transactionRef.trim() : undefined,
      note: (isAccept || isProcessing) && note.trim() ? note.trim() : undefined,
      rejectionReason: decision === 'rejected' && rejectionReason.trim() ? rejectionReason.trim() : undefined,
    });
  };

  return (
    <Modal onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 500, color: '#22221f' }}>
            {isProcessing ? 'Antrag in Bearbeitung setzen' : isAccept ? 'Einreichung genehmigen' : 'Einreichung ablehnen'}
          </div>
          <div style={{ fontSize: 13, color: '#55544f', marginTop: 4 }}>
            {claim.offerTitle} · {claim.userDisplayName || claim.userEmail}
          </div>
        </div>

        {isProcessing && (
          <div>
            <FieldLabel htmlFor="claim-note">Bearbeitungsvermerk / interne Notiz (optional)</FieldLabel>
            <GlassInput id="claim-note" placeholder="z. B. Nachweis an Fachabteilung weitergeleitet" value={note} onChange={setNote} testId="claim-decide-note" />
          </div>
        )}

        {isAccept && (
          <>
            <div>
              <FieldLabel htmlFor="claim-tx-ref">Kassen-Vorgangsnummer / Referenz (optional)</FieldLabel>
              <GlassInput id="claim-tx-ref" placeholder="z. B. TK-2026-8812" value={transactionRef} onChange={setTransactionRef} testId="claim-decide-tx-ref" />
            </div>
            <div>
              <FieldLabel htmlFor="claim-note">Auszahlungsvermerk / Notiz (optional)</FieldLabel>
              <GlassInput id="claim-note" placeholder="z. B. Zur Auszahlung angewiesen" value={note} onChange={setNote} testId="claim-decide-note" />
            </div>
          </>
        )}

        {decision === 'rejected' && (
          <div>
            <FieldLabel htmlFor="claim-reject-reason">Ablehnungsgrund (wird dem Mitglied angezeigt)</FieldLabel>
            <GlassInput id="claim-reject-reason" placeholder="z. B. Nachweis unvollständig oder Mindestlaufzeit nicht erreicht" value={rejectionReason} onChange={setRejectionReason} testId="claim-decide-reason" />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
          <Btn variant="ghost" onClick={onClose}>Abbrechen</Btn>
          <Btn type="submit" variant={decision === 'rejected' ? 'danger' : 'primary'} testId="claim-decide-confirm-btn" disabled={isPending}>
            {isPending ? 'Wird gespeichert...' : isProcessing ? 'In Bearbeitung setzen' : isAccept ? 'Prämie bestätigen' : 'Ablehnen bestätigen'}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
