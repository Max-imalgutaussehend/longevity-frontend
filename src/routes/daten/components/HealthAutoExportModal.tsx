import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, RefreshCw, KeyRound } from 'lucide-react';
import { Modal, Btn } from '../../../components/ui.js';
import { apiClient } from '../../../api/client.js';

interface HealthAutoExportModalProps {
  isOpen: boolean;
  webhookUrl?: string;
  onClose: () => void;
}

export function buildHealthAutoExportWebhookUrl(baseUrl?: string, secret?: string): string {
  const base = (baseUrl || window.location.origin).replace(/\/+$/, '');
  if (!secret) {
    return `${base}/api/sources/health-auto-export/webhook`;
  }
  return `${base}/api/sources/health-auto-export/webhook/${secret}`;
}

export function HealthAutoExportModal({
  isOpen,
  webhookUrl: fallbackWebhookUrl,
  onClose,
}: HealthAutoExportModalProps) {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [rotateConfirm, setRotateConfirm] = useState(false);

  const { data: secretData, isLoading } = useQuery<{ webhookSecret: string; webhookUrl: string }>({
    queryKey: ['sources', 'health-auto-export', 'secret'],
    queryFn: () => apiClient<{ webhookSecret: string; webhookUrl: string }>('/sources/health-auto-export/secret'),
    enabled: isOpen,
  });

  const rotateMutation = useMutation({
    mutationFn: () =>
      apiClient<{ webhookSecret: string; webhookUrl: string }>('/sources/health-auto-export/secret/rotate', {
        method: 'POST',
      }),
    onSuccess: (newData) => {
      queryClient.setQueryData(['sources', 'health-auto-export', 'secret'], newData);
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setRotateConfirm(false);
    },
  });

  if (!isOpen) return null;

  const currentWebhookUrl =
    secretData?.webhookUrl ||
    (secretData?.webhookSecret
      ? buildHealthAutoExportWebhookUrl(
          typeof window !== 'undefined' ? window.location.origin : undefined,
          secretData.webhookSecret,
        )
      : undefined) ||
    fallbackWebhookUrl ||
    buildHealthAutoExportWebhookUrl();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentWebhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRotate = () => {
    rotateMutation.mutate();
  };

  return (
    <Modal onClose={onClose}>
      <div style={{ fontSize: 18, fontWeight: 500, color: '#22221f', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <KeyRound size={20} color="#0f6e56" /> Health Auto Export Setup
      </div>
      <p style={{ fontSize: 13, color: '#22221f', lineHeight: 1.6, marginBottom: 16 }}>
        Verwende die iOS-App <strong style={{ color: '#0f6e56' }}>Health Auto Export</strong> und konfiguriere folgende URL als
        REST-Webhook (POST):
      </p>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
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
          {isLoading ? 'Lade Webhook-URL...' : currentWebhookUrl}
        </code>
        <Btn small variant="secondary" onClick={handleCopy} disabled={isLoading}>
          {copied ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Check size={14} /> Kopiert
            </span>
          ) : (
            'Kopieren'
          )}
        </Btn>
      </div>

      <div
        style={{
          padding: '12px 14px',
          borderRadius: 10,
          background: '#f8f8f6',
          border: '1px solid rgba(0,0,0,0.06)',
          fontSize: 12,
          color: '#55544f',
          lineHeight: 1.5,
          marginBottom: 20,
        }}
      >
        <strong>Hinweis:</strong> Die Webhook-URL enthält dein persönliches Authentifizierungs-Token.
        Dadurch kann Health Auto Export im Hintergrund Messwerte übertragen, ohne dass eine aktive Browser-Sitzung
        oder ein Cookie erforderlich ist. Halte diese URL geheim.
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          paddingTop: 16,
        }}
      >
        {rotateConfirm ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Btn
              small
              variant="danger"
              onClick={handleRotate}
              disabled={rotateMutation.isPending}
            >
              {rotateMutation.isPending ? 'Wird rotiert...' : 'Ja, Secret rotieren'}
            </Btn>
            <Btn
              small
              variant="secondary"
              onClick={() => setRotateConfirm(false)}
              disabled={rotateMutation.isPending}
            >
              Abbrechen
            </Btn>
          </div>
        ) : (
          <Btn
            small
            variant="secondary"
            onClick={() => setRotateConfirm(true)}
            disabled={isLoading || rotateMutation.isPending}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <RefreshCw size={13} /> Secret neu generieren
            </span>
          </Btn>
        )}
        <Btn onClick={onClose}>Schließen</Btn>
      </div>
    </Modal>
  );
}
