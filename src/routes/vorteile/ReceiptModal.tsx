import { useQuery } from '@tanstack/react-query';
import { Printer, ShieldCheck, FileCheck } from 'lucide-react';
import { apiClient } from '../../api/client.js';
import { Modal, Btn, Skeleton, Chip } from '../../components/ui.js';
import type { ClaimReceipt } from '../../api/types.js';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  claimId: string;
}

export function ReceiptModal({ isOpen, onClose, claimId }: ReceiptModalProps) {
  const { data: receipt, isLoading } = useQuery<ClaimReceipt>({
    queryKey: ['claim-receipt', claimId],
    queryFn: () => apiClient<ClaimReceipt>(`/claims/${claimId}/receipt`),
    enabled: isOpen && Boolean(claimId),
  });

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileCheck size={20} color="#0f6e56" />
            <div style={{ fontSize: 17, fontWeight: 600, color: '#22221f' }}>Auszahlungsbeleg</div>
          </div>
          <Chip color="green">Genehmigt ✓</Chip>
        </div>

        {isLoading ? (
          <Skeleton height={180} />
        ) : receipt ? (
          <div className="glass-deep" style={{ padding: '20px 24px', borderRadius: 14, border: '1px solid rgba(0,0,0,0.08)', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: 12, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: '#888780', textTransform: 'uppercase' }}>Belegnummer</div>
                <code style={{ fontSize: 13, fontWeight: 600, color: '#22221f' }}>{receipt.receiptNumber}</code>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: '#888780', textTransform: 'uppercase' }}>Datum</div>
                <div style={{ fontSize: 12, color: '#22221f' }}>
                  {receipt.decidedAt ? new Date(receipt.decidedAt).toLocaleDateString('de-DE') : '—'}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 12 }}>
              <div>
                <span style={{ color: '#888780' }}>Begünstigte Person:</span>
                <div style={{ fontWeight: 500, color: '#22221f' }}>{receipt.userDisplayName}</div>
              </div>
              <div>
                <span style={{ color: '#888780' }}>Krankenkasse / Partner:</span>
                <div style={{ fontWeight: 500, color: '#22221f' }}>{receipt.partnerName}</div>
              </div>
              <div>
                <span style={{ color: '#888780' }}>Prämie:</span>
                <div style={{ fontWeight: 600, color: '#0f6e56' }}>{receipt.valueLabel}</div>
              </div>
              <div>
                <span style={{ color: '#888780' }}>Kassen-Referenz:</span>
                <div style={{ fontWeight: 500, color: '#22221f' }}>{receipt.transactionRef || 'In Bearbeitung'}</div>
              </div>
              <div>
                <span style={{ color: '#888780' }}>Auszahlungsmethode:</span>
                <div style={{ fontWeight: 500, color: '#22221f' }}>
                  {receipt.payoutMethod === 'bank_transfer'
                    ? `Überweisung (${receipt.payoutIbanMasked || 'IBAN hinterlegt'})`
                    : 'Beitragsverrechnung'}
                </div>
              </div>
              {receipt.note && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ color: '#888780' }}>Vermerk der Kasse:</span>
                  <div style={{ color: '#55544f', fontStyle: 'italic', marginTop: 2 }}>{receipt.note}</div>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', marginTop: 14, paddingTop: 10, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#0f6e56' }}>
              <ShieldCheck size={13} />
              <span>Verifiziertes Zero-Knowledge Dokument · LONGEVITY Intermediary</span>
            </div>
          </div>
        ) : null}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Btn small variant="secondary" onClick={() => window.print()} testId="receipt-print-btn">
            <Printer size={13} style={{ marginRight: 6 }} /> Drucken
          </Btn>
          <Btn small variant="ghost" onClick={onClose}>Schließen</Btn>
        </div>
      </div>
    </Modal>
  );
}
