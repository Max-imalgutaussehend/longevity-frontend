import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client.js';
import { Card, PageTitle, Btn, Chip, Modal, Skeleton } from '../components/ui.js';
import type { Source } from '../api/types.js';

export function Component() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
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
  } = useQuery<Source[]>({
    queryKey: ['sources'],
    queryFn: () => apiClient<Source[]>('/sources'),
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiClient('/sources/apple-health/upload', {
        method: 'POST',
        body: formData,
      });
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
      return apiClient(`/sources/${sourceId}/disconnect`, {
        method: 'DELETE',
      });
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

  const handleOAuthConnect = async (provider: 'oura' | 'strava' | 'withings') => {
    try {
      const data = await apiClient<{ url: string }>(`/sources/${provider}/connect`, {
        method: 'POST',
      });
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Fehler beim Verbinden der Datenquelle.';
      alert(message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHaeUrl(true);
    setTimeout(() => setCopiedHaeUrl(false), 2000);
  };

  const hasRealConnectedSource = sources.some(
    (s) => s.enabled && s.adapter !== 'mock' && s.kind !== 'lab',
  );

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
        <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(29,158,117,0.1)', border: '1px solid rgba(29,158,117,0.25)', color: '#0f6e56', fontSize: 13, fontWeight: 500 }}>
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
            const src = sources.find((s) => s.kind === 'apple_health' && s.adapter !== 'health_auto_export') ?? sources.find((s) => s.kind === 'apple_health');
            const isConnected = !!src?.enabled;
            return (
              <Card style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 24,
                borderTop: `3px solid ${isConnected ? '#1d9e75' : 'rgba(0,0,0,0.08)'}`,
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: 28 }}>🍎</span>
                    <Chip color={isConnected ? 'teal' : 'neutral'}>
                      {isConnected ? 'Importiert' : 'Nicht verbunden'}
                    </Chip>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: '#22221f', marginBottom: 8 }}>Apple Health</div>
                  <div style={{ fontSize: 13, color: '#22221f', lineHeight: 1.5, marginBottom: 16 }}>
                    Exportiere Daten aus der Apple Health App (export.xml oder ZIP) und lade sie hier hoch.
                  </div>
                  <div style={{ fontSize: 12, color: '#55544f' }}>
                    Letzter Import: <strong style={{ color: isConnected ? '#0f6e56' : '#22221f', fontWeight: 500 }}>{formatDate(src?.lastSyncAt)}</strong>
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
            const src = sources.find((s) => (s.kind === 'apple_health' && s.adapter === 'health_auto_export') || s.kind === 'health_auto_export');
            const isConnected = !!src?.enabled;
            return (
              <Card style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 24,
                borderTop: `3px solid ${isConnected ? '#1d9e75' : 'rgba(0,0,0,0.08)'}`,
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: 28 }}>📲</span>
                    <Chip color={isConnected ? 'teal' : 'neutral'}>
                      {isConnected ? 'Verbunden' : 'Nicht eingerichtet'}
                    </Chip>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: '#22221f', marginBottom: 8 }}>Health Auto Export</div>
                  <div style={{ fontSize: 13, color: '#22221f', lineHeight: 1.5, marginBottom: 16 }}>
                    Hintergrund-Synchronisation über die iOS-App via REST-Webhook.
                  </div>
                  <div style={{ fontSize: 12, color: '#55544f' }}>
                    Letzter Sync: <strong style={{ color: isConnected ? '#0f6e56' : '#22221f', fontWeight: 500 }}>{formatDate(src?.lastSyncAt)}</strong>
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
            const src = sources.find((s) => s.kind === 'oura');
            const isConnected = !!src?.enabled;
            return (
              <Card style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 24,
                borderTop: `3px solid ${isConnected ? '#1d9e75' : 'rgba(0,0,0,0.08)'}`,
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: 28 }}>💍</span>
                    <Chip color={isConnected ? 'teal' : 'neutral'}>
                      {isConnected ? 'Verbunden' : 'Nicht verbunden'}
                    </Chip>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: '#22221f', marginBottom: 8 }}>Oura Ring</div>
                  <div style={{ fontSize: 13, color: '#22221f', lineHeight: 1.5, marginBottom: 16 }}>
                    Schlaf-Scores, Readiness, Ruhepuls und HRV-Trends über die Cloud-API.
                  </div>
                  <div style={{ fontSize: 12, color: '#55544f' }}>
                    Letzter Sync: <strong style={{ color: isConnected ? '#0f6e56' : '#22221f', fontWeight: 500 }}>{formatDate(src?.lastSyncAt)}</strong>
                  </div>
                </div>
                <div style={{ paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  {isConnected && src?.id ? (
                    <Btn
                      full
                      variant="danger"
                      disabled
                      onClick={() => disconnectMutation.mutate(src.id)}
                      title="Verbindung trennen wird nach Merge von Backend PR #40 freigeschaltet"
                    >
                      {disconnectingId === src.id ? 'Wird getrennt...' : 'Verbindung trennen (In Kürze)'}
                    </Btn>
                  ) : (
                    <Btn
                      full
                      disabled
                      onClick={() => handleOAuthConnect('oura')}
                      title="Oura-Anbindung wird nach Merge von Backend PR #40 freigeschaltet"
                    >
                      Oura verbinden (In Kürze)
                    </Btn>
                  )}
                </div>
              </Card>
            );
          })()}

          {/* Strava */}
          {(() => {
            const src = sources.find((s) => s.kind === 'strava');
            const isConnected = !!src?.enabled;
            return (
              <Card style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 24,
                borderTop: `3px solid ${isConnected ? '#1d9e75' : 'rgba(0,0,0,0.08)'}`,
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: 28 }}>🏃</span>
                    <Chip color={isConnected ? 'teal' : 'neutral'}>
                      {isConnected ? 'Verbunden' : 'Nicht verbunden'}
                    </Chip>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: '#22221f', marginBottom: 8 }}>Strava</div>
                  <div style={{ fontSize: 13, color: '#22221f', lineHeight: 1.5, marginBottom: 16 }}>
                    Ausdaueraktivitäten, Trainingsbelastung und Pace-Metriken.
                  </div>
                  <div style={{ fontSize: 12, color: '#55544f' }}>
                    Letzter Sync: <strong style={{ color: isConnected ? '#0f6e56' : '#22221f', fontWeight: 500 }}>{formatDate(src?.lastSyncAt)}</strong>
                  </div>
                </div>
                <div style={{ paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  {isConnected && src?.id ? (
                    <Btn
                      full
                      variant="danger"
                      disabled
                      onClick={() => disconnectMutation.mutate(src.id)}
                      title="Verbindung trennen wird nach Merge von Backend PR #40 freigeschaltet"
                    >
                      {disconnectingId === src.id ? 'Wird getrennt...' : 'Verbindung trennen (In Kürze)'}
                    </Btn>
                  ) : (
                    <Btn
                      full
                      disabled
                      onClick={() => handleOAuthConnect('strava')}
                      title="Strava-Anbindung wird nach Merge von Backend PR #40 freigeschaltet"
                    >
                      Strava verbinden (In Kürze)
                    </Btn>
                  )}
                </div>
              </Card>
            );
          })()}

          {/* Withings */}
          {(() => {
            const src = sources.find((s) => s.kind === 'withings');
            const isConnected = !!src?.enabled;
            return (
              <Card style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 24,
                borderTop: `3px solid ${isConnected ? '#1d9e75' : 'rgba(0,0,0,0.08)'}`,
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: 28 }}>⚖️</span>
                    <Chip color={isConnected ? 'teal' : 'neutral'}>
                      {isConnected ? 'Verbunden' : 'Nicht verbunden'}
                    </Chip>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: '#22221f', marginBottom: 8 }}>Withings</div>
                  <div style={{ fontSize: 13, color: '#22221f', lineHeight: 1.5, marginBottom: 16 }}>
                    Blutdruckmessungen, Körperzusammensetzung und Pulswellengeschwindigkeit.
                  </div>
                  <div style={{ fontSize: 12, color: '#55544f' }}>
                    Letzter Sync: <strong style={{ color: isConnected ? '#0f6e56' : '#22221f', fontWeight: 500 }}>{formatDate(src?.lastSyncAt)}</strong>
                  </div>
                </div>
                <div style={{ paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  {isConnected && src?.id ? (
                    <Btn
                      full
                      variant="danger"
                      disabled
                      onClick={() => disconnectMutation.mutate(src.id)}
                      title="Verbindung trennen wird nach Merge von Backend PR #40 freigeschaltet"
                    >
                      {disconnectingId === src.id ? 'Wird getrennt...' : 'Verbindung trennen (In Kürze)'}
                    </Btn>
                  ) : (
                    <Btn
                      full
                      disabled
                      onClick={() => handleOAuthConnect('withings')}
                      title="Withings-Anbindung wird nach Merge von Backend PR #40 freigeschaltet"
                    >
                      Withings verbinden (In Kürze)
                    </Btn>
                  )}
                </div>
              </Card>
            );
          })()}

          {/* Manuell & Labor */}
          <Card style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 24,
            borderTop: '3px solid #1d9e75',
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 28 }}>🩸</span>
                <Chip color="teal">Aktiv</Chip>
              </div>
              <div style={{ fontSize: 16, fontWeight: 500, color: '#22221f', marginBottom: 8 }}>Manuell & Labor</div>
              <div style={{ fontSize: 13, color: '#22221f', lineHeight: 1.5, marginBottom: 16 }}>
                Laborwerte wie ApoB, HbA1c oder manuelle Blutdruckerfassungen.
              </div>
              <div style={{ fontSize: 12, color: '#55544f' }}>
                Status: <strong style={{ color: '#0f6e56', fontWeight: 500 }}>Immer aktiv für individuelle Ergänzungen</strong>
              </div>
            </div>
            <div style={{ paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <Btn full variant="secondary" onClick={() => navigate('/dashboard')}>
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
          <p style={{ fontSize: 13, color: '#22221f', lineHeight: 1.6, marginBottom: 20 }}>
            Verwende die iOS-App <strong style={{ color: '#0f6e56' }}>Health Auto Export</strong> und konfiguriere folgende URL als REST-Webhook:
          </p>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 24 }}>
            <code style={{ flex: 1, padding: '10px 14px', background: 'rgba(29,158,117,0.06)', borderRadius: 12, fontSize: 12, color: '#0f6e56', fontWeight: 500, wordBreak: 'break-all', border: '1px solid rgba(29,158,117,0.2)' }}>
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
