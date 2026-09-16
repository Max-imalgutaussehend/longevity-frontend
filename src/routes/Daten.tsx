import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Footprints,
  Heart,
  Moon,
  Clock,
  TrendingUp,
  Zap,
  Wind,
  Stethoscope,
  FlaskConical,
  Droplet,
  Ruler,
  Dumbbell,
  CigaretteOff,
  Wine,
  Microscope,
  Bot,
  Apple,
  CircleDot,
  Activity,
  Scale,
  Smartphone,
  Pencil,
  FileText,
  MapPin,
  Sliders,
  BarChart3,
  Dices,
  PauseCircle,
  X,
  Check,
  ExternalLink,
  Shield,
  ShieldCheck,
} from 'lucide-react';
import { ConsentModal } from '../components/ConsentModal.js';
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
  Toggle,
} from '../components/ui.js';
import type { Source, ScoreResult, SamplesSummaryResponse, MetricSummary } from '../api/types.js';

export function renderMetricIcon(metric: string, size = 18): React.ReactNode {
  switch (metric) {
    case 'steps': return <Footprints size={size} color="#0f6e56" />;
    case 'resting_hr': return <Heart size={size} color="#a32d2d" />;
    case 'sleep_duration': return <Moon size={size} color="#3b82f6" />;
    case 'sleep_consistency': return <Clock size={size} color="#3b82f6" />;
    case 'hrv_rmssd': return <TrendingUp size={size} color="#1d9e75" />;
    case 'zone2_minutes': return <Zap size={size} color="#f59e0b" />;
    case 'vo2max': return <Wind size={size} color="#0f6e56" />;
    case 'systolic_bp': return <Stethoscope size={size} color="#a32d2d" />;
    case 'ldl':
    case 'hdl': return <FlaskConical size={size} color="#8b5cf6" />;
    case 'hba1c': return <Droplet size={size} color="#a32d2d" />;
    case 'waist': return <Ruler size={size} color="#854f0b" />;
    case 'strength_sessions': return <Dumbbell size={size} color="#0f6e56" />;
    case 'smoking': return <CigaretteOff size={size} color="#55544f" />;
    case 'alcohol_units': return <Wine size={size} color="#854f0b" />;
    case 'hscrp': return <Microscope size={size} color="#8b5cf6" />;
    default: return <BarChart3 size={size} color="#55544f" />;
  }
}

export function renderSourceIcon(sourceKind: string, size = 16): React.ReactNode {
  switch (sourceKind) {
    case 'google_fit': return <Bot size={size} />;
    case 'apple_health': return <Apple size={size} />;
    case 'oura': return <CircleDot size={size} />;
    case 'strava': return <Activity size={size} />;
    case 'withings': return <Scale size={size} />;
    case 'health_auto_export': return <Smartphone size={size} />;
    case 'lab': return <FlaskConical size={size} />;
    case 'manual': return <Pencil size={size} />;
    case 'questionnaire': return <FileText size={size} />;
    default: return <MapPin size={size} />;
  }
}

const SOURCE_BADGES: Record<string, { label: string }> = {
  google_fit: { label: 'Google Health' },
  apple_health: { label: 'Apple Health' },
  oura: { label: 'Oura Ring' },
  strava: { label: 'Strava' },
  withings: { label: 'Withings' },
  health_auto_export: { label: 'Health Auto Export' },
  lab: { label: 'Laborwert' },
  manual: { label: 'Manuell' },
  questionnaire: { label: 'Fragebogen' },
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

  interface ConsentStatus {
    hasConsented: boolean;
    consentAt: string | null;
    version: string | null;
    latestVersion: string;
    consentText: string;
  }

  const { data: consentData } = useQuery<ConsentStatus>({
    queryKey: ['account', 'consent'],
    queryFn: () => apiClient<ConsentStatus>('/account/consent'),
  });

  const [showConsentModal, setShowConsentModal] = useState(false);
  const [pendingConsentAction, setPendingConsentAction] = useState<{ action: () => void; label?: string } | null>(null);

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
      queryClient.invalidateQueries({ queryKey: ['sources'] });
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

  const hasActiveMockSource = sources.some(
    (s) => s.enabled && s.adapter === 'mock',
  );
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
          {activeTab === 'sources' && hasActiveMockSource && (
            <Chip color="amber">Mock-Daten aktiv</Chip>
          )}
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
          {/* DSGVO Art. 9 Einwilligung Status / Aufforderung */}
          {consentData && (
            <div style={{
              background: consentData.hasConsented ? 'rgba(29,158,117,0.06)' : 'rgba(245,158,11,0.08)',
              border: consentData.hasConsented ? '1px solid rgba(29,158,117,0.2)' : '1px solid rgba(245,158,11,0.3)',
              borderRadius: 16,
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {consentData.hasConsented ? (
                  <ShieldCheck size={20} color="#0f6e56" style={{ flexShrink: 0 }} />
                ) : (
                  <Shield size={20} color="#d97706" style={{ flexShrink: 0 }} />
                )}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: consentData.hasConsented ? '#0f6e56' : '#92400e' }}>
                    {consentData.hasConsented
                      ? `DSGVO Art. 9 Einwilligung aktiv (${consentData.version ?? '2026-09-v1'})`
                      : 'DSGVO-Einwilligung erforderlich (Art. 9 DSGVO)'}
                  </div>
                  <div style={{ fontSize: 11, color: consentData.hasConsented ? '#55544f' : '#78350f' }}>
                    {consentData.hasConsented
                      ? `Erteilt am ${consentData.consentAt ? new Date(consentData.consentAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'heute'} · Verarbeitung besonderer Kategorien personenbezogener Daten`
                      : 'Vor dem Verbinden von Wearables oder Gesundheitsdaten ist deine ausdrückliche Einwilligung gesetzlich vorgeschrieben.'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <a
                  href="/datenschutz"
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: 12, color: '#0f6e56', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 500 }}
                >
                  Datenschutz <ExternalLink size={12} />
                </a>
                {consentData.hasConsented ? (
                  <Btn
                    small
                    variant="ghost"
                    onClick={() => {
                      if (window.confirm('Möchtest du deine DSGVO-Einwilligung zur Verarbeitung von Gesundheitsdaten (Art. 9 DSGVO) wirklich widerrufen?')) {
                        revokeConsentMutation.mutate();
                      }
                    }}
                    disabled={revokeConsentMutation.isPending}
                  >
                    {revokeConsentMutation.isPending ? 'Wird widerrufen...' : 'Widerrufen'}
                  </Btn>
                ) : (
                  <Btn small onClick={() => setShowConsentModal(true)}>
                    Einwilligung einsehen & erteilen
                  </Btn>
                )}
              </div>
            </div>
          )}

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
                <TrendingUp size={16} color="#0f6e56" />
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
            const isMock = src?.adapter === 'mock';
            const sampleCount = src?.sampleCount ?? 0;
            const hasSource = !!src && (src.enabled || sampleCount > 0);
            const isEnabled = !!src?.enabled;

            return (
              <Card style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 24,
                borderTop: `3px solid ${hasSource ? (isEnabled ? (isMock ? '#d97706' : '#1d9e75') : '#a8a89c') : 'rgba(0,0,0,0.08)'}`,
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Apple size={28} color="#0f6e56" />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {hasSource && src?.id && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 11, color: isEnabled ? '#0f6e56' : '#888780' }}>
                            {isEnabled ? 'Aktiv' : 'Pausiert'}
                          </span>
                          <Toggle
                            on={isEnabled}
                            onChange={() => toggleSourceMutation.mutate({ sourceId: src.id, enabled: !isEnabled })}
                          />
                        </div>
                      )}
                      <Chip color={hasSource ? (isEnabled ? (isMock ? 'amber' : 'teal') : 'neutral') : 'neutral'}>
                        {hasSource
                          ? (isEnabled
                              ? (isMock ? `Mock-Daten aktiv${sampleCount > 0 ? ` (${sampleCount})` : ''}` : `Importiert${sampleCount > 0 ? ` (${sampleCount})` : ''}`)
                              : `Deaktiviert${sampleCount > 0 ? ` (${sampleCount} pausiert)` : ''}`)
                          : 'Nicht verbunden'}
                      </Chip>
                    </div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: '#22221f', marginBottom: 8 }}>Apple Health</div>
                  <div style={{ fontSize: 13, color: '#22221f', lineHeight: 1.5, marginBottom: 16 }}>
                    {isMock && hasSource
                      ? 'Simulierte 90-Tage-Testdaten für diesen Account. Du kannst sie deaktivieren, entfernen, neu generieren oder einen echten Export hochladen.'
                      : 'Exportiere Daten aus der Apple Health App (export.xml oder ZIP) und lade sie hier hoch.'}
                  </div>
                  {hasSource && !isEnabled && (
                    <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(168,168,156,0.12)', border: '1px solid rgba(168,168,156,0.25)', fontSize: 12, color: '#55544f', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <PauseCircle size={14} /> Apple Health Daten sind deaktiviert und fließen aktuell nicht in deinen Score ein.
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: '#55544f' }}>
                    Letzter Import: <strong style={{ color: hasSource && isEnabled ? '#0f6e56' : '#22221f', fontWeight: 500 }}>{formatDate(src?.lastSyncAt)}</strong>
                  </div>
                </div>
                <div style={{ paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {hasSource && isMock && src?.id && (
                    <>
                      <Btn
                        full
                        variant={isEnabled ? 'secondary' : 'primary'}
                        onClick={() => toggleSourceMutation.mutate({ sourceId: src.id, enabled: !isEnabled })}
                        disabled={toggleSourceMutation.isPending}
                      >
                        {isEnabled ? 'Mock-Daten deaktivieren (pausieren)' : 'Mock-Daten aktivieren'}
                      </Btn>
                      <Btn
                        full
                        variant="danger"
                        onClick={() => disconnectMutation.mutate({ sourceId: src.id, deleteData: true })}
                        disabled={disconnectMutation.isPending}
                      >
                        {disconnectingId === src.id ? 'Wird entfernt...' : 'Mock-Daten entfernen'}
                      </Btn>
                      <Btn
                        full
                        variant="secondary"
                        onClick={() => withConsent(() => generateMockMutation.mutate(), 'Apple Health Testdaten')}
                        disabled={generateMockMutation.isPending}
                      >
                        {generateMockMutation.isPending ? 'Wird generiert...' : 'Testdaten neu generieren'}
                      </Btn>
                    </>
                  )}
                  {hasSource && !isMock && src?.id && (
                    <>
                      <Btn
                        full
                        variant={isEnabled ? 'secondary' : 'primary'}
                        onClick={() => toggleSourceMutation.mutate({ sourceId: src.id, enabled: !isEnabled })}
                        disabled={toggleSourceMutation.isPending}
                      >
                        {isEnabled ? 'Daten deaktivieren (pausieren)' : 'Daten aktivieren'}
                      </Btn>
                      <Btn
                        full
                        variant="danger"
                        onClick={() => {
                          if (window.confirm('Möchtest du die importierten Apple Health Daten wirklich löschen und die Verbindung trennen?')) {
                            disconnectMutation.mutate({ sourceId: src.id, deleteData: true });
                          }
                        }}
                        disabled={disconnectMutation.isPending}
                      >
                        {disconnectingId === src.id ? 'Wird gelöscht...' : 'Daten löschen & trennen'}
                      </Btn>
                    </>
                  )}
                  {!hasSource && (
                    <Btn
                      full
                      variant="secondary"
                      onClick={() => withConsent(() => generateMockMutation.mutate(), 'Apple Health Testdaten')}
                      disabled={generateMockMutation.isPending}
                    >
                      {generateMockMutation.isPending ? 'Wird generiert...' : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Dices size={16} /> 90 Tage Testdaten (Mock) generieren
                        </span>
                      )}
                    </Btn>
                  )}
                  <Btn full onClick={() => withConsent(() => fileInputRef.current?.click(), 'Apple Health Export')} disabled={uploadMutation.isPending}>
                    {uploadMutation.isPending ? 'Wird verarbeitet...' : 'Echten Export hochladen (.xml / .zip)'}
                  </Btn>
                </div>
              </Card>
            );
          })()}

          {/* Health Auto Export */}
          {(() => {
            const src = sources.find((s) => (s.kind === 'apple_health' && s.adapter === 'health_auto_export') || s.kind === 'health_auto_export');
            const sampleCount = src?.sampleCount ?? 0;
            const hasSource = !!src && (src.enabled || sampleCount > 0);
            const isEnabled = !!src?.enabled;

            return (
              <Card style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 24,
                borderTop: `3px solid ${hasSource ? (isEnabled ? '#1d9e75' : '#a8a89c') : 'rgba(0,0,0,0.08)'}`,
              }}>
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
                            onChange={() => toggleSourceMutation.mutate({ sourceId: src.id, enabled: !isEnabled })}
                          />
                        </div>
                      )}
                      <Chip color={hasSource ? (isEnabled ? 'teal' : 'neutral') : 'neutral'}>
                        {hasSource ? (isEnabled ? `Verbunden${sampleCount > 0 ? ` (${sampleCount})` : ''}` : `Deaktiviert${sampleCount > 0 ? ` (${sampleCount} pausiert)` : ''}`) : 'Nicht eingerichtet'}
                      </Chip>
                    </div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: '#22221f', marginBottom: 8 }}>Health Auto Export & Webhook (iOS & Android)</div>
                  <div style={{ fontSize: 13, color: '#22221f', lineHeight: 1.5, marginBottom: 16 }}>
                    Hintergrund-Synchronisation über iOS- (Health Auto Export) oder Android-Apps (z. B. Health Sync für Health Connect) via REST-Webhook.
                  </div>
                  {hasSource && !isEnabled && (
                    <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(168,168,156,0.12)', border: '1px solid rgba(168,168,156,0.25)', fontSize: 12, color: '#55544f', marginBottom: 12 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <PauseCircle size={14} /> Webhook-Daten sind deaktiviert und fließen aktuell nicht in deinen Score ein.
                      </span>
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: '#55544f' }}>
                    Letzter Sync: <strong style={{ color: hasSource && isEnabled ? '#0f6e56' : '#22221f', fontWeight: 500 }}>{formatDate(src?.lastSyncAt)}</strong>
                  </div>
                </div>
                <div style={{ paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Btn full variant="secondary" onClick={() => withConsent(() => setShowHaeModal(true), 'Health Auto Export Webhook')}>
                    Anleitung & Webhook URL
                  </Btn>
                  {hasSource && src?.id && (
                    <>
                      <Btn
                        full
                        variant={isEnabled ? 'secondary' : 'primary'}
                        onClick={() => toggleSourceMutation.mutate({ sourceId: src.id, enabled: !isEnabled })}
                        disabled={toggleSourceMutation.isPending}
                      >
                        {isEnabled ? 'Webhook-Daten deaktivieren (pausieren)' : 'Webhook-Daten aktivieren'}
                      </Btn>
                      <Btn
                        full
                        variant="danger"
                        onClick={() => {
                          if (window.confirm('Möchtest du die Webhook-Verbindung trennen und alle empfangenen Messwerte löschen?')) {
                            disconnectMutation.mutate({ sourceId: src.id, deleteData: true });
                          }
                        }}
                        disabled={disconnectMutation.isPending}
                      >
                        {disconnectingId === src.id ? 'Wird getrennt...' : 'Trennen & Daten löschen'}
                      </Btn>
                    </>
                  )}
                </div>
              </Card>
            );
          })()}

          {/* Oura Ring */}
          {(() => {
            const src = sources.find((s) => s.kind === 'oura');
            const sampleCount = src?.sampleCount ?? 0;
            const hasSource = !!src && (src.enabled || sampleCount > 0 || !!src.lastSyncAt);
            const isEnabled = !!src?.enabled;

            return (
              <Card style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 24,
                borderTop: `3px solid ${hasSource ? (isEnabled ? '#1d9e75' : '#a8a89c') : 'rgba(0,0,0,0.08)'}`,
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <CircleDot size={28} color="#0f6e56" />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {hasSource && src?.id && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 11, color: isEnabled ? '#0f6e56' : '#888780' }}>
                            {isEnabled ? 'Aktiv' : 'Pausiert'}
                          </span>
                          <Toggle
                            on={isEnabled}
                            onChange={() => toggleSourceMutation.mutate({ sourceId: src.id, enabled: !isEnabled })}
                          />
                        </div>
                      )}
                      <Chip color={hasSource ? (isEnabled ? 'teal' : 'neutral') : 'amber'}>
                        {hasSource ? (isEnabled ? `Verbunden${sampleCount > 0 ? ` (${sampleCount})` : ''}` : `Deaktiviert${sampleCount > 0 ? ` (${sampleCount} pausiert)` : ''}`) : 'In Kürze'}
                      </Chip>
                    </div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: '#22221f', marginBottom: 8 }}>Oura Ring</div>
                  <div style={{ fontSize: 13, color: '#22221f', lineHeight: 1.5, marginBottom: 16 }}>
                    Schlaf-Scores, Readiness, Ruhepuls und HRV-Trends über die Cloud-API.
                  </div>
                  {hasSource && !isEnabled && (
                    <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(168,168,156,0.12)', border: '1px solid rgba(168,168,156,0.25)', fontSize: 12, color: '#55544f', marginBottom: 12 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <PauseCircle size={14} /> Oura-Daten sind deaktiviert und fließen aktuell nicht in deinen Score ein.
                      </span>
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: '#55544f' }}>
                    Letzter Sync: <strong style={{ color: hasSource && isEnabled ? '#0f6e56' : '#22221f', fontWeight: 500 }}>{formatDate(src?.lastSyncAt)}</strong>
                  </div>
                </div>
                <div style={{ paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {hasSource && src?.id ? (
                    <>
                      <Btn
                        full
                        variant={isEnabled ? 'secondary' : 'primary'}
                        onClick={() => toggleSourceMutation.mutate({ sourceId: src.id, enabled: !isEnabled })}
                        disabled={toggleSourceMutation.isPending}
                      >
                        {isEnabled ? 'Daten deaktivieren (pausieren)' : 'Daten aktivieren'}
                      </Btn>
                      <Btn
                        full
                        variant="danger"
                        onClick={() => {
                          if (window.confirm('Möchtest du Oura trennen und alle zugehörigen Daten löschen?')) {
                            disconnectMutation.mutate({ sourceId: src.id, deleteData: true });
                          }
                        }}
                        disabled={disconnectMutation.isPending}
                      >
                        {disconnectingId === src.id ? 'Wird getrennt...' : 'Verbindung trennen & Daten löschen'}
                      </Btn>
                    </>
                  ) : (
                    <Btn
                      full
                      disabled
                      onClick={() => withConsent(() => handleOAuthConnect('oura'), 'Oura Ring')}
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
            const sampleCount = src?.sampleCount ?? 0;
            const hasSource = !!src && (src.enabled || sampleCount > 0 || !!src.lastSyncAt);
            const isEnabled = !!src?.enabled;

            return (
              <Card style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 24,
                borderTop: `3px solid ${hasSource ? (isEnabled ? '#1d9e75' : '#a8a89c') : 'rgba(0,0,0,0.08)'}`,
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Activity size={28} color="#0f6e56" />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {hasSource && src?.id && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 11, color: isEnabled ? '#0f6e56' : '#888780' }}>
                            {isEnabled ? 'Aktiv' : 'Pausiert'}
                          </span>
                          <Toggle
                            on={isEnabled}
                            onChange={() => toggleSourceMutation.mutate({ sourceId: src.id, enabled: !isEnabled })}
                          />
                        </div>
                      )}
                      <Chip color={hasSource ? (isEnabled ? 'teal' : 'neutral') : 'amber'}>
                        {hasSource ? (isEnabled ? `Verbunden${sampleCount > 0 ? ` (${sampleCount})` : ''}` : `Deaktiviert${sampleCount > 0 ? ` (${sampleCount} pausiert)` : ''}`) : 'In Kürze'}
                      </Chip>
                    </div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: '#22221f', marginBottom: 8 }}>Strava</div>
                  <div style={{ fontSize: 13, color: '#22221f', lineHeight: 1.5, marginBottom: 16 }}>
                    Ausdaueraktivitäten, Trainingsbelastung und Pace-Metriken.
                  </div>
                  {hasSource && !isEnabled && (
                    <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(168,168,156,0.12)', border: '1px solid rgba(168,168,156,0.25)', fontSize: 12, color: '#55544f', marginBottom: 12 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <PauseCircle size={14} /> Strava-Daten sind deaktiviert und fließen aktuell nicht in deinen Score ein.
                      </span>
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: '#55544f' }}>
                    Letzter Sync: <strong style={{ color: hasSource && isEnabled ? '#0f6e56' : '#22221f', fontWeight: 500 }}>{formatDate(src?.lastSyncAt)}</strong>
                  </div>
                </div>
                <div style={{ paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {hasSource && src?.id ? (
                    <>
                      <Btn
                        full
                        variant={isEnabled ? 'secondary' : 'primary'}
                        onClick={() => toggleSourceMutation.mutate({ sourceId: src.id, enabled: !isEnabled })}
                        disabled={toggleSourceMutation.isPending}
                      >
                        {isEnabled ? 'Daten deaktivieren (pausieren)' : 'Daten aktivieren'}
                      </Btn>
                      <Btn
                        full
                        variant="danger"
                        onClick={() => {
                          if (window.confirm('Möchtest du Strava trennen und alle zugehörigen Daten löschen?')) {
                            disconnectMutation.mutate({ sourceId: src.id, deleteData: true });
                          }
                        }}
                        disabled={disconnectMutation.isPending}
                      >
                        {disconnectingId === src.id ? 'Wird getrennt...' : 'Verbindung trennen & Daten löschen'}
                      </Btn>
                    </>
                  ) : (
                    <Btn
                      full
                      disabled
                      onClick={() => withConsent(() => handleOAuthConnect('strava'), 'Strava')}
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
            const sampleCount = src?.sampleCount ?? 0;
            const hasSource = !!src && (src.enabled || sampleCount > 0 || !!src.lastSyncAt);
            const isEnabled = !!src?.enabled;

            return (
              <Card style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 24,
                borderTop: `3px solid ${hasSource ? (isEnabled ? '#1d9e75' : '#a8a89c') : 'rgba(0,0,0,0.08)'}`,
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Scale size={28} color="#0f6e56" />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {hasSource && src?.id && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 11, color: isEnabled ? '#0f6e56' : '#888780' }}>
                            {isEnabled ? 'Aktiv' : 'Pausiert'}
                          </span>
                          <Toggle
                            on={isEnabled}
                            onChange={() => toggleSourceMutation.mutate({ sourceId: src.id, enabled: !isEnabled })}
                          />
                        </div>
                      )}
                      <Chip color={hasSource ? (isEnabled ? 'teal' : 'neutral') : 'amber'}>
                        {hasSource ? (isEnabled ? `Verbunden${sampleCount > 0 ? ` (${sampleCount})` : ''}` : `Deaktiviert${sampleCount > 0 ? ` (${sampleCount} pausiert)` : ''}`) : 'In Kürze'}
                      </Chip>
                    </div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: '#22221f', marginBottom: 8 }}>Withings</div>
                  <div style={{ fontSize: 13, color: '#22221f', lineHeight: 1.5, marginBottom: 16 }}>
                    Blutdruckmessungen, Körperzusammensetzung und Pulswellengeschwindigkeit.
                  </div>
                  {hasSource && !isEnabled && (
                    <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(168,168,156,0.12)', border: '1px solid rgba(168,168,156,0.25)', fontSize: 12, color: '#55544f', marginBottom: 12 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <PauseCircle size={14} /> Withings-Daten sind deaktiviert und fließen aktuell nicht in deinen Score ein.
                      </span>
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: '#55544f' }}>
                    Letzter Sync: <strong style={{ color: hasSource && isEnabled ? '#0f6e56' : '#22221f', fontWeight: 500 }}>{formatDate(src?.lastSyncAt)}</strong>
                  </div>
                </div>
                <div style={{ paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {hasSource && src?.id ? (
                    <>
                      <Btn
                        full
                        variant={isEnabled ? 'secondary' : 'primary'}
                        onClick={() => toggleSourceMutation.mutate({ sourceId: src.id, enabled: !isEnabled })}
                        disabled={toggleSourceMutation.isPending}
                      >
                        {isEnabled ? 'Daten deaktivieren (pausieren)' : 'Daten aktivieren'}
                      </Btn>
                      <Btn
                        full
                        variant="danger"
                        onClick={() => {
                          if (window.confirm('Möchtest du Withings trennen und alle zugehörigen Daten löschen?')) {
                            disconnectMutation.mutate({ sourceId: src.id, deleteData: true });
                          }
                        }}
                        disabled={disconnectMutation.isPending}
                      >
                        {disconnectingId === src.id ? 'Wird getrennt...' : 'Verbindung trennen & Daten löschen'}
                      </Btn>
                    </>
                  ) : (
                    <Btn
                      full
                      disabled
                      onClick={() => withConsent(() => handleOAuthConnect('withings'), 'Withings')}
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
            const sampleCount = src?.sampleCount ?? 0;
            const isConnected = !!src && (src.connected ?? (src.adapter === 'mock' || false));
            const hasSource = !!src && (src.enabled || sampleCount > 0 || !!src.lastSyncAt);
            const isEnabled = !!src?.enabled;

            return (
              <Card style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 24,
                borderTop: `3px solid ${isConnected ? (isEnabled ? '#1d9e75' : '#a8a89c') : (sampleCount > 0 ? '#ef9a9a' : 'rgba(0,0,0,0.08)')}`,
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Bot size={28} color="#0f6e56" />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {hasSource && src?.id && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 11, color: isEnabled ? '#0f6e56' : '#888780' }}>
                            {isEnabled ? 'Aktiv' : 'Pausiert'}
                          </span>
                          <Toggle
                            on={isEnabled}
                            onChange={() => toggleSourceMutation.mutate({ sourceId: src.id, enabled: !isEnabled })}
                          />
                        </div>
                      )}
                      <Chip color={isConnected ? (isEnabled ? 'teal' : 'neutral') : (sampleCount > 0 ? 'amber' : 'neutral')}>
                        {isConnected
                          ? (isEnabled ? `Verbunden${sampleCount > 0 ? ` (${sampleCount})` : ''}` : `Deaktiviert${sampleCount > 0 ? ` (${sampleCount} pausiert)` : ''}`)
                          : (sampleCount > 0 ? `Nicht verknüpft (${sampleCount} gespeichert)` : 'Bereit')}
                      </Chip>
                    </div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: '#22221f', marginBottom: 8 }}>Google Health & Google Fit</div>
                  <div style={{ fontSize: 13, color: '#22221f', lineHeight: 1.5, marginBottom: 16 }}>
                    Schritte, Ruhepuls, Schlafdauer und aktive Minuten direkt aus Google Health (Health Connect Cloud) und Google Fit.
                  </div>
                  {!isConnected && sampleCount > 0 && (
                    <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(239,108,0,0.08)', border: '1px solid rgba(239,108,0,0.25)', fontSize: 12, color: '#b26a00', marginBottom: 12 }}>
                      ⚠️ Google Health ist aktuell nicht verknüpft (oder die Autorisierung ist abgelaufen). Deine {sampleCount} bereits importierten Werte bleiben erhalten. Um neue Daten abzurufen, verbinde Google Health erneut.
                    </div>
                  )}
                  {isConnected && !isEnabled && (
                    <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(168,168,156,0.12)', border: '1px solid rgba(168,168,156,0.25)', fontSize: 12, color: '#55544f', marginBottom: 12 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <PauseCircle size={14} /> Google Health Daten sind deaktiviert. Die synchronisierten Messwerte fließen aktuell nicht in deinen Score ein.
                      </span>
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: '#55544f' }}>
                    Letzter Sync: <strong style={{ color: isConnected && isEnabled ? '#0f6e56' : '#22221f', fontWeight: 500 }}>{formatDate(src?.lastSyncAt)}</strong>
                  </div>
                </div>
                <div style={{ paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {isConnected && src?.id ? (
                    <>
                      {isEnabled ? (
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
                            onClick={() => toggleSourceMutation.mutate({ sourceId: src.id, enabled: false })}
                            disabled={toggleSourceMutation.isPending}
                          >
                            Daten deaktivieren (pausieren)
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
                            onClick={() => {
                              if (window.confirm('Möchtest du Google Health trennen und alle synchronisierten Daten löschen?')) {
                                disconnectMutation.mutate({ sourceId: src.id, deleteData: true });
                              }
                            }}
                            disabled={disconnectMutation.isPending}
                          >
                            {disconnectingId === src.id ? 'Wird getrennt...' : 'Trennen & Daten löschen'}
                          </Btn>
                        </>
                      ) : (
                        <>
                          <Btn
                            full
                            onClick={() => toggleSourceMutation.mutate({ sourceId: src.id, enabled: true })}
                            disabled={toggleSourceMutation.isPending}
                          >
                            Daten wieder aktivieren
                          </Btn>
                          <Btn
                            full
                            variant="secondary"
                            onClick={handleSyncGoogle}
                            disabled={syncingGoogle}
                          >
                            {syncingGoogle ? 'Synchronisiere...' : 'Jetzt synchronisieren'}
                          </Btn>
                          {sampleCount > 0 && (
                            <Btn
                              full
                              variant="danger"
                              onClick={() => {
                                if (window.confirm(`Möchtest du wirklich alle ${sampleCount} importierten Google Health Messwerte löschen?`)) {
                                  deleteSourceSamplesMutation.mutate(src.id);
                                }
                              }}
                              disabled={deleteSourceSamplesMutation.isPending}
                            >
                              Importierte Daten löschen ({sampleCount} Werte)
                            </Btn>
                          )}
                          <Btn
                            full
                            variant="danger"
                            onClick={() => {
                              if (window.confirm('Möchtest du Google Health trennen und alle synchronisierten Daten löschen?')) {
                                disconnectMutation.mutate({ sourceId: src.id, deleteData: true });
                              }
                            }}
                            disabled={disconnectMutation.isPending}
                          >
                            {disconnectingId === src.id ? 'Wird getrennt...' : 'Verbindung trennen'}
                          </Btn>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <Btn
                        full
                        onClick={() => withConsent(() => handleOAuthConnect('google-fit'), 'Google Health')}
                      >
                        {sampleCount > 0 ? 'Google Health erneut verbinden' : 'Google Health verbinden'}
                      </Btn>
                      <button
                        type="button"
                        onClick={() => withConsent(() => handleOpenGoogleCodelabMode(), 'Google Health Codelab')}
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
                      {sampleCount > 0 && src?.id && (
                        <>
                          <Btn
                            full
                            variant="secondary"
                            onClick={() => toggleSourceMutation.mutate({ sourceId: src.id, enabled: !isEnabled })}
                            disabled={toggleSourceMutation.isPending}
                          >
                            {isEnabled ? 'Importierte Daten deaktivieren (pausieren)' : 'Importierte Daten wieder aktivieren'}
                          </Btn>
                          <Btn
                            full
                            variant="danger"
                            onClick={() => {
                              if (window.confirm(`Möchtest du wirklich alle ${sampleCount} importierten Google Health Messwerte löschen?`)) {
                                deleteSourceSamplesMutation.mutate(src.id);
                              }
                            }}
                            disabled={deleteSourceSamplesMutation.isPending}
                          >
                            Importierte Daten löschen ({sampleCount} Werte)
                          </Btn>
                          <Btn
                            full
                            variant="danger"
                            onClick={() => {
                              if (window.confirm('Möchtest du diese Quelle und alle zugehörigen Daten endgültig entfernen?')) {
                                disconnectMutation.mutate({ sourceId: src.id, deleteData: true });
                              }
                            }}
                            disabled={disconnectMutation.isPending}
                          >
                            {disconnectingId === src.id ? 'Wird entfernt...' : 'Quelle & Daten entfernen'}
                          </Btn>
                        </>
                      )}
                    </>
                  )}
                </div>
              </Card>
            );
          })()}

          {/* Manuell & Labor */}
          {(() => {
            const src = sources.find((s) => s.kind === 'lab');
            const sampleCount = src?.sampleCount ?? 0;
            const hasSource = !!src && (src.enabled || sampleCount > 0);
            const isEnabled = !src || src.enabled;

            return (
              <Card style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 24,
                borderTop: `3px solid ${isEnabled ? '#1d9e75' : '#a8a89c'}`,
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', color: '#0f6e56' }}><FlaskConical size={26} /></span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {hasSource && src?.id && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 11, color: isEnabled ? '#0f6e56' : '#888780' }}>
                            {isEnabled ? 'Aktiv' : 'Pausiert'}
                          </span>
                          <Toggle
                            on={isEnabled}
                            onChange={() => toggleSourceMutation.mutate({ sourceId: src.id, enabled: !isEnabled })}
                          />
                        </div>
                      )}
                      <Chip color={isEnabled ? 'teal' : 'neutral'}>
                        {isEnabled ? (sampleCount > 0 ? `Aktiv (${sampleCount})` : 'Aktiv') : `Deaktiviert (${sampleCount} pausiert)`}
                      </Chip>
                    </div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: '#22221f', marginBottom: 8 }}>Manuell & Labor</div>
                  <div style={{ fontSize: 13, color: '#22221f', lineHeight: 1.5, marginBottom: 16 }}>
                    Laborwerte wie ApoB, HbA1c oder manuelle Blutdruckerfassungen.
                  </div>
                  {hasSource && !isEnabled && (
                    <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(168,168,156,0.12)', border: '1px solid rgba(168,168,156,0.25)', fontSize: 12, color: '#55544f', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <PauseCircle size={14} /> Laborwerte sind deaktiviert und fließen aktuell nicht in deinen Score ein.
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: '#55544f' }}>
                    Status: <strong style={{ color: isEnabled ? '#0f6e56' : '#22221f', fontWeight: 500 }}>
                      {isEnabled ? 'Aktiv für individuelle Ergänzungen' : 'Pausiert'}
                    </strong>
                  </div>
                </div>
                <div style={{ paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {hasSource && src?.id && (
                    <Btn
                      full
                      variant={isEnabled ? 'secondary' : 'primary'}
                      onClick={() => toggleSourceMutation.mutate({ sourceId: src.id, enabled: !isEnabled })}
                      disabled={toggleSourceMutation.isPending}
                    >
                      {isEnabled ? 'Laborwerte deaktivieren (pausieren)' : 'Laborwerte aktivieren'}
                    </Btn>
                  )}
                  <Btn full variant="secondary" onClick={() => withConsent(() => fhirFileInputRef.current?.click(), 'FHIR Laborbefund')} disabled={fhirUploadMutation.isPending}>
                    {fhirUploadMutation.isPending ? 'Wird verarbeitet...' : 'FHIR-Laborbefund (.json) importieren'}
                  </Btn>
                  <Btn full variant="secondary" onClick={() => navigate('/dashboard')}>
                    Verwaltung im Dashboard
                  </Btn>
                  {hasSource && src?.id && sampleCount > 0 && (
                    <Btn
                      full
                      variant="danger"
                      onClick={() => {
                        if (window.confirm(`Möchtest du wirklich alle ${sampleCount} gespeicherten Laborwerte löschen?`)) {
                          deleteSourceSamplesMutation.mutate(src.id);
                        }
                      }}
                      disabled={deleteSourceSamplesMutation.isPending}
                    >
                      Laborwerte löschen ({sampleCount} Werte)
                    </Btn>
                  )}
                </div>
              </Card>
            );
          })()}
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
          <Btn testId="save-lifestyle-values" onClick={() => withConsent(() => submitLifestyle(), 'Lebensstil-Angaben')} disabled={labsMut.isPending}>
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
                  { value: 'google_fit', label: 'Google Health' },
                  { value: 'apple_health', label: 'Apple Health' },
                  { value: 'lab', label: 'Labor' },
                  { value: 'manual', label: 'Manuell' },
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
              <BarChart3 size={40} color="#888780" style={{ margin: '0 auto 12px', display: 'block' }} />
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
                const badge = SOURCE_BADGES[m.sourceKind] ?? { label: m.sourceKind };
                return (
                  <Card key={m.metric} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 20 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center' }}>{renderMetricIcon(m.metric, 24)}</span>
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 500, color: '#22221f' }}>{m.label}</div>
                            <div style={{ fontSize: 11, color: '#a3a29c' }}>{m.domainLabel}</div>
                          </div>
                        </div>
                        <Chip color="teal">
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            {renderSourceIcon(m.sourceKind, 13)}
                            <span>{badge.label}</span>
                          </span>
                        </Chip>
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
                      const badge = SOURCE_BADGES[s.sourceKind] ?? { label: s.sourceKind };
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
                            <span style={{ marginRight: 6, display: 'inline-flex', verticalAlign: 'middle' }}>{renderMetricIcon(s.metric, 16)}</span> {s.label}
                          </td>
                          <td style={{ padding: '10px 12px', color: '#0f6e56', fontWeight: 600 }}>
                            {formatMetricVal(s.metric, s.value)} <span style={{ fontWeight: 400, color: '#55544f', fontSize: 12 }}>{s.unit}</span>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '3px 8px', borderRadius: 999, background: 'rgba(29,158,117,0.08)', color: '#0f6e56', border: '1px solid rgba(29,158,117,0.18)' }}>
                              {renderSourceIcon(s.sourceKind, 13)} {badge.label}
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
              <span style={{ display: 'inline-flex', alignItems: 'center', color: '#0f6e56' }}>{renderMetricIcon(expandedMetric.metric, 24)}</span>
              <div>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#22221f' }}>{expandedMetric.label} – Gesamthistorie</div>
                <div style={{ fontSize: 12, color: '#a3a29c' }}>{expandedMetric.domainLabel}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setExpandedMetric(null)}
              aria-label="Schließen"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a3a29c', display: 'flex', alignItems: 'center', padding: 4 }}
            >
              <X size={20} />
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
                      const b = SOURCE_BADGES[h.sourceKind] ?? { label: h.sourceKind };
                      return (
                        <tr key={h.id ?? i} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.015)' }}>
                          <td style={{ padding: '8px 10px', color: '#55544f', whiteSpace: 'nowrap' }}>
                            {new Date(h.measuredAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </td>
                          <td style={{ padding: '8px 10px', fontWeight: 600, color: '#0f6e56' }}>
                            {formatMetricVal(expandedMetric.metric, h.value)} <span style={{ fontWeight: 400, color: '#55544f', fontSize: 11 }}>{expandedMetric.unit}</span>
                          </td>
                          <td style={{ padding: '8px 10px', fontSize: 12, color: '#55544f' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                              {renderSourceIcon(h.sourceKind, 12)} {b.label}
                            </span>
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
              {copiedHaeUrl ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Check size={14} /> Kopiert
                </span>
              ) : (
                'Kopieren'
              )}
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
                  style={{ color: '#0f6e56', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  Google Autorisierung öffnen <ExternalLink size={14} />
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
