import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, PageTitle, Btn, Chip, Modal, Skeleton } from '../components/ui.js';

interface SourceStatus {
  id: string;
  sourceType:
    | 'apple_health'
    | 'health_auto_export'
    | 'oura'
    | 'strava'
    | 'withings'
    | 'manual';
  status: 'connected' | 'disconnected' | 'mock';
  lastSyncAt?: string | null;
  createdAt?: string;
  meta?: Record<string, unknown>;
}

export function Component() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showHaeModal, setShowHaeModal] = useState(false);
  const [copiedHaeUrl, setCopiedHaeUrl] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

  const haeWebhookUrl =
    'https://longevity.maxrommel.de/api/sources/health-auto-export/webhook';

  const {
    data: sources = [],
    isLoading: isLoadingSources,
    refetch: refetchSources,
  } = useQuery<SourceStatus[]>({
    queryKey: ['sources'],
    queryFn: async () => {
      const res = await fetch('/api/sources', { credentials: 'include' });
      if (!res.ok) throw new Error('Fehler beim Laden der Datenquellen');
      return res.json();
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/sources/apple-health/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Fehler beim Upload der Apple Health Datei.');
      }
      return res.json();
    },
    onSuccess: () => {
      setUploadSuccess('Apple Health Daten erfolgreich importiert!');
      setUploadError(null);
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      queryClient.invalidateQueries({ queryKey: ['score'] });
    },
    onError: (err: Error) => {
      setUploadError(err.message);
      setUploadSuccess(null);
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (sourceId: string) => {
      setDisconnectingId(sourceId);
      const res = await fetch(`/api/sources/${sourceId}/disconnect`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Fehler beim Trennen der Verbindung.');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      queryClient.invalidateQueries({ queryKey: ['score'] });
    },
    onError: (err: Error) => {
      alert(err.message);
    },
    onSettled: () => {
      setDisconnectingId(null);
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploadSuccess(null);
    uploadMutation.mutate(file);
    e.target.value = '';
  };

  const handleOAuthConnect = (provider: 'oura' | 'strava' | 'withings') => {
    window.location.href = `/api/sources/${provider}/connect`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHaeUrl(true);
    setTimeout(() => setCopiedHaeUrl(false), 2000);
  };

  const hasRealConnectedSource = sources.some(
    (s) => s.status === 'connected' && s.sourceType !== 'manual',
  );

  const getSourceItem = (type: SourceStatus['sourceType']) => {
    return sources.find((s) => s.sourceType === type);
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return 'Noch nie';
    try {
      return new Intl.DateTimeFormat('de-DE', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(isoString));
    } catch {
      return isoString;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <PageTitle
          title="Daten & Quellen"
          sub="Verwalte verbundene Wearables, Labordaten und Importe für deinen Longevity Score."
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {!hasRealConnectedSource && (
            <Chip color="amber">Mock-Daten aktiv</Chip>
          )}
          <Btn variant="secondary" onClick={() => refetchSources()} disabled={isLoadingSources}>
            {isLoadingSources ? 'Lädt...' : 'Aktualisieren'}
          </Btn>
        </div>
      </div>

      {uploadSuccess && (
        <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(59,109,17,0.1)', border: '1px solid rgba(59,109,17,0.25)', color: '#3b6d11', fontSize: 13, fontWeight: 500 }}>
          {uploadSuccess}
        </div>
      )}
      {uploadError && (
        <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(163,45,45,0.1)', border: '1px solid rgba(163,45,45,0.25)', color: '#a32d2d', fontSize: 13, fontWeight: 500 }}>
          {uploadError}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xml,.zip"
        style={{ display: 'none' }}
      />

      {isLoadingSources ? (
        <div className="responsive-grid-2">
          {[1, 2, 3, 4].map((i) => <Card key={i}><Skeleton height={140} /></Card>)}
        </div>
      ) : (
        <div className="responsive-grid-2">
          {/* Apple Health */}
          {(() => {
            const src = getSourceItem('apple_health');
            const isConnected = src?.status === 'connected';
            return (
              <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 24 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: 28 }}>🍎</span>
                    <Chip color={isConnected ? 'green' : 'neutral'}>
                      {isConnected ? 'Importiert' : 'Nicht verbunden'}
                    </Chip>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: '#22221f', marginBottom: 8 }}>Apple Health</div>
                  <div style={{ fontSize: 13, color: '#55544f', lineHeight: 1.5, marginBottom: 16 }}>
                    Exportiere Daten aus der Apple Health App (export.xml oder ZIP) und lade sie hier hoch.
                  </div>
                  <div style={{ fontSize: 12, color: '#888780' }}>
                    Letzter Import: <strong style={{ color: '#22221f' }}>{formatDate(src?.lastSyncAt || src?.createdAt)}</strong>
                  </div>
                </div>
                <div style={{ paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <Btn full onClick={() => fileInputRef.current?.click()} disabled={uploadMutation.isPending}>
                    {uploadMutation.isPending ? 'Wird verarbeitet...' : 'Export hochladen (.xml / .zip)'}
                  </Btn>
                </div>
              </Card>
            );
          })()}

          {/* Health Auto Export */}
          {(() => {
            const src = getSourceItem('health_auto_export');
            const isConnected = src?.status === 'connected';
            return (
              <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 24 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: 28 }}>📲</span>
                    <Chip color={isConnected ? 'green' : 'neutral'}>
                      {isConnected ? 'Verbunden' : 'Nicht eingerichtet'}
                    </Chip>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: '#22221f', marginBottom: 8 }}>Health Auto Export</div>
                  <div style={{ fontSize: 13, color: '#55544f', lineHeight: 1.5, marginBottom: 16 }}>
                    Hintergrund-Synchronisation über die iOS-App via REST-Webhook.
                  </div>
                  <div style={{ fontSize: 12, color: '#888780' }}>
                    Letzter Sync: <strong style={{ color: '#22221f' }}>{formatDate(src?.lastSyncAt || src?.createdAt)}</strong>
                  </div>
                </div>
                <div style={{ paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <Btn full variant="secondary" onClick={() => setShowHaeModal(true)}>
                    Anleitung & Webhook URL
                  </Btn>
                </div>
              </Card>
            );
          })()}

          {/* Oura Ring */}
          {(() => {
            const src = getSourceItem('oura');
            const isConnected = src?.status === 'connected';
            return (
              <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 24 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: 28 }}>💍</span>
                    <Chip color={isConnected ? 'green' : 'neutral'}>
                      {isConnected ? 'Verbunden' : 'Nicht verbunden'}
                    </Chip>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: '#22221f', marginBottom: 8 }}>Oura Ring</div>
                  <div style={{ fontSize: 13, color: '#55544f', lineHeight: 1.5, marginBottom: 16 }}>
                    Schlaf-Scores, Readiness, Ruhepuls und HRV-Trends über die Cloud-API.
                  </div>
                  <div style={{ fontSize: 12, color: '#888780' }}>
                    Letzter Sync: <strong style={{ color: '#22221f' }}>{formatDate(src?.lastSyncAt || src?.createdAt)}</strong>
                  </div>
                </div>
                <div style={{ paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  {isConnected && src?.id ? (
                    <Btn full variant="danger" onClick={() => disconnectMutation.mutate(src.id)} disabled={disconnectingId === src.id}>
                      {disconnectingId === src.id ? 'Wird getrennt...' : 'Verbindung trennen'}
                    </Btn>
                  ) : (
                    <Btn full onClick={() => handleOAuthConnect('oura')}>
                      Oura verbinden
                    </Btn>
                  )}
                </div>
              </Card>
            );
          })()}

          {/* Strava */}
          {(() => {
            const src = getSourceItem('strava');
            const isConnected = src?.status === 'connected';
            return (
              <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 24 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: 28 }}>🏃</span>
                    <Chip color={isConnected ? 'green' : 'neutral'}>
                      {isConnected ? 'Verbunden' : 'Nicht verbunden'}
                    </Chip>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: '#22221f', marginBottom: 8 }}>Strava</div>
                  <div style={{ fontSize: 13, color: '#55544f', lineHeight: 1.5, marginBottom: 16 }}>
                    Ausdaueraktivitäten, Trainingsbelastung und Pace-Metriken.
                  </div>
                  <div style={{ fontSize: 12, color: '#888780' }}>
                    Letzter Sync: <strong style={{ color: '#22221f' }}>{formatDate(src?.lastSyncAt || src?.createdAt)}</strong>
                  </div>
                </div>
                <div style={{ paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  {isConnected && src?.id ? (
                    <Btn full variant="danger" onClick={() => disconnectMutation.mutate(src.id)} disabled={disconnectingId === src.id}>
                      {disconnectingId === src.id ? 'Wird getrennt...' : 'Verbindung trennen'}
                    </Btn>
                  ) : (
                    <Btn full onClick={() => handleOAuthConnect('strava')}>
                      Strava verbinden
                    </Btn>
                  )}
                </div>
              </Card>
            );
          })()}

          {/* Withings */}
          {(() => {
            const src = getSourceItem('withings');
            const isConnected = src?.status === 'connected';
            return (
              <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 24 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: 28 }}>⚖️</span>
                    <Chip color={isConnected ? 'green' : 'neutral'}>
                      {isConnected ? 'Verbunden' : 'Nicht verbunden'}
                    </Chip>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: '#22221f', marginBottom: 8 }}>Withings</div>
                  <div style={{ fontSize: 13, color: '#55544f', lineHeight: 1.5, marginBottom: 16 }}>
                    Blutdruckmessungen, Körperzusammensetzung und Pulswellengeschwindigkeit.
                  </div>
                  <div style={{ fontSize: 12, color: '#888780' }}>
                    Letzter Sync: <strong style={{ color: '#22221f' }}>{formatDate(src?.lastSyncAt || src?.createdAt)}</strong>
                  </div>
                </div>
                <div style={{ paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  {isConnected && src?.id ? (
                    <Btn full variant="danger" onClick={() => disconnectMutation.mutate(src.id)} disabled={disconnectingId === src.id}>
                      {disconnectingId === src.id ? 'Wird getrennt...' : 'Verbindung trennen'}
                    </Btn>
                  ) : (
                    <Btn full onClick={() => handleOAuthConnect('withings')}>
                      Withings verbinden
                    </Btn>
                  )}
                </div>
              </Card>
            );
          })()}

          {/* Manuell & Labor */}
          <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 24 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 28 }}>🩸</span>
                <Chip color="green">Aktiv</Chip>
              </div>
              <div style={{ fontSize: 16, fontWeight: 500, color: '#22221f', marginBottom: 8 }}>Manuell & Labor</div>
              <div style={{ fontSize: 13, color: '#55544f', lineHeight: 1.5, marginBottom: 16 }}>
                Laborwerte wie ApoB, HbA1c oder manuelle Blutdruckerfassungen.
              </div>
              <div style={{ fontSize: 12, color: '#888780' }}>
                Status: <strong style={{ color: '#22221f' }}>Immer aktiv für individuelle Ergänzungen</strong>
              </div>
            </div>
            <div style={{ paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <Btn full variant="ghost" onClick={() => {}}>
                Verwaltung im Dashboard
              </Btn>
            </div>
          </Card>
        </div>
      )}

      {/* Modal: Health Auto Export Webhook */}
      {showHaeModal && (
        <Modal onClose={() => setShowHaeModal(false)}>
          <div style={{ fontSize: 18, fontWeight: 500, color: '#22221f', marginBottom: 12 }}>
            Health Auto Export Setup
          </div>
          <p style={{ fontSize: 13, color: '#55544f', lineHeight: 1.6, marginBottom: 20 }}>
            Verwende die iOS-App <strong>Health Auto Export</strong> und konfiguriere folgende URL als REST-Webhook:
          </p>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 24 }}>
            <code style={{ flex: 1, padding: '10px 14px', background: 'rgba(0,0,0,0.04)', borderRadius: 12, fontSize: 12, color: '#22221f', wordBreak: 'break-all', border: '1px solid rgba(0,0,0,0.08)' }}>
              {haeWebhookUrl}
            </code>
            <Btn small variant="secondary" onClick={() => copyToClipboard(haeWebhookUrl)}>
              {copiedHaeUrl ? 'Kopiert ✓' : 'Kopieren'}
            </Btn>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Btn onClick={() => setShowHaeModal(false)}>Schließen</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
