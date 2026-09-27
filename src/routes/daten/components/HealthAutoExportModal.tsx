import { useState } from 'react';
import { Check } from 'lucide-react';
import { Modal, Btn } from '../../../components/ui.js';

interface HealthAutoExportModalProps {
  isOpen: boolean;
  webhookUrl: string;
  onClose: () => void;
}

export function HealthAutoExportModal({
  isOpen,
  webhookUrl,
  onClose,
}: HealthAutoExportModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal onClose={onClose}>
      <div style={{ fontSize: 18, fontWeight: 500, color: '#22221f', marginBottom: 12 }}>
        Health Auto Export Setup
      </div>
      <p style={{ fontSize: 13, color: '#22221f', lineHeight: 1.6, marginBottom: 20 }}>
        Verwende die iOS-App <strong style={{ color: '#0f6e56' }}>Health Auto Export</strong> und konfiguriere folgende URL als
        REST-Webhook:
      </p>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 24 }}>
        <code
          style={{
            flex: 1,
            padding: '10px 14px',
            background: 'rgba(29,158,117,0.06)',
            borderRadius: 12,
            fontSize: 12,
            color: '#0f6e56',
            fontWeight: 500,
            wordBreak: 'break-all',
            border: '1px solid rgba(29,158,117,0.2)',
          }}
        >
          {webhookUrl}
        </code>
        <Btn small variant="secondary" onClick={handleCopy}>
          {copied ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Check size={14} /> Kopiert
            </span>
          ) : (
            'Kopieren'
          )}
        </Btn>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Btn onClick={onClose}>Schließen</Btn>
      </div>
    </Modal>
  );
}
