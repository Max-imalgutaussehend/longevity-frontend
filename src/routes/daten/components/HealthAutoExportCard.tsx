import { Smartphone, PauseCircle } from 'lucide-react';
import { Card, Btn, Chip, Toggle } from '../../../components/ui.js';
import type { Source } from '../../../api/types.js';
import { formatDate } from '../datenUtils.js';

interface HealthAutoExportCardProps {
  src?: Source;
  isDisconnecting: boolean;
  isTogglePending: boolean;
  onOpenModal: () => void;
  onToggle: (enabled: boolean) => void;
  onDisconnect: () => void;
}

export function HealthAutoExportCard({
  src,
  isDisconnecting,
  isTogglePending,
  onOpenModal,
  onToggle,
  onDisconnect,
}: HealthAutoExportCardProps) {
  const sampleCount = src?.sampleCount ?? 0;
  const hasSource = !!src && (src.enabled || sampleCount > 0);
  const isEnabled = !!src?.enabled;
  const isDisconnectingThis = isDisconnecting && !!src?.id;

  const borderTopColor = hasSource
    ? isEnabled
      ? '#1d9e75'
      : '#a8a89c'
    : 'rgba(0,0,0,0.08)';

  return (
    <Card
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 24,
        borderTop: `3px solid ${borderTopColor}`,
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Smartphone size={28} color="#0f6e56" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {hasSource && src?.id && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: isEnabled ? '#0f6e56' : '#888780' }}>
                  {isEnabled ? 'Aktiv' : 'Pausiert'}
                </span>
                <Toggle
                  on={isEnabled}
                  onChange={() => onToggle(!isEnabled)}
                />
              </div>
            )}
            <Chip color={hasSource ? (isEnabled ? 'teal' : 'neutral') : 'neutral'}>
              {hasSource
                ? isEnabled
                  ? `Verbunden${sampleCount > 0 ? ` (${sampleCount})` : ''}`
                  : `Deaktiviert${sampleCount > 0 ? ` (${sampleCount} pausiert)` : ''}`
                : 'Nicht eingerichtet'}
            </Chip>
          </div>
        </div>

        <div style={{ fontSize: 16, fontWeight: 500, color: '#22221f', marginBottom: 8 }}>
          Health Auto Export & Webhook (iOS & Android)
        </div>
        <div style={{ fontSize: 13, color: '#22221f', lineHeight: 1.5, marginBottom: 16 }}>
          Hintergrund-Synchronisation über iOS- (Health Auto Export) oder Android-Apps (z. B. Health Sync für Health Connect)
          via REST-Webhook.
        </div>

        {hasSource && !isEnabled && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              background: 'rgba(168,168,156,0.12)',
              border: '1px solid rgba(168,168,156,0.25)',
              fontSize: 12,
              color: '#55544f',
              marginBottom: 12,
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <PauseCircle size={14} /> Webhook-Daten sind deaktiviert und fließen aktuell nicht in deinen Score ein.
            </span>
          </div>
        )}

        <div style={{ fontSize: 12, color: '#55544f' }}>
          Letzter Sync:{' '}
          <strong style={{ color: hasSource && isEnabled ? '#0f6e56' : '#22221f', fontWeight: 500 }}>
            {formatDate(src?.lastSyncAt)}
          </strong>
        </div>
      </div>

      <div style={{ paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Btn full variant="secondary" onClick={onOpenModal}>
          Anleitung & Webhook URL
        </Btn>
        {hasSource && src?.id && (
          <>
            <Btn
              full
              variant={isEnabled ? 'secondary' : 'primary'}
              onClick={() => onToggle(!isEnabled)}
              disabled={isTogglePending}
            >
              {isEnabled ? 'Webhook-Daten deaktivieren (pausieren)' : 'Webhook-Daten aktivieren'}
            </Btn>
            <Btn
              full
              variant="danger"
              onClick={() => {
                if (window.confirm('Möchtest du die Webhook-Verbindung trennen und alle empfangenen Messwerte löschen?')) {
                  onDisconnect();
                }
              }}
              disabled={isDisconnectingThis}
            >
              {isDisconnectingThis ? 'Wird getrennt...' : 'Trennen & Daten löschen'}
            </Btn>
          </>
        )}
      </div>
    </Card>
  );
}
