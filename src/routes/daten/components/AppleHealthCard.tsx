import { Dices, PauseCircle, AlertTriangle } from 'lucide-react';
import { Card, Btn, Chip, Toggle } from '../../../components/ui.js';
import { AppleLogo } from '../../../components/BrandLogos.js';
import type { Source } from '../../../api/types.js';
import { formatDate } from '../datenUtils.js';

interface AppleHealthCardProps {
  src?: Source;
  isUploading: boolean;
  isDisconnecting: boolean;
  isTogglePending: boolean;
  isGeneratingMock: boolean;
  onUploadClick: () => void;
  onToggle: (enabled: boolean) => void;
  onDisconnect: () => void;
  onGenerateMock: () => void;
}

export function AppleHealthCard({
  src,
  isUploading,
  isDisconnecting,
  isTogglePending,
  isGeneratingMock,
  onUploadClick,
  onToggle,
  onDisconnect,
  onGenerateMock,
}: AppleHealthCardProps) {
  const isMock = src?.adapter === 'mock';
  const sampleCount = src?.sampleCount ?? 0;
  const hasSource = !!src && (src.enabled || sampleCount > 0);
  const isEnabled = !!src?.enabled;
  const isDisconnectingThis = isDisconnecting && !!src?.id;

  const borderTopColor = hasSource
    ? isEnabled
      ? isMock
        ? '#d97706'
        : '#1d9e75'
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
          <AppleLogo size={28} color="#0f6e56" />
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
            <Chip color={hasSource ? (isEnabled ? (isMock ? 'amber' : 'teal') : 'neutral') : 'neutral'}>
              {hasSource
                ? isEnabled
                  ? isMock
                    ? `Mock-Daten aktiv${sampleCount > 0 ? ` (${sampleCount})` : ''}`
                    : `Importiert${sampleCount > 0 ? ` (${sampleCount})` : ''}`
                  : `Deaktiviert${sampleCount > 0 ? ` (${sampleCount} pausiert)` : ''}`
                : 'Nicht verbunden'}
            </Chip>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
          <span style={{ fontSize: 16, fontWeight: 500, color: '#22221f' }}>Apple Health</span>
          {isMock && hasSource ? (
            <span style={{
              fontSize: 11,
              padding: '2px 8px',
              borderRadius: 999,
              background: 'rgba(239,108,0,0.10)',
              color: '#c2410c',
              border: '1px solid rgba(239,108,0,0.25)',
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}>
              <AlertTriangle size={12} color="#c2410c" />
              Mock · Nicht kassenfähig
            </span>
          ) : (
            <span style={{
              fontSize: 11,
              padding: '2px 8px',
              borderRadius: 999,
              background: 'rgba(0,0,0,0.05)',
              color: '#55544f',
              border: '1px solid rgba(0,0,0,0.1)',
              fontWeight: 500,
            }}>
              Manuell · Nicht kassenfähig
            </span>
          )}
        </div>
        <div style={{ fontSize: 13, color: '#22221f', lineHeight: 1.5, marginBottom: 16 }}>
          {isMock && hasSource
            ? 'Simulierte 90-Tage-Testdaten für diesen Account. Du kannst sie deaktivieren, entfernen, neu generieren oder einen echten Export hochladen.'
            : 'Exportiere Daten aus der Apple Health App (export.xml oder ZIP) und lade sie hier hoch.'}
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
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <PauseCircle size={14} /> Apple Health Daten sind deaktiviert und fließen aktuell nicht in deinen Score ein.
          </div>
        )}

        <div style={{ fontSize: 12, color: '#55544f' }}>
          Letzter Import:{' '}
          <strong style={{ color: hasSource && isEnabled ? '#0f6e56' : '#22221f', fontWeight: 500 }}>
            {formatDate(src?.lastSyncAt)}
          </strong>
        </div>
      </div>

      <div style={{ paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {hasSource && isMock && src?.id && (
          <>
            <Btn
              full
              variant={isEnabled ? 'secondary' : 'primary'}
              onClick={() => onToggle(!isEnabled)}
              disabled={isTogglePending}
            >
              {isEnabled ? 'Mock-Daten deaktivieren (pausieren)' : 'Mock-Daten aktivieren'}
            </Btn>
            <Btn
              full
              variant="danger"
              onClick={onDisconnect}
              disabled={isDisconnectingThis}
            >
              {isDisconnectingThis ? 'Wird entfernt...' : 'Mock-Daten entfernen'}
            </Btn>
            <Btn
              full
              variant="secondary"
              onClick={onGenerateMock}
              disabled={isGeneratingMock}
            >
              {isGeneratingMock ? 'Wird generiert...' : 'Testdaten neu generieren'}
            </Btn>
          </>
        )}

        {hasSource && !isMock && src?.id && (
          <>
            <Btn
              full
              variant={isEnabled ? 'secondary' : 'primary'}
              onClick={() => onToggle(!isEnabled)}
              disabled={isTogglePending}
            >
              {isEnabled ? 'Daten deaktivieren (pausieren)' : 'Daten aktivieren'}
            </Btn>
            <Btn
              full
              variant="danger"
              onClick={() => {
                if (window.confirm('Möchtest du die importierten Apple Health Daten wirklich löschen und die Verbindung trennen?')) {
                  onDisconnect();
                }
              }}
              disabled={isDisconnectingThis}
            >
              {isDisconnectingThis ? 'Wird gelöscht...' : 'Daten löschen & trennen'}
            </Btn>
          </>
        )}

        {!hasSource && (
          <Btn
            full
            variant="secondary"
            onClick={onGenerateMock}
            disabled={isGeneratingMock}
          >
            {isGeneratingMock ? (
              'Wird generiert...'
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Dices size={16} /> 90 Tage Testdaten (Mock) generieren
              </span>
            )}
          </Btn>
        )}

        <Btn full onClick={onUploadClick} disabled={isUploading}>
          {isUploading ? 'Wird verarbeitet...' : 'Echten Export hochladen (.xml / .zip)'}
        </Btn>
      </div>
    </Card>
  );
}
