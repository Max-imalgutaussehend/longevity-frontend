import React from 'react';
import { AlertTriangle, PauseCircle } from 'lucide-react';
import { Card, Btn, Chip, Toggle } from '../../../components/ui.js';
import type { Source } from '../../../api/types.js';
import { getSourceSyncStatusInfo, formatDate } from '../datenUtils.js';

export interface OAuthSourceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  src?: Source;
  defaultReadyLabel?: string;
  noteBanner?: React.ReactNode;
  extraBottomAction?: React.ReactNode;
  isSyncing: boolean;
  isDisconnecting: boolean;
  isTogglePending: boolean;
  isDeletePending: boolean;
  onConnect: () => void;
  onSync: () => void;
  onToggle: (enabled: boolean) => void;
  onViewData: () => void;
  onDisconnect: (deleteData?: boolean) => void;
  onDeleteSamples: () => void;
}

export function OAuthSourceCard({
  title,
  description,
  icon,
  src,
  defaultReadyLabel = 'Bereit',
  noteBanner,
  extraBottomAction,
  isSyncing,
  isDisconnecting,
  isTogglePending,
  isDeletePending,
  onConnect,
  onSync,
  onToggle,
  onViewData,
  onDisconnect,
  onDeleteSamples,
}: OAuthSourceCardProps) {
  const sampleCount = src?.sampleCount ?? 0;
  const info = getSourceSyncStatusInfo(src, defaultReadyLabel);
  const isEnabled = !!src?.enabled;
  const isDisconnectingThis = isDisconnecting && !!src?.id;

  const borderTopColor = info.isError
    ? '#ef5350'
    : info.isTokenExpired
    ? '#f59e0b'
    : info.isConnected
    ? isEnabled
      ? '#1d9e75'
      : '#a8a89c'
    : sampleCount > 0
    ? '#ef9a9a'
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
          {icon}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {info.isConnected && src?.id && (
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
            <Chip color={info.badgeColor}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {(info.isTokenExpired || info.isError) && <AlertTriangle size={12} />}
                {info.badgeLabel}
              </span>
            </Chip>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
          <span style={{ fontSize: 16, fontWeight: 500, color: '#22221f' }}>{title}</span>
          <span style={{
            fontSize: 11,
            padding: '2px 8px',
            borderRadius: 999,
            background: 'rgba(29,158,117,0.10)',
            color: '#0f6e56',
            border: '1px solid rgba(29,158,117,0.22)',
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
          }}>
            🛡️ Kassen-verifiziert
          </span>
        </div>
        <div style={{ fontSize: 13, color: '#22221f', lineHeight: 1.5, marginBottom: noteBanner ? 12 : 16 }}>
          {description}
        </div>

        {noteBanner}

        {info.isTokenExpired && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              background: 'rgba(239,108,0,0.08)',
              border: '1px solid rgba(239,108,0,0.25)',
              fontSize: 12,
              color: '#b26a00',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
            }}
          >
            <AlertTriangle size={15} color="#b26a00" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              {title} ist aktuell nicht verknüpft oder die Autorisierung ist abgelaufen.
              {sampleCount > 0 ? ` Deine ${sampleCount} bereits importierten Werte bleiben erhalten.` : ''} Um neue Daten
              abzurufen, verbinde {title} erneut.
            </div>
          </div>
        )}

        {info.isError && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              background: 'rgba(163,45,45,0.08)',
              border: '1px solid rgba(163,45,45,0.25)',
              fontSize: 12,
              color: '#a32d2d',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
            }}
          >
            <AlertTriangle size={15} color="#a32d2d" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>Synchronisation fehlgeschlagen: {src?.syncError || 'Ein unerwarteter Fehler ist aufgetreten.'}</div>
          </div>
        )}

        {info.isConnected && !isEnabled && (
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
            <PauseCircle size={14} /> {title}-Daten sind deaktiviert und fließen aktuell nicht in deinen Score ein.
          </div>
        )}

        <div style={{ fontSize: 12, color: '#55544f' }}>
          Letzter Sync:{' '}
          <strong style={{ color: info.isConnected && isEnabled ? '#0f6e56' : '#22221f', fontWeight: 500 }}>
            {formatDate(src?.lastSyncAt)}
          </strong>
        </div>
      </div>

      <div style={{ paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {info.isConnected && src?.id && !info.isError ? (
          <>
            {isEnabled ? (
              <>
                <Btn full onClick={onSync} disabled={isSyncing}>
                  {isSyncing ? 'Synchronisiere...' : 'Jetzt synchronisieren'}
                </Btn>
                <Btn
                  full
                  variant="secondary"
                  onClick={() => onToggle(false)}
                  disabled={isTogglePending}
                >
                  Daten deaktivieren (pausieren)
                </Btn>
                <Btn
                  full
                  variant="secondary"
                  onClick={onViewData}
                >
                  Synchronisierte Daten ansehen →
                </Btn>
                <Btn
                  full
                  variant="danger"
                  onClick={() => {
                    if (window.confirm(`Möchtest du ${title} trennen und alle synchronisierten Daten löschen?`)) {
                      onDisconnect(true);
                    }
                  }}
                  disabled={isDisconnectingThis}
                >
                  {isDisconnectingThis ? 'Wird getrennt...' : 'Trennen & Daten löschen'}
                </Btn>
              </>
            ) : (
              <>
                <Btn
                  full
                  onClick={() => onToggle(true)}
                  disabled={isTogglePending}
                >
                  Daten wieder aktivieren
                </Btn>
                <Btn
                  full
                  variant="secondary"
                  onClick={onSync}
                  disabled={isSyncing}
                >
                  {isSyncing ? 'Synchronisiere...' : 'Jetzt synchronisieren'}
                </Btn>
                {sampleCount > 0 && (
                  <Btn
                    full
                    variant="danger"
                    onClick={() => {
                      if (window.confirm(`Möchtest du wirklich alle ${sampleCount} importierten ${title} Messwerte löschen?`)) {
                        onDeleteSamples();
                      }
                    }}
                    disabled={isDeletePending}
                  >
                    Importierte Daten löschen ({sampleCount} Werte)
                  </Btn>
                )}
                <Btn
                  full
                  variant="danger"
                  onClick={() => {
                    if (window.confirm(`Möchtest du ${title} trennen und alle synchronisierten Daten löschen?`)) {
                      onDisconnect(true);
                    }
                  }}
                  disabled={isDisconnectingThis}
                >
                  {isDisconnectingThis ? 'Wird getrennt...' : 'Verbindung trennen'}
                </Btn>
              </>
            )}
          </>
        ) : info.isError && src?.id ? (
          <>
            <Btn full onClick={onSync} disabled={isSyncing}>
              {isSyncing ? 'Synchronisiere...' : 'Jetzt erneut synchronisieren'}
            </Btn>
            <Btn full variant="secondary" onClick={onConnect}>
              {title} erneut verbinden
            </Btn>
            {sampleCount > 0 && (
              <Btn
                full
                variant="danger"
                onClick={() => {
                  if (window.confirm(`Möchtest du wirklich alle ${sampleCount} importierten ${title} Messwerte löschen?`)) {
                    onDeleteSamples();
                  }
                }}
                disabled={isDeletePending}
              >
                Importierte Daten löschen ({sampleCount} Werte)
              </Btn>
            )}
          </>
        ) : (
          <>
            <Btn full onClick={onConnect}>
              {sampleCount > 0 || info.isTokenExpired ? `${title} erneut verbinden` : `${title} verbinden`}
            </Btn>
            {extraBottomAction}
            {sampleCount > 0 && src?.id && (
              <>
                <Btn
                  full
                  variant="secondary"
                  onClick={() => onToggle(!isEnabled)}
                  disabled={isTogglePending}
                >
                  {isEnabled ? 'Importierte Daten deaktivieren (pausieren)' : 'Importierte Daten wieder aktivieren'}
                </Btn>
                <Btn
                  full
                  variant="danger"
                  onClick={() => {
                    if (window.confirm(`Möchtest du wirklich alle ${sampleCount} importierten ${title} Messwerte löschen?`)) {
                      onDeleteSamples();
                    }
                  }}
                  disabled={isDeletePending}
                >
                  Importierte Daten löschen ({sampleCount} Werte)
                </Btn>
                <Btn
                  full
                  variant="danger"
                  onClick={() => {
                    if (window.confirm('Möchtest du diese Quelle und alle zugehörigen Daten endgültig entfernen?')) {
                      onDisconnect(true);
                    }
                  }}
                  disabled={isDisconnectingThis}
                >
                  {isDisconnectingThis ? 'Wird entfernt...' : 'Quelle & Daten entfernen'}
                </Btn>
              </>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
