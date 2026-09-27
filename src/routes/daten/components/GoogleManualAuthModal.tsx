import { ExternalLink } from 'lucide-react';
import { Modal, Btn, GlassInput } from '../../../components/ui.js';

interface GoogleManualAuthModalProps {
  isOpen: boolean;
  authUrl: string | null;
  code: string;
  isLoading: boolean;
  onChangeCode: (val: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export function GoogleManualAuthModal({
  isOpen,
  authUrl,
  code,
  isLoading,
  onChangeCode,
  onSubmit,
  onClose,
}: GoogleManualAuthModalProps) {
  if (!isOpen) return null;

  return (
    <Modal onClose={onClose}>
      <div style={{ fontSize: 18, fontWeight: 500, color: '#22221f', marginBottom: 12 }}>
        Google Health / Codelab-Verknüpfung
      </div>
      <p style={{ fontSize: 13, color: '#55544f', lineHeight: 1.6, marginBottom: 16 }}>
        Wenn dein Google Cloud OAuth-Client auf <code>https://www.google.com</code> eingestellt ist (Codelab-Standard), gehe wie
        folgt vor:
      </p>
      <ol style={{ fontSize: 13, color: '#22221f', lineHeight: 1.6, paddingLeft: 20, margin: '0 0 20px 0' }}>
        <li style={{ marginBottom: 8 }}>
          Klicke hier, um die Autorisierung bei Google zu starten:{' '}
          {authUrl ? (
            <a
              href={authUrl}
              target="_blank"
              rel="noreferrer"
              style={{ color: '#0f6e56', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              Google Autorisierung öffnen <ExternalLink size={14} />
            </a>
          ) : (
            <span style={{ color: '#888780' }}>Wird geladen...</span>
          )}
        </li>
        <li style={{ marginBottom: 8 }}>Melde dich an und erlaube den Zugriff auf deine Gesundheitsdaten.</li>
        <li style={{ marginBottom: 8 }}>
          Google leitet dich weiter zu <code>https://www.google.com/?code=...</code>.
        </li>
        <li>Kopiere die gesamte URL aus der Adresszeile des Browsers (oder den Code) und füge sie hier ein:</li>
      </ol>
      <div style={{ marginBottom: 20 }}>
        <GlassInput
          placeholder="https://www.google.com/?code=4/0A... oder Autorisierungscode"
          value={code}
          onChange={onChangeCode}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <Btn variant="secondary" onClick={onClose}>
          Abbrechen
        </Btn>
        <Btn onClick={onSubmit} disabled={isLoading || !code.trim()}>
          {isLoading ? 'Wird verknüpft...' : 'Verknüpfen & Synchronisieren'}
        </Btn>
      </div>
    </Modal>
  );
}
