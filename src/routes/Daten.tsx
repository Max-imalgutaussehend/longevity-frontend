import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Sliders, BarChart3 } from 'lucide-react';
import { apiClient } from '../api/client.js';
import { PageTitle, Btn, Chip } from '../components/ui.js';
import { ConsentModal } from '../components/ConsentModal.js';
import type { Source, ScoreResult, SamplesSummaryResponse, MetricSummary } from '../api/types.js';

import { LIFESTYLE_FIELDS } from './daten/datenTypes.js';
import type { ConsentStatus } from './daten/datenTypes.js';
import { SourcesTab } from './daten/tabs/SourcesTab.js';
import { MetricsTab } from './daten/tabs/MetricsTab.js';
import { ExpandedMetricModal } from './daten/components/ExpandedMetricModal.js';
import { HealthAutoExportModal } from './daten/components/HealthAutoExportModal.js';
import { GoogleManualAuthModal } from './daten/components/GoogleManualAuthModal.js';

// Re-export utility functions and types for external callers and tests
export {
  renderMetricIcon,
  renderSourceIcon,
  formatMetricVal,
  daysAgoLabel,
  formatDate,
  getSourceSyncStatusInfo,
  timeAgo,
} from './daten/datenUtils.js';

export type {
  SourceSyncStatusInfo,
  ConsentStatus,
  LifestyleField,
} from './daten/datenTypes.js';

export {
  SOURCE_BADGES,
  SMOKING_OPTIONS,
  LIFESTYLE_FIELDS,
} from './daten/datenTypes.js';

export function Component() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fhirFileInputRef = useRef<HTMLInputElement>(null);

  const [showHaeModal, setShowHaeModal] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [lifestyleVals, setLifestyleVals] = useState<Record<string, string>>({});
  const [lifestyleError, setLifestyleError] = useState<string | null>(null);

  const [syncingProvider, setSyncingProvider] = useState<string | null>(null);
  const [showGoogleManualModal, setShowGoogleManualModal] = useState(false);
  const [googleManualCode, setGoogleManualCode] = useState('');
  const [googleManualLoading, setGoogleManualLoading] = useState(false);
  const [googleAuthCodelabUrl, setGoogleAuthCodelabUrl] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'sources' | 'metrics'>('sources');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [expandedMetric, setExpandedMetric] = useState<MetricSummary | null>(null);

  const [showConsentModal, setShowConsentModal] = useState(false);
  const [pendingConsentAction, setPendingConsentAction] = useState<{ action: () => void; label?: string } | null>(null);

  const haeWebhookUrl = 'https://longevity.maxrommel.de/api/sources/health-auto-export/webhook';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    const tabParam = params.get('tab');
    if (tabParam === 'metrics' || tabParam === 'sources') {
      setActiveTab(tabParam);
    }
    if (connected) {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      queryClient.invalidateQueries({ queryKey: ['score'] });
      queryClient.invalidateQueries({ queryKey: ['samples'] });
      setActiveTab('metrics');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [queryClient]);

  const { data: consentData } = useQuery<ConsentStatus>({
    queryKey: ['account', 'consent'],
    queryFn: () => apiClient<ConsentStatus>('/account/consent'),
  });

  function withConsent(action: () => void, label?: string) {
    if (consentData?.hasConsented) {
      action();
    } else {
      setPendingConsentAction({ action, label });
      setShowConsentModal(true);
    }
  }

  const revokeConsentMutation = useMutation({
    mutationFn: () => apiClient('/account/consent/revoke', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', 'consent'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['sources'] });
    },
  });

  const {
    data: sources = [],
    isLoading: isLoadingSources,
    refetch: refetchSources,
  } = useQuery<Source[]>({
    queryKey: ['sources'],
    queryFn: () => apiClient<Source[]>('/sources'),
  });

  const {
    data: summaryData,
    isLoading: isLoadingSummary,
    refetch: refetchSummary,
  } = useQuery<SamplesSummaryResponse>({
    queryKey: ['samples', 'summary'],
    queryFn: () => apiClient<SamplesSummaryResponse>('/samples/summary'),
  });

  const { data: score } = useQuery<ScoreResult>({
    queryKey: ['score', 'current'],
    queryFn: () => apiClient<ScoreResult>('/score/current'),
  });

  const lifestyleMetrics = score?.domains.flatMap((d) => d.metrics) ?? [];
  const lifestyleMeta = Object.fromEntries(
    LIFESTYLE_FIELDS.map((f) => [f.key, lifestyleMetrics.find((m) => m.metric === f.key)]),
  );

  const labsMut = useMutation({
    mutationFn: (values: Array<{ metric: string; value: number; unit: string; measuredAt?: string }>) =>
      apiClient('/labs', { method: 'POST', body: JSON.stringify({ values }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      queryClient.invalidateQueries({ queryKey: ['score'] });
      queryClient.invalidateQueries({ queryKey: ['samples'] });
    },
  });

  function submitLifestyle() {
    setLifestyleError(null);
    const values: Array<{ metric: string; value: number; unit: string }> = [];

    for (const f of LIFESTYLE_FIELDS) {
      const raw = lifestyleVals[f.key];
      if (raw === undefined || raw === '') continue;

      const num = Number(raw.replace(',', '.'));
      if (isNaN(num)) continue;
      if (num < (f.min ?? 0)) {
        setLifestyleError(`${f.label}: Wert darf nicht negativ sein.`);
        return;
      }
      if (f.max !== undefined && num > f.max) {
        setLifestyleError(`${f.label}: Wert darf maximal ${f.max} sein.`);
        return;
      }

      values.push({ metric: f.key, value: num, unit: f.unit });
    }

    if (values.length === 0) return;
    labsMut.mutate(values);
  }

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
      queryClient.invalidateQueries({ queryKey: ['samples'] });
      setActiveTab('metrics');
    },
    onError: (err: Error) => {
      setUploadError(err.message);
      setUploadSuccess(null);
    },
  });

  const toggleSourceMutation = useMutation({
    mutationFn: async ({ sourceId, enabled }: { sourceId: string; enabled: boolean }) => {
      return apiClient(`/sources/${sourceId}`, {
        method: 'PATCH',
        body: JSON.stringify({ enabled }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      queryClient.invalidateQueries({ queryKey: ['score'] });
      queryClient.invalidateQueries({ queryKey: ['samples'] });
    },
    onError: (err: Error) => {
      alert(err.message || 'Fehler beim Ändern des Status.');
    },
  });

  const deleteSourceSamplesMutation = useMutation({
    mutationFn: async (sourceId: string) => {
      setDisconnectingId(sourceId);
      return apiClient(`/sources/${sourceId}/samples`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      queryClient.invalidateQueries({ queryKey: ['score'] });
      queryClient.invalidateQueries({ queryKey: ['samples'] });
    },
    onError: (err: Error) => {
      alert(err.message || 'Fehler beim Löschen der Messwerte.');
    },
    onSettled: () => {
      setDisconnectingId(null);
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (arg: string | { sourceId: string; deleteData?: boolean }) => {
      const sourceId = typeof arg === 'string' ? arg : arg.sourceId;
      const deleteData = typeof arg === 'object' && arg.deleteData;
      setDisconnectingId(sourceId);
      const url = deleteData ? `/sources/${sourceId}/disconnect?deleteData=true` : `/sources/${sourceId}/disconnect`;
      return apiClient(url, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      queryClient.invalidateQueries({ queryKey: ['score'] });
      queryClient.invalidateQueries({ queryKey: ['samples'] });
    },
    onError: (err: Error) => {
      alert(err.message);
    },
    onSettled: () => {
      setDisconnectingId(null);
    },
  });

  const generateMockMutation = useMutation({
    mutationFn: async () => {
      return apiClient<{ ok: boolean; sampleCount?: number }>('/sources/mock/generate', {
        method: 'POST',
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      queryClient.invalidateQueries({ queryKey: ['score'] });
      queryClient.invalidateQueries({ queryKey: ['samples'] });
      alert(`Erfolgreich 90 Tage Testdaten generiert (${data?.sampleCount ?? 0} Messwerte)!`);
    },
    onError: (err: Error) => {
      alert(err.message);
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

  const fhirUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const text = await file.text();
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error('Ungültige JSON-Datei.');
      }
      return apiClient<{ inserted?: number }>('/sources/fhir/upload', {
        method: 'POST',
        body: JSON.stringify(parsed),
      });
    },
    onSuccess: (data) => {
      const count = data?.inserted ?? 'Mehrere';
      setUploadSuccess(`FHIR-Laborwerte erfolgreich importiert (${count} Werte)!`);
      setUploadError(null);
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      queryClient.invalidateQueries({ queryKey: ['score'] });
      queryClient.invalidateQueries({ queryKey: ['samples'] });
      setActiveTab('metrics');
    },
    onError: (err: Error) => {
      setUploadError(err.message);
      setUploadSuccess(null);
    },
  });

  const handleFhirUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploadSuccess(null);
    fhirUploadMutation.mutate(file);
    e.target.value = '';
  };

  const handleOAuthConnect = async (provider: 'oura' | 'strava' | 'withings' | 'google-fit') => {
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

  const handleSyncSource = async (provider: 'oura' | 'strava' | 'withings' | 'google-fit', label: string) => {
    setSyncingProvider(provider);
    try {
      const endpoint = provider === 'google-fit' ? '/sources/google-fit/sync' : `/sources/${provider}/sync`;
      const res = await apiClient<{ inserted: number }>(endpoint, { method: 'POST' });
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      queryClient.invalidateQueries({ queryKey: ['score'] });
      queryClient.invalidateQueries({ queryKey: ['samples'] });
      queryClient.invalidateQueries({ queryKey: ['samplesSummary'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      alert(`${label}: Synchronisation erfolgreich! ${res?.inserted ?? 0} Messwerte aktualisiert.`);
      setActiveTab('metrics');
    } catch (err: unknown) {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      const msg = err instanceof Error ? err.message : 'Synchronisation fehlgeschlagen.';
      alert(msg);
    } finally {
      setSyncingProvider(null);
    }
  };

  const handleOpenGoogleCodelabMode = async () => {
    setShowGoogleManualModal(true);
    try {
      const data = await apiClient<{ url: string }>('/sources/google-fit/connect', {
        method: 'POST',
        body: JSON.stringify({ redirectUri: 'https://www.google.com' }),
      });
      if (data?.url) setGoogleAuthCodelabUrl(data.url);
    } catch {
      // Fallback
    }
  };

  const handleManualGoogleExchange = async () => {
    if (!googleManualCode.trim()) return;
    setGoogleManualLoading(true);
    try {
      const res = await apiClient<{ ok: boolean; inserted?: number }>('/sources/google-fit/exchange', {
        method: 'POST',
        body: JSON.stringify({ code: googleManualCode.trim(), redirectUri: 'https://www.google.com' }),
      });
      if (res?.ok) {
        queryClient.invalidateQueries({ queryKey: ['sources'] });
        queryClient.invalidateQueries({ queryKey: ['score'] });
        queryClient.invalidateQueries({ queryKey: ['samples'] });
        setShowGoogleManualModal(false);
        setGoogleManualCode('');
        alert(`Google Health erfolgreich verbunden! ${res.inserted ?? 0} Messwerte importiert.`);
        setActiveTab('metrics');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Verbindung fehlgeschlagen. Bitte prüfe den eingegebenen Code.';
      alert(msg);
    } finally {
      setGoogleManualLoading(false);
    }
  };

  const hasActiveMockSource = sources.some((s) => s.enabled && s.adapter === 'mock');
  const hasRealConnectedSource = sources.some((s) => s.enabled && s.adapter !== 'mock' && s.kind !== 'lab');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <PageTitle
          title={activeTab === 'sources' ? 'Daten & Quellen' : 'Meine Vitaldaten'}
          sub={
            activeTab === 'sources'
              ? 'Verwalte verbundene Wearables, Labordaten und Importe für deinen Longevity Score.'
              : 'Übersicht und Verlauf aller synchronisierten Messwerte aus deinen Datenquellen.'
          }
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {activeTab === 'sources' && hasActiveMockSource && <Chip color="amber">Mock-Daten aktiv</Chip>}
          {activeTab === 'sources' && !hasActiveMockSource && hasRealConnectedSource && (
            <Chip color="teal">Echte Daten aktiv</Chip>
          )}
          {activeTab === 'sources' && !hasActiveMockSource && !hasRealConnectedSource && (
            <Chip color="neutral">Keine Datenquelle aktiv</Chip>
          )}
          <Btn
            variant="secondary"
            onClick={() => {
              if (activeTab === 'sources') refetchSources();
              else refetchSummary();
            }}
            disabled={activeTab === 'sources' ? isLoadingSources : isLoadingSummary}
          >
            {(activeTab === 'sources' ? isLoadingSources : isLoadingSummary) ? 'Lädt...' : 'Aktualisieren'}
          </Btn>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: 12, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setActiveTab('sources')}
          style={{
            padding: '8px 20px',
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            border: activeTab === 'sources' ? '1px solid rgba(29,158,117,0.3)' : '1px solid transparent',
            background: activeTab === 'sources' ? 'rgba(29,158,117,0.12)' : 'transparent',
            color: activeTab === 'sources' ? '#0f6e56' : '#55544f',
            transition: 'all 0.15s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Sliders size={15} />
          <span>Quellen & Wearables</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('metrics')}
          style={{
            padding: '8px 20px',
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            border: activeTab === 'metrics' ? '1px solid rgba(29,158,117,0.3)' : '1px solid transparent',
            background: activeTab === 'metrics' ? 'rgba(29,158,117,0.12)' : 'transparent',
            color: activeTab === 'metrics' ? '#0f6e56' : '#55544f',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <BarChart3 size={15} />
          <span>Synchronisierte Vitaldaten</span>
          {(summaryData?.totalCount ?? 0) > 0 && (
            <span
              style={{
                background: activeTab === 'metrics' ? '#0f6e56' : 'rgba(0,0,0,0.08)',
                color: activeTab === 'metrics' ? '#fff' : '#55544f',
                padding: '2px 8px',
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {summaryData?.totalCount}
            </span>
          )}
        </button>
      </div>

      {uploadSuccess && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 12,
            background: 'rgba(29,158,117,0.1)',
            border: '1px solid rgba(29,158,117,0.25)',
            color: '#0f6e56',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {uploadSuccess}
        </div>
      )}
      {uploadError && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 12,
            background: 'rgba(163,45,45,0.1)',
            border: '1px solid rgba(163,45,45,0.25)',
            color: '#a32d2d',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {uploadError}
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xml,.zip"
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={fhirFileInputRef}
        onChange={handleFhirUpload}
        accept=".json"
        style={{ display: 'none' }}
      />

      {/* Tab Content */}
      {activeTab === 'sources' && (
        <SourcesTab
          consentData={consentData}
          onRevokeConsent={() => revokeConsentMutation.mutate()}
          isRevokingConsent={revokeConsentMutation.isPending}
          onRequestConsent={() => setShowConsentModal(true)}
          summaryTotalCount={summaryData?.totalCount ?? 0}
          summaryMetricsLength={summaryData?.metrics.length ?? 0}
          onViewMetricsTab={() => setActiveTab('metrics')}
          isLoadingSources={isLoadingSources}
          sources={sources}
          syncingProvider={syncingProvider}
          disconnectingId={disconnectingId}
          isAppleUploadPending={uploadMutation.isPending}
          isFhirUploadPending={fhirUploadMutation.isPending}
          isGenerateMockPending={generateMockMutation.isPending}
          isTogglePending={toggleSourceMutation.isPending}
          isDeleteSamplesPending={deleteSourceSamplesMutation.isPending}
          onAppleUploadClick={() => withConsent(() => fileInputRef.current?.click(), 'Apple Health Export')}
          onOpenHaeModal={() => withConsent(() => setShowHaeModal(true), 'Health Auto Export Webhook')}
          onOpenGoogleCodelab={() => withConsent(() => handleOpenGoogleCodelabMode(), 'Google Health')}
          onFhirUploadClick={() => withConsent(() => fhirFileInputRef.current?.click(), 'FHIR Laborbefund')}
          onNavigateDashboard={() => navigate('/dashboard')}
          onToggleSource={(sourceId, enabled) => toggleSourceMutation.mutate({ sourceId, enabled })}
          onDeleteSamples={(sourceId) => deleteSourceSamplesMutation.mutate(sourceId)}
          onDisconnectSource={(sourceId, deleteData) => disconnectMutation.mutate({ sourceId, deleteData })}
          onConnectOAuth={(provider) => withConsent(() => handleOAuthConnect(provider), provider)}
          onSyncSource={(provider, label) => handleSyncSource(provider, label)}
          onGenerateMock={() => withConsent(() => generateMockMutation.mutate(), 'Testdaten')}
          lifestyleMeta={lifestyleMeta}
          lifestyleVals={lifestyleVals}
          lifestyleError={lifestyleError}
          isLifestyleSaving={labsMut.isPending}
          onLifestyleChange={(key, val) => setLifestyleVals((prev) => ({ ...prev, [key]: val }))}
          onSaveLifestyle={() => withConsent(() => submitLifestyle(), 'Lebensstil-Angaben')}
        />
      )}

      {activeTab === 'metrics' && (
        <MetricsTab
          summaryData={summaryData}
          isLoadingSummary={isLoadingSummary}
          sources={sources}
          selectedDomain={selectedDomain}
          selectedSource={selectedSource}
          onSelectDomain={setSelectedDomain}
          onSelectSource={setSelectedSource}
          onExpandMetric={setExpandedMetric}
          onNavigateSourcesTab={() => setActiveTab('sources')}
        />
      )}

      {/* Modals */}
      <ExpandedMetricModal
        metric={expandedMetric}
        selectedSource={selectedSource}
        onClose={() => setExpandedMetric(null)}
      />

      <HealthAutoExportModal
        isOpen={showHaeModal}
        webhookUrl={haeWebhookUrl}
        onClose={() => setShowHaeModal(false)}
      />

      <GoogleManualAuthModal
        isOpen={showGoogleManualModal}
        authUrl={googleAuthCodelabUrl}
        code={googleManualCode}
        isLoading={googleManualLoading}
        onChangeCode={setGoogleManualCode}
        onSubmit={handleManualGoogleExchange}
        onClose={() => setShowGoogleManualModal(false)}
      />

      {/* DSGVO Art. 9 Consent Modal */}
      <ConsentModal
        isOpen={showConsentModal}
        onClose={() => {
          setShowConsentModal(false);
          setPendingConsentAction(null);
        }}
        sourceLabel={pendingConsentAction?.label}
        onConsented={() => {
          const pending = pendingConsentAction;
          setPendingConsentAction(null);
          pending?.action();
        }}
      />
    </div>
  );
}
