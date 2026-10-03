import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Printer, CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import { apiClient } from '../../api/client.js';
import { Modal, Btn, Chip } from '../../components/ui.js';
import type { PartnerOffer } from '../../api/types.js';

interface CertificateWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: PartnerOffer;
  claimId?: string | null;
  verifyTokenId?: string | null;
}

const GUIDES: Record<string, string> = {
  tk: 'TK-App öffnen → Bonusprogramm → Nachweis hochladen → Dieses PDF auswählen.',
  barmer: 'Barmer-App → Bonusprogramm → Aktivität einreichen → Bestätigung hochladen.',
  aok: 'Meine AOK App / Portal → Bonusprogramm → Nachweis einreichen.',
  allianz: 'MeineAllianz Portal → Krankenversicherung → Vitalitätsnachweis übermitteln.',
  other: 'Online-Geschäftsstelle deiner Krankenkasse öffnen → Bonusprogramm / Kostenerstattung → Nachweis anhängen.',
};

export function CertificateWizardModal({ isOpen, onClose, offer, claimId, verifyTokenId }: CertificateWizardModalProps) {
  const qc = useQueryClient();
  const [selectedKasse, setSelectedKasse] = useState('tk');
  const [submitted, setSubmitted] = useState(false);

  const patchMut = useMutation({
    mutationFn: () => apiClient(`/me/claims/${claimId}`, { method: 'PATCH', body: JSON.stringify({ selfSubmitted: true, reminderDays: 14 }) }),
    onSuccess: () => {
      setSubmitted(true);
      qc.invalidateQueries({ queryKey: ['my-claims'] });
    },
  });

  if (!isOpen) return null;

  const verifyUrl = `${window.location.origin}/verify/${verifyTokenId || 'demo-token'}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(verifyUrl)}`;

  return (
    <Modal onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 500, color: '#22221f' }}>Kassen-Nachweis (§ 65a SGB V)</div>
            <div style={{ fontSize: 12, color: '#888780', marginTop: 2 }}>{offer.partnerName} · {offer.title}</div>
          </div>
          <Chip color="teal"><ShieldCheck size={12} style={{ marginRight: 4 }} /> Offiziell verifiziert</Chip>
        </div>

        {/* Certificate Card Preview */}
        <div className="glass-deep" style={{ padding: '16px 20px', borderRadius: 14, border: '1px solid rgba(29,158,117,0.3)', background: 'linear-gradient(180deg, rgba(29,158,117,0.04) 0%, rgba(255,255,255,0.7) 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: '#0f6e56', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                LONGEVITY Health Intermediary
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#22221f', marginTop: 4 }}>
                Nachweis gesundheitsbewusstes Verhalten
              </div>
              <div style={{ fontSize: 11, color: '#55544f', marginTop: 6, lineHeight: 1.5 }}>
                Bestätigt für gesetzliche & private Krankenkassen nach § 65a SGB V.
                Mit kryptografischem Ed25519-Prüfsiegel.
              </div>
              <div style={{ marginTop: 10 }}>
                <a href={verifyUrl} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#0f6e56', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  Öffentliche Prüfseite öffnen <ExternalLink size={11} />
                </a>
              </div>
            </div>
            <div style={{ textAlign: 'center', flexShrink: 0, padding: 8, background: '#fff', borderRadius: 10, border: '1px solid rgba(0,0,0,0.06)' }}>
              <img src={qrUrl} alt="Verifikations-QR-Code" style={{ width: 84, height: 84, display: 'block' }} />
              <span style={{ fontSize: 9, color: '#888780', marginTop: 4, display: 'block' }}>Scan zur Prüfung</span>
            </div>
          </div>
        </div>

        {/* Action: Print Certificate */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 10, background: 'rgba(0,0,0,0.03)' }}>
          <span style={{ fontSize: 12, color: '#55544f' }}>PDF für Upload in Kassen-App:</span>
          <Btn small variant="secondary" onClick={() => window.print()} testId="certificate-print-btn">
            <Printer size={13} style={{ marginRight: 6 }} /> Als PDF speichern / drucken
          </Btn>
        </div>

        {/* Step 2: Insurer Upload Instructions */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#22221f', marginBottom: 8 }}>Schritt-für-Schritt Upload-Anleitung</div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
            {['tk', 'barmer', 'aok', 'allianz', 'other'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setSelectedKasse(k)}
                style={{
                  padding: '4px 10px', borderRadius: 999, border: 'none', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
                  background: selectedKasse === k ? '#0f6e56' : 'rgba(0,0,0,0.06)',
                  color: selectedKasse === k ? '#fff' : '#55544f',
                }}
              >
                {k.toUpperCase()}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 12, color: '#55544f', padding: '8px 12px', background: 'rgba(255,255,255,0.6)', borderRadius: 8, border: '1px solid rgba(0,0,0,0.06)' }}>
            {GUIDES[selectedKasse]}
          </div>
        </div>

        {/* Step 3: Status Tracking */}
        {claimId && (
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 12, color: '#55544f' }}>
              {submitted ? (
                <span style={{ color: '#0f6e56', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={14} /> Eingereicht markiert · Erinnerung in 14 Tagen aktiv
                </span>
              ) : (
                'Hast du das PDF in deiner Kassen-App hochgeladen?'
              )}
            </div>
            {!submitted && (
              <Btn small onClick={() => patchMut.mutate()} disabled={patchMut.isPending} testId="mark-submitted-btn">
                <Clock size={12} style={{ marginRight: 6 }} /> Als eingereicht markieren
              </Btn>
            )}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
          <Btn variant="ghost" onClick={onClose}>Schließen</Btn>
        </div>
      </div>
    </Modal>
  );
}
