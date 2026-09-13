import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client.js';
import {
  Card,
  PageTitle,
  Btn,
  Chip,
  Modal,
  Skeleton,
  GlassInput,
  GlassSelect,
  FieldLabel,
  InfoTooltip,
  SectionLabel,
} from '../components/ui.js';
import type { Source, ScoreResult, SamplesSummaryResponse, MetricSummary } from '../api/types.js';

const METRIC_ICONS: Record<string, string> = {
  steps: '👟',
  resting_hr: '❤️',
  sleep_duration: '🌙',
  sleep_consistency: '⏱️',
  hrv_rmssd: '📈',
  zone2_minutes: '⚡',
  vo2max: '🫁',
  systolic_bp: '🩺',
  ldl: '🧪',
  hdl: '🧪',
  hba1c: '🩸',
  waist: '📏',
  strength_sessions: '🏋️',
  smoking: '🚬',
  alcohol_units: '🍷',
  hscrp: '🔬',
};

const SOURCE_BADGES: Record<string, { label: string; icon: string }> = {
  google_fit: { label: 'Google Health', icon: '🤖' },
  apple_health: { label: 'Apple Health', icon: '🍎' },
  oura: { label: 'Oura Ring', icon: '💍' },
  strava: { label: 'Strava', icon: '🏃' },
  withings: { label: 'Withings', icon: '⚖️' },
  health_auto_export: { label: 'Health Auto Export', icon: '📲' },
  lab: { label: 'Laborwert', icon: '🩸' },
  manual: { label: 'Manuell', icon: '✏️' },
  questionnaire: { label: 'Fragebogen', icon: '📝' },
};

function formatMetricVal(metric: string, val: number): string {
  if (metric === 'steps') return Math.round(val).toLocaleString('de-DE');
  if (metric === 'sleep_duration' || metric === 'vo2max') return val.toFixed(1);
  if (metric === 'resting_hr' || metric === 'systolic_bp') return Math.round(val).toString();
  return Number.isInteger(val) ? val.toString() : val.toFixed(1);
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // If timestamp is in the future (e.g. UTC end-of-day) or within the last minute
  if (diffMs <= 60 * 1000) {
    return 'Heute';
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 60) {
    return `Vor ${diffMinutes} Min.`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    const isSameDay =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();
    if (isSameDay) {
      return diffHours === 1 ? 'Vor 1 Std.' : `Vor ${diffHours} Std.`;
    }
    return 'Gestern';
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays <= 1) return 'Gestern';
  if (diffDays < 7) return `Vor ${diffDays} Tagen`;
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}

const SMOKING_OPTIONS = [
  { value: '0', label: 'Nie' },
  { value: '1', label: 'Ehemalig (>1 Jahr)' },
  { value: '2', label: 'Ehemalig (<1 Jahr)' },
  { value: '3', label: 'Aktuell' },
];

const LIFESTYLE_FIELDS: Array<{
  key: 'smoking' | 'alcohol_units' | 'strength_sessions' | 'zone2_minutes';
  label: string;
  unit: string;
  kind: 'select' | 'number';
  min?: number;
  max?: number;
  tooltip?: string;
  placeholder?: string;
}> = [
  { key: 'smoking', label: 'Rauchen', unit: 'category', kind: 'select' },
  {
    key: 'alcohol_units',
    label: 'Alkohol-Einheiten pro Woche',
    unit: 'units/week',
    kind: 'number',
    min: 0,
    placeholder: 'z. B. 4',
    tooltip: '1 Einheit = 10g Alkohol ≈ 1 kleines Bier',
  },
  {
    key: 'strength_sessions',
    label: 'Krafteinheiten pro Woche',
    unit: '/week',
    kind: 'number',
    min: 0,
    max: 4,
    placeholder: 'z. B. 2',
  },
  {
    key: 'zone2_minutes',
    label: 'Zone-2-Minuten pro Woche',
    unit: 'min/week',
    kind: 'number',
    min: 0,
    placeholder: 'z. B. 90',
    tooltip: 'Lockeres Ausdauertraining — "könnte sich noch unterhalten"',
  },
];

function daysAgoLabel(days: number | null): string | null {
  if (days === null) return null;
  if (days < 1) return 'Heute eingetragen';
  if (days < 2) return 'Vor 1 Tag eingetragen';
  return `Vor ${Math.round(days)} Tagen eingetragen`;
}

export function Component() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fhirFileInputRef = useRef<HTMLInputElement>(null);

  const [showHaeModal, setShowHaeModal] = useState(false);
  const [copiedHaeUrl, setCopiedHaeUrl] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [lifestyleVals, setLifestyleVals] = useState<Record<string, string>>({});
  const [lifestyleError, setLifestyleError] = useState<string | null>(null);

  const [syncingGoogle, setSyncingGoogle] = useState(false);
  const [showGoogleManualModal, setShowGoogleManualModal] = useState(false);
  const [googleManualCode, setGoogleManualCode] = useState('');
  const [googleManualLoading, setGoogleManualLoading] = useState(false);
  const [googleAuthCodelabUrl, setGoogleAuthCodelabUrl] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'sources' | 'metrics'>('sources');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [expandedMetric, setExpandedMetric] = useState<MetricSummary | null>(null);
  const [recentLimit, setRecentLimit] = useState(50);

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

  const handleSyncGoogle = async () => {
    setSyncingGoogle(true);
    try {
      const res = await apiClient<{ inserted: number }>('/sources/google-fit/sync', { method: 'POST' });
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      queryClient.invalidateQueries({ queryKey: ['score'] });
      queryClient.invalidateQueries({ queryKey: ['samples'] });
      alert(`Synchronisation erfolgreich! ${res?.inserted ?? 0} Messwerte aktualisiert.`);
      setActiveTab('metrics');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Synchronisation fehlgeschlagen.';
      alert(msg);
    } finally {
      setSyncingGoogle(false);
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
      // Fallback to standard url construction if needed
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

  const filteredMetrics = (summaryData?.metrics ?? []).filter((m) => {
    if (selectedDomain !== 'all' && m.domain !== selectedDomain) return false;
    if (selectedSource !== 'all' && m.sourceKind !== selectedSource) return false;
    return true;
  });

  const filteredRecentSamples = (summaryData?.recentSamples ?? []).filter((s) => {
    if (selectedSource !== 'all' && s.sourceKind !== selectedSource) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
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
          {!hasRealConnectedSource && activeTab === 'sources' && (
            <Chip color="amber">Mock-Daten aktiv</Chip>
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
          }}
        >
          ⚙️ Quellen & Wearables
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
          📊 Synchronisierte Vitaldaten
          {(summaryData?.totalCount ?? 0) > 0 && (
            <span style={{
              background: activeTab === 'metrics' ? '#0f6e56' : 'rgba(0,0,0,0.08)',
              color: activeTab === 'metrics' ? '#fff' : '#55544f',
              padding: '2px 8px',
              borderRadius: 99,
              fontSize: 11,
              fontWeight: 600,
            }}>
              {summaryData?.totalCount}
            </span>
          )}
        </button>
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
      <input
        type="file"
        ref={fhirFileInputRef}
        onChange={handleFhirUpload}
        accept=".json"
        style={{ display: 'none' }}
      />

      {activeTab === 'sources' && (
        <>
          {(summaryData?.totalCount ?? 0) > 0 && (
            <div
              onClick={() => setActiveTab('metrics')}
              style={{
                padding: '12px 18px',
                borderRadius: 14,
                background: 'rgba(29,158,117,0.06)',
                border: '1px solid rgba(29,158,117,0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#0f6e56' }}>
                <span>📈</span>
                <span><strong>{summaryData?.totalCount} Messwerte</strong> synchronisiert ({summaryData?.metrics.length} Vitalparameter).</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#0f6e56', textDecoration: 'underline' }}>
                Vitaldaten ansehen →
              </span>
            </div>
          )}

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
            const isMock = src?.adapter === 'mock';

            return (
              <Card style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 24,
                borderTop: `3px solid ${isConnected ? (isMock ? '#d97706' : '#1d9e75') : 'rgba(0,0,0,0.08)'}`,
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: 28 }}>🍎</span>
                    <Chip color={isConnected ? (isMock ? 'amber' : 'teal') : 'neutral'}>
                      {isConnected ? (isMock ? 'Mock-Daten aktiv' : 'Importiert') : 'Nicht verbunden'}
                    </Chip>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: '#22221f', marginBottom: 8 }}>Apple Health</div>
                  <div style={{ fontSize: 13, color: '#22221f', lineHeight: 1.5, marginBottom: 16 }}>
                    {isMock && isConnected
                      ? 'Simulierte 90-Tage-Testdaten für diesen Account. Du kannst sie entfernen, neu generieren oder einen echten Export hochladen.'
                      : 'Exportiere Daten aus der Apple Health App (export.xml oder ZIP) und lade sie hier hoch.'}
                  </div>
                  <div style={{ fontSize: 12, color: '#55544f' }}>
                    Letzter Import: <strong style={{ color: isConnected ? '#0f6e56' : '#22221f', fontWeight: 500 }}>{formatDate(src?.lastSyncAt)}</strong>
                  </div>
                </div>
                <div style={{ paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {isConnected && isMock && src?.id && (
                    <>
                      <Btn
                        full
                        variant="danger"
                        onClick={() => disconnectMutation.mutate(src.id)}
                        disabled={disconnectMutation.isPending}
                      >
                        {disconnectingId === src.id ? 'Wird entfernt...' : 'Mock-Daten entfernen'}
                      </Btn>
                      <Btn
                        full
                        variant="secondary"
                        onClick={() => generateMockMutation.mutate()}
                        disabled={generateMockMutation.isPending}
                      >
                        {generateMockMutation.isPending ? 'Wird generiert...' : 'Testdaten neu generieren'}
                      </Btn>
                    </>
                  )}
                  {isConnected && !isMock && src?.id && (
                    <Btn
                      full
                      variant="danger"
                      onClick={() => disconnectMutation.mutate(src.id)}
                      disabled={disconnectMutation.isPending}
                    >
                      {disconnectingId === src.id ? 'Wird getrennt...' : 'Verbindung trennen'}
                    </Btn>
                  )}
                  {!isConnected && (
                    <Btn
                      full
                      variant="secondary"
                      onClick={() => generateMockMutation.mutate()}
                      disabled={generateMockMutation.isPending}
                    >
                      {generateMockMutation.isPending ? 'Wird generiert...' : '🎲 90 Tage Testdaten (Mock) generieren'}
                    </Btn>
                  )}
                  <Btn full onClick={() => fileInputRef.current?.click()} disabled={uploadMutation.isPending}>
                    {uploadMutation.isPending ? 'Wird verarbeitet...' : 'Echten Export hochladen (.xml / .zip)'}
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
                  <div style={{ fontSize: 16, fontWeight: 500, color: '#22221f', marginBottom: 8 }}>Health Auto Export & Webhook (iOS & Android)</div>
                  <div style={{ fontSize: 13, color: '#22221f', lineHeight: 1.5, marginBottom: 16 }}>
                    Hintergrund-Synchronisation über iOS- (Health Auto Export) oder Android-Apps (z. B. Health Sync für Health Connect) via REST-Webhook.
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
                    <Chip color={isConnected ? 'teal' : 'amber'}>
                      {isConnected ? 'Verbunden' : 'In Kürze'}
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
                      onClick={() => disconnectMutation.mutate(src.id)}
                    >
                      {disconnectingId === src.id ? 'Wird getrennt...' : 'Verbindung trennen'}
                    </Btn>
                  ) : (
                    <Btn
                      full
                      disabled
                      onClick={() => handleOAuthConnect('oura')}
                      title="Cloud-Anbindung wird nach Bereitstellung der OAuth-App-Credentials freigeschaltet"
                    >
                      Oura verbinden (Bald verfügbar)
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
                    <Chip color={isConnected ? 'teal' : 'amber'}>
                      {isConnected ? 'Verbunden' : 'In Kürze'}
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
                      onClick={() => disconnectMutation.mutate(src.id)}
                    >
                      {disconnectingId === src.id ? 'Wird getrennt...' : 'Verbindung trennen'}
                    </Btn>
                  ) : (
                    <Btn
                      full
                      disabled
                      onClick={() => handleOAuthConnect('strava')}
                      title="Cloud-Anbindung wird nach Bereitstellung der OAuth-App-Credentials freigeschaltet"
                    >
                      Strava verbinden (Bald verfügbar)
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
                    <Chip color={isConnected ? 'teal' : 'amber'}>
                      {isConnected ? 'Verbunden' : 'In Kürze'}
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
                      onClick={() => disconnectMutation.mutate(src.id)}
                    >
                      {disconnectingId === src.id ? 'Wird getrennt...' : 'Verbindung trennen'}
                    </Btn>
                  ) : (
                    <Btn
                      full
                      disabled
                      onClick={() => handleOAuthConnect('withings')}
                      title="Cloud-Anbindung wird nach Bereitstellung der OAuth-App-Credentials freigeschaltet"
                    >
                      Withings verbinden (Bald verfügbar)
                    </Btn>
                  )}
                </div>
              </Card>
            );
          })()}

          {/* Google Health & Fit */}
          {(() => {
            const src = sources.find((s) => s.kind === 'google_fit');
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
                    <span style={{ fontSize: 28 }}>🤖</span>
                    <Chip color={isConnected ? 'teal' : 'neutral'}>
                      {isConnected ? 'Verbunden' : 'Bereit'}
                    </Chip>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: '#22221f', marginBottom: 8 }}>Google Health & Google Fit</div>
                  <div style={{ fontSize: 13, color: '#22221f', lineHeight: 1.5, marginBottom: 16 }}>
                    Schritte, Ruhepuls, Schlafdauer und aktive Minuten direkt aus Google Health (Health Connect Cloud) und Google Fit.
                  </div>
                  <div style={{ fontSize: 12, color: '#55544f' }}>
                    Letzter Sync: <strong style={{ color: isConnected ? '#0f6e56' : '#22221f', fontWeight: 500 }}>{formatDate(src?.lastSyncAt)}</strong>
                  </div>
                </div>
                <div style={{ paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {isConnected && src?.id ? (
                    <>
                      <Btn
                        full
                        onClick={handleSyncGoogle}
                        disabled={syncingGoogle}
                      >
                        {syncingGoogle ? 'Synchronisiere...' : 'Jetzt synchronisieren'}
                      </Btn>
                      <Btn
                        full
                        variant="secondary"
                        onClick={() => setActiveTab('metrics')}
                      >
                        Synchronisierte Daten ansehen →
                      </Btn>
                      <Btn
                        full
                        variant="danger"
                        onClick={() => disconnectMutation.mutate(src.id)}
                      >
                        {disconnectingId === src.id ? 'Wird getrennt...' : 'Verbindung trennen'}
                      </Btn>
                    </>
                  ) : (
                    <>
                      <Btn
                        full
                        onClick={() => handleOAuthConnect('google-fit')}
                      >
                        Google Health verbinden
                      </Btn>
                      <button
                        type="button"
                        onClick={handleOpenGoogleCodelabMode}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#0f6e56',
                          fontSize: 12,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          padding: 4,
                          textAlign: 'center',
                        }}
                      >
                        Codelab-Modus (Code manuell eingeben)
                      </button>
                    </>
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
            <div style={{ paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Btn full variant="secondary" onClick={() => fhirFileInputRef.current?.click()} disabled={fhirUploadMutation.isPending}>
                {fhirUploadMutation.isPending ? 'Wird verarbeitet...' : 'FHIR-Laborbefund (.json) importieren'}
              </Btn>
              <Btn full variant="secondary" onClick={() => navigate('/dashboard')}>
                Verwaltung im Dashboard
              </Btn>
            </div>
          </Card>
        </div>
      )}

      {/* Lebensstil & Aktivität */}
      <Card>
        <SectionLabel>Lebensstil & Aktivität</SectionLabel>
        <p style={{ fontSize: 13, color: '#22221f', marginBottom: 20 }}>
          Alle Angaben sind freiwillig und fließen in deinen Score ein.
        </p>
        <div className="responsive-grid-2">
          {LIFESTYLE_FIELDS.map((f) => {
            const meta = lifestyleMeta[f.key];
            const lastLabel = meta?.available ? daysAgoLabel(meta.ageDays) : null;
            return (
              <div key={f.key}>
                <FieldLabel>
                  {f.label}
                  {f.tooltip && <InfoTooltip text={f.tooltip} />}
                </FieldLabel>
                {f.kind === 'select' ? (
                  <GlassSelect
                    testId={`lifestyle-${f.key}`}
                    options={SMOKING_OPTIONS}
                    value={lifestyleVals[f.key] ?? String(meta?.value ?? '')}
                    onChange={(v) => setLifestyleVals((p) => ({ ...p, [f.key]: v }))}
                  />
                ) : (
                  <GlassInput
                    testId={`lifestyle-${f.key}`}
                    type="number"
                    placeholder={f.placeholder}
                    value={lifestyleVals[f.key] ?? ''}
                    onChange={(v) => setLifestyleVals((p) => ({ ...p, [f.key]: v }))}
                  />
                )}
                {lastLabel && (
                  <div style={{ fontSize: 11, color: '#55544f', marginTop: 6 }}>{lastLabel}</div>
                )}
              </div>
            );
          })}
        </div>
        {lifestyleError && (
          <div style={{ fontSize: 12, color: '#a32d2d', marginTop: 16 }}>{lifestyleError}</div>
        )}
        <div style={{ marginTop: 24 }}>
          <Btn testId="save-lifestyle-values" onClick={submitLifestyle} disabled={labsMut.isPending}>
            {labsMut.isPending ? 'Wird gespeichert...' : 'Lebensstil speichern'}
          </Btn>
        </div>
      </Card>
        </>
      )}

      {activeTab === 'metrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <Card style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: 12, color: '#a3a29c', marginBottom: 4 }}>Gesamte Messpunkte</div>
              <div style={{ fontSize: 32, fontWeight: 500, color: '#0f6e56', letterSpacing: '-0.02em' }}>
                {summaryData?.totalCount ?? 0}
              </div>
              <div style={{ fontSize: 11, color: '#55544f', marginTop: 4 }}>Synchronisierte Datenpunkte</div>
            </Card>
            <Card style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: 12, color: '#a3a29c', marginBottom: 4 }}>Aktive Vitalparameter</div>
              <div style={{ fontSize: 32, fontWeight: 500, color: '#22221f', letterSpacing: '-0.02em' }}>
                {summaryData?.metrics.length ?? 0}
              </div>
              <div style={{ fontSize: 11, color: '#55544f', marginTop: 4 }}>Gemessene Metriken</div>
            </Card>
            <Card style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: 12, color: '#a3a29c', marginBottom: 4 }}>Verbundene Datenquellen</div>
              <div style={{ fontSize: 32, fontWeight: 500, color: '#22221f', letterSpacing: '-0.02em' }}>
                {sources.filter((s) => s.enabled && s.adapter !== 'mock').length}
              </div>
              <div style={{ fontSize: 11, color: '#55544f', marginTop: 4 }}>Wearables & Schnittstellen</div>
            </Card>
            {summaryData?.dateRange && (
              <Card style={{ padding: '20px 24px' }}>
                <div style={{ fontSize: 12, color: '#a3a29c', marginBottom: 4 }}>Erfasster Zeitraum</div>
                <div style={{ fontSize: 16, fontWeight: 500, color: '#0f6e56', letterSpacing: '-0.01em', marginTop: 8 }}>
                  {new Date(summaryData.dateRange.min).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })} – {new Date(summaryData.dateRange.max).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                </div>
                <div style={{ fontSize: 11, color: '#55544f', marginTop: 4 }}>
                  {Math.max(1, Math.round((new Date(summaryData.dateRange.max).getTime() - new Date(summaryData.dateRange.min).getTime()) / (1000 * 60 * 60 * 24)))} Tage Historie
                </div>
              </Card>
            )}
          </div>

          {/* Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'Alle Bereiche' },
                { id: 'activity', label: 'Aktivität' },
                { id: 'recovery', label: 'Regeneration' },
                { id: 'cardiometabolic', label: 'Kardiometabolik' },
                { id: 'risk', label: 'Risiko' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedDomain(cat.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    border: selectedDomain === cat.id ? '1px solid rgba(29,158,117,0.4)' : '1px solid rgba(0,0,0,0.08)',
                    background: selectedDomain === cat.id ? 'rgba(29,158,117,0.12)' : 'rgba(255,255,255,0.6)',
                    color: selectedDomain === cat.id ? '#0f6e56' : '#55544f',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#55544f' }}>Quelle:</span>
              <GlassSelect
                options={[
                  { value: 'all', label: 'Alle Quellen' },
                  { value: 'google_fit', label: '🤖 Google Health' },
                  { value: 'apple_health', label: '🍎 Apple Health' },
                  { value: 'lab', label: '🩸 Labor' },
                  { value: 'manual', label: '✏️ Manuell' },
                ]}
                value={selectedSource}
                onChange={setSelectedSource}
              />
            </div>
          </div>

          {/* Metrics Cards Grid */}
          {isLoadingSummary ? (
            <div className="responsive-grid-2">
              {[1, 2, 3, 4].map((i) => <Card key={i}><Skeleton height={140} /></Card>)}
            </div>
          ) : !filteredMetrics || filteredMetrics.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
              <div style={{ fontSize: 16, fontWeight: 500, color: '#22221f', marginBottom: 8 }}>
                Keine Messwerte für diese Auswahl vorhanden
              </div>
              <p style={{ fontSize: 13, color: '#55544f', maxWidth: 460, margin: '0 auto 20px', lineHeight: 1.5 }}>
                Verbinde eine Datenquelle (z. B. Google Health oder Apple Health) im Reiter &quot;Quellen &amp; Wearables&quot;, um deine Vitaldaten automatisch zu importieren.
              </p>
              <Btn onClick={() => setActiveTab('sources')}>Zu den Datenquellen</Btn>
            </Card>
          ) : (
            <div className="responsive-grid-2">
              {filteredMetrics.map((m) => {
                const badge = SOURCE_BADGES[m.sourceKind] ?? { label: m.sourceKind, icon: '📍' };
                const icon = METRIC_ICONS[m.metric] ?? '📊';
                return (
                  <Card key={m.metric} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 20 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 24 }}>{icon}</span>
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 500, color: '#22221f' }}>{m.label}</div>
                            <div style={{ fontSize: 11, color: '#a3a29c' }}>{m.domainLabel}</div>
                          </div>
                        </div>
                        <Chip color="teal">{badge.icon} {badge.label}</Chip>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '14px 0 6px' }}>
                        <span style={{ fontSize: 36, fontWeight: 500, color: '#0f6e56', letterSpacing: '-0.02em', lineHeight: 1 }}>
                          {formatMetricVal(m.metric, m.latestValue)}
                        </span>
                        <span style={{ fontSize: 14, color: '#55544f' }}>{m.unit}</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#55544f', marginTop: 10 }}>
                        <span>Letzter Wert: <strong>{timeAgo(m.latestMeasuredAt)}</strong> ({formatDate(m.latestMeasuredAt)})</span>
                        <span style={{ color: '#a3a29c' }}>{m.count} {m.count === 1 ? 'Eintrag' : 'Einträge'}</span>
                      </div>
                    </div>

                    {/* Recent History Mini Points */}
                    {m.history && m.history.length > 1 && (
                      <div style={{ paddingTop: 14, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                          <div style={{ fontSize: 11, color: '#a3a29c' }}>Letzte Tage:</div>
                          <button
                            type="button"
                            onClick={() => setExpandedMetric(m)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#0f6e56',
                              fontSize: 11,
                              fontWeight: 500,
                              cursor: 'pointer',
                              padding: 0,
                              textDecoration: 'underline',
                            }}
                          >
                            Gesamten Verlauf ({m.count} Einträge) ansehen →
                          </button>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {m.history.slice(0, 7).map((h, idx) => (
                            <span
                              key={idx}
                              style={{
                                padding: '3px 8px',
                                borderRadius: 6,
                                background: 'rgba(0,0,0,0.03)',
                                border: '1px solid rgba(0,0,0,0.06)',
                                fontSize: 11,
                                color: '#22221f',
                              }}
                            >
                              {new Date(h.measuredAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}: <strong>{formatMetricVal(m.metric, h.value)}</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {/* Activity Log / Table */}
          {summaryData?.recentSamples && summaryData.recentSamples.length > 0 && (
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <SectionLabel>Messwert-Protokoll</SectionLabel>
                  <div style={{ fontSize: 12, color: '#55544f', marginTop: 2 }}>
                    Chronologische Liste der synchronisierten Einzelmessungen
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, color: '#a3a29c' }}>
                    {Math.min(filteredRecentSamples.length, recentLimit)} von {filteredRecentSamples.length} Messungen
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[50, 100, 200].map((lim) => (
                      <button
                        key={lim}
                        type="button"
                        onClick={() => setRecentLimit(lim)}
                        style={{
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: recentLimit === lim ? 600 : 400,
                          border: recentLimit === lim ? '1px solid rgba(29,158,117,0.4)' : '1px solid rgba(0,0,0,0.08)',
                          background: recentLimit === lim ? 'rgba(29,158,117,0.1)' : 'transparent',
                          color: recentLimit === lim ? '#0f6e56' : '#55544f',
                          cursor: 'pointer',
                        }}
                      >
                        {lim}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', color: '#a3a29c', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <th style={{ padding: '10px 12px' }}>Zeitpunkt</th>
                      <th style={{ padding: '10px 12px' }}>Parameter</th>
                      <th style={{ padding: '10px 12px' }}>Messwert</th>
                      <th style={{ padding: '10px 12px' }}>Quelle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecentSamples.slice(0, recentLimit).map((s, idx) => {
                      const badge = SOURCE_BADGES[s.sourceKind] ?? { label: s.sourceKind, icon: '📍' };
                      const icon = METRIC_ICONS[s.metric] ?? '📊';
                      return (
                        <tr
                          key={s.id ?? idx}
                          style={{
                            borderBottom: '1px solid rgba(0,0,0,0.04)',
                            background: idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.015)',
                          }}
                        >
                          <td style={{ padding: '10px 12px', color: '#55544f', whiteSpace: 'nowrap' }}>
                            {formatDate(s.measuredAt)}
                          </td>
                          <td style={{ padding: '10px 12px', color: '#22221f', fontWeight: 500 }}>
                            <span style={{ marginRight: 6 }}>{icon}</span> {s.label}
                          </td>
                          <td style={{ padding: '10px 12px', color: '#0f6e56', fontWeight: 600 }}>
                            {formatMetricVal(s.metric, s.value)} <span style={{ fontWeight: 400, color: '#55544f', fontSize: 12 }}>{s.unit}</span>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ fontSize: 12, padding: '3px 8px', borderRadius: 999, background: 'rgba(29,158,117,0.08)', color: '#0f6e56', border: '1px solid rgba(29,158,117,0.18)' }}>
                              {badge.icon} {badge.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Modal: Full Metric History */}
      {expandedMetric && (
        <Modal onClose={() => setExpandedMetric(null)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 24 }}>{METRIC_ICONS[expandedMetric.metric] ?? '📊'}</span>
              <div>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#22221f' }}>{expandedMetric.label} – Gesamthistorie</div>
                <div style={{ fontSize: 12, color: '#a3a29c' }}>{expandedMetric.domainLabel}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setExpandedMetric(null)}
              style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#a3a29c' }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '12px 16px', borderRadius: 8, background: 'rgba(29,158,117,0.06)', border: '1px solid rgba(29,158,117,0.15)', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: '#55544f' }}>Aktueller Wert</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: '#0f6e56' }}>
                {formatMetricVal(expandedMetric.metric, expandedMetric.latestValue)} {expandedMetric.unit}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#55544f' }}>Datenpunkte</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#22221f' }}>
                {selectedSource === 'all'
                  ? `${expandedMetric.count} Einträge`
                  : `${expandedMetric.history.filter((h) => h.sourceKind === selectedSource).length} Einträge (${SOURCE_BADGES[selectedSource]?.label ?? selectedSource})`}
              </div>
            </div>
          </div>

          {(() => {
            const filteredHistory = selectedSource === 'all'
              ? expandedMetric.history
              : expandedMetric.history.filter((h) => h.sourceKind === selectedSource);

            return (
              <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', color: '#a3a29c', fontSize: 11, textTransform: 'uppercase' }}>
                      <th style={{ padding: '8px 10px' }}>Datum</th>
                      <th style={{ padding: '8px 10px' }}>Wert</th>
                      <th style={{ padding: '8px 10px' }}>Quelle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((h, i) => {
                      const b = SOURCE_BADGES[h.sourceKind] ?? { label: h.sourceKind, icon: '📍' };
                      return (
                        <tr key={h.id ?? i} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.015)' }}>
                          <td style={{ padding: '8px 10px', color: '#55544f', whiteSpace: 'nowrap' }}>
                            {new Date(h.measuredAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </td>
                          <td style={{ padding: '8px 10px', fontWeight: 600, color: '#0f6e56' }}>
                            {formatMetricVal(expandedMetric.metric, h.value)} <span style={{ fontWeight: 400, color: '#55544f', fontSize: 11 }}>{expandedMetric.unit}</span>
                          </td>
                          <td style={{ padding: '8px 10px', fontSize: 12, color: '#55544f' }}>
                            {b.icon} {b.label}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}

          <div style={{ marginTop: 20, textAlign: 'right' }}>
            <Btn onClick={() => setExpandedMetric(null)}>Schließen</Btn>
          </div>
        </Modal>
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

      {/* Modal: Google Codelab Manual Auth */}
      {showGoogleManualModal && (
        <Modal onClose={() => setShowGoogleManualModal(false)}>
          <div style={{ fontSize: 18, fontWeight: 500, color: '#22221f', marginBottom: 12 }}>
            Google Health / Codelab-Verknüpfung
          </div>
          <p style={{ fontSize: 13, color: '#55544f', lineHeight: 1.6, marginBottom: 16 }}>
            Wenn dein Google Cloud OAuth-Client auf <code>https://www.google.com</code> eingestellt ist (Codelab-Standard), gehe wie folgt vor:
          </p>
          <ol style={{ fontSize: 13, color: '#22221f', lineHeight: 1.6, paddingLeft: 20, margin: '0 0 20px 0' }}>
            <li style={{ marginBottom: 8 }}>
              Klicke hier, um die Autorisierung bei Google zu starten:{' '}
              {googleAuthCodelabUrl ? (
                <a
                  href={googleAuthCodelabUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#0f6e56', fontWeight: 500 }}
                >
                  Google Autorisierung öffnen ↗
                </a>
              ) : (
                <span style={{ color: '#888780' }}>Wird geladen...</span>
              )}
            </li>
            <li style={{ marginBottom: 8 }}>
              Melde dich an und erlaube den Zugriff auf deine Gesundheitsdaten.
            </li>
            <li style={{ marginBottom: 8 }}>
              Google leitet dich weiter zu <code>https://www.google.com/?code=...</code>.
            </li>
            <li>
              Kopiere die gesamte URL aus der Adresszeile des Browsers (oder den Code) und füge sie hier ein:
            </li>
          </ol>
          <div style={{ marginBottom: 20 }}>
            <GlassInput
              placeholder="https://www.google.com/?code=4/0A... oder Autorisierungscode"
              value={googleManualCode}
              onChange={setGoogleManualCode}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Btn variant="secondary" onClick={() => setShowGoogleManualModal(false)}>
              Abbrechen
            </Btn>
            <Btn
              onClick={handleManualGoogleExchange}
              disabled={googleManualLoading || !googleManualCode.trim()}
            >
              {googleManualLoading ? 'Wird verknüpft...' : 'Verknüpfen & Synchronisieren'}
            </Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
