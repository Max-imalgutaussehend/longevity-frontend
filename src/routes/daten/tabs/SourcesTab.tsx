import {
  TrendingUp,
  CircleDot,
  Activity,
  Scale,
  Bot,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { Card, Skeleton, Btn } from '../../../components/ui.js';
import type { Source, MetricResult } from '../../../api/types.js';
import type { ConsentStatus } from '../datenTypes.js';
import { ConsentStatusBanner } from '../components/ConsentStatusBanner.js';
import { AppleHealthCard } from '../components/AppleHealthCard.js';
import { HealthAutoExportCard } from '../components/HealthAutoExportCard.js';
import { OAuthSourceCard } from '../components/OAuthSourceCard.js';
import { FhirCard } from '../components/FhirCard.js';
import { LifestyleCard } from '../components/LifestyleCard.js';

export interface SourcesTabProps {
  consentData?: ConsentStatus;
  onRevokeConsent: () => void;
  isRevokingConsent: boolean;
  onRequestConsent: () => void;

  summaryTotalCount: number;
  summaryMetricsLength: number;
  onViewMetricsTab: () => void;

  isLoadingSources: boolean;
  sources: Source[];
  syncingProvider: string | null;
  disconnectingId: string | null;

  isAppleUploadPending: boolean;
  isFhirUploadPending: boolean;
  isGenerateMockPending: boolean;
  isTogglePending: boolean;
  isDeleteSamplesPending: boolean;

  onAppleUploadClick: () => void;
  onOpenHaeModal: () => void;
  onOpenGoogleCodelab: () => void;
  onOpenManualLabModal?: () => void;
  onFhirUploadClick: () => void;
  onNavigateDashboard: () => void;

  onToggleSource: (sourceId: string, enabled: boolean) => void;
  onDeleteSamples: (sourceId: string) => void;
  onDisconnectSource: (sourceId: string, deleteData?: boolean) => void;
  onConnectOAuth: (provider: 'oura' | 'strava' | 'withings' | 'google-fit') => void;
  onSyncSource: (provider: 'oura' | 'strava' | 'withings' | 'google-fit', label: string) => void;
  onGenerateMock: () => void;

  lifestyleMeta: Record<string, MetricResult | undefined>;
  lifestyleVals: Record<string, string>;
  lifestyleError: string | null;
  isLifestyleSaving: boolean;
  onLifestyleChange: (key: string, value: string) => void;
  onSaveLifestyle: () => void;
}

export function SourcesTab({
  consentData,
  onRevokeConsent,
  isRevokingConsent,
  onRequestConsent,
  summaryTotalCount,
  summaryMetricsLength,
  onViewMetricsTab,
  isLoadingSources,
  sources,
  syncingProvider,
  disconnectingId,
  isAppleUploadPending,
  isFhirUploadPending,
  isGenerateMockPending,
  isTogglePending,
  isDeleteSamplesPending,
  onAppleUploadClick,
  onOpenHaeModal,
  onOpenGoogleCodelab,
  onOpenManualLabModal,
  onFhirUploadClick,
  onNavigateDashboard,
  onToggleSource,
  onDeleteSamples,
  onDisconnectSource,
  onConnectOAuth,
  onSyncSource,
  onGenerateMock,
  lifestyleMeta,
  lifestyleVals,
  lifestyleError,
  isLifestyleSaving,
  onLifestyleChange,
  onSaveLifestyle,
}: SourcesTabProps) {
  // Source finders matching original logic
  const appleSrc =
    sources.find((s) => s.kind === 'apple_health' && s.adapter !== 'health_auto_export') ??
    sources.find((s) => s.kind === 'apple_health');

  const haeSrc = sources.find(
    (s) => (s.kind === 'apple_health' && s.adapter === 'health_auto_export') || s.kind === 'health_auto_export',
  );

  const ouraSrc = sources.find((s) => s.kind === 'oura');
  const stravaSrc = sources.find((s) => s.kind === 'strava');
  const withingsSrc = sources.find((s) => s.kind === 'withings');
  const googleSrc = sources.find((s) => s.kind === 'google_fit');
  const fhirSrc = sources.find((s) => s.kind === 'lab');

  return (
    <>
      {/* DSGVO Art. 9 Banner */}
      <ConsentStatusBanner
        consentData={consentData}
        onRevoke={onRevokeConsent}
        isRevoking={isRevokingConsent}
        onRequestConsent={onRequestConsent}
      />

      {/* Summary Alert */}
      {summaryTotalCount > 0 && (
        <div
          onClick={onViewMetricsTab}
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
            <span>
              <strong>{summaryTotalCount} Messwerte</strong> synchronisiert ({summaryMetricsLength} Vitalparameter).
            </span>
          </div>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#0f6e56', textDecoration: 'underline' }}>
            Vitaldaten ansehen →
          </span>
        </div>
      )}

      {/* Krankenkassen-Relevanz Legend */}
      <div style={{
        padding: '12px 18px',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.65)',
        border: '1px solid rgba(0,0,0,0.06)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        fontSize: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, color: '#22221f' }}>
          <ShieldCheck size={16} color="#0f6e56" />
          <span>Krankenkassen-Relevanz (Prämienrabatt):</span>
        </div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', fontSize: 11 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#0f6e56' }}>
            <span style={{ width: 8, height: 8, borderRadius: 99, background: '#1d9e75' }} />
            <strong>Zugelassen:</strong> Cloud-OAuth (Withings, Oura, Strava, Google Fit) &amp; FHIR-Labor
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#888780' }}>
            <span style={{ width: 8, height: 8, borderRadius: 99, background: '#a8a89c' }} />
            <strong>Ausgeschlossen:</strong> Mock-Generatoren, manuelle Uploads &amp; Fragebögen
          </span>
        </div>
      </div>

      {/* Sources Grid */}
      {isLoadingSources ? (
        <div className="responsive-grid-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <Skeleton height={140} />
            </Card>
          ))}
        </div>
      ) : (
        <div className="responsive-grid-2">
          {/* Apple Health */}
          <AppleHealthCard
            src={appleSrc}
            isUploading={isAppleUploadPending}
            isDisconnecting={disconnectingId === appleSrc?.id}
            isTogglePending={isTogglePending}
            isGeneratingMock={isGenerateMockPending}
            onUploadClick={onAppleUploadClick}
            onToggle={(enabled) => appleSrc && onToggleSource(appleSrc.id, enabled)}
            onDisconnect={() => appleSrc && onDisconnectSource(appleSrc.id, true)}
            onGenerateMock={onGenerateMock}
          />

          {/* Health Auto Export */}
          <HealthAutoExportCard
            src={haeSrc}
            isDisconnecting={disconnectingId === haeSrc?.id}
            isTogglePending={isTogglePending}
            onOpenModal={onOpenHaeModal}
            onToggle={(enabled) => haeSrc && onToggleSource(haeSrc.id, enabled)}
            onDisconnect={() => haeSrc && onDisconnectSource(haeSrc.id, true)}
          />

          {/* Oura Ring */}
          <OAuthSourceCard
            title="Oura Ring"
            description="Schlaf-Scores, Readiness, Ruhepuls und HRV-Trends über die Cloud-API."
            icon={<CircleDot size={28} color="#0f6e56" />}
            src={ouraSrc}
            defaultReadyLabel="In Kürze"
            noteBanner={
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'rgba(238, 108, 43, 0.08)',
                  border: '1px solid rgba(238, 108, 43, 0.25)',
                  fontSize: 12,
                  color: '#c2410c',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  lineHeight: 1.45,
                }}
              >
                <Info size={16} color="#c2410c" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong>Hinweis:</strong> Die Verknüpfung mit Oura erfordert ein Oura-Abonnement und ist derzeit noch
                  nicht implementiert.
                </div>
              </div>
            }
            isSyncing={syncingProvider === 'oura'}
            isDisconnecting={disconnectingId === ouraSrc?.id}
            isTogglePending={isTogglePending}
            isDeletePending={isDeleteSamplesPending}
            onConnect={() => onConnectOAuth('oura')}
            onSync={() => onSyncSource('oura', 'Oura Ring')}
            onToggle={(enabled) => ouraSrc && onToggleSource(ouraSrc.id, enabled)}
            onViewData={onViewMetricsTab}
            onDisconnect={(deleteData) => ouraSrc && onDisconnectSource(ouraSrc.id, deleteData)}
            onDeleteSamples={() => ouraSrc && onDeleteSamples(ouraSrc.id)}
          />

          {/* Strava */}
          <OAuthSourceCard
            title="Strava"
            description="Ausdaueraktivitäten, Trainingsbelastung und Pace-Metriken."
            icon={<Activity size={28} color="#0f6e56" />}
            src={stravaSrc}
            defaultReadyLabel="In Kürze"
            noteBanner={
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'rgba(238, 108, 43, 0.08)',
                  border: '1px solid rgba(238, 108, 43, 0.25)',
                  fontSize: 12,
                  color: '#c2410c',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  lineHeight: 1.45,
                }}
              >
                <Info size={16} color="#c2410c" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong>Hinweis:</strong> Die Verknüpfung mit Strava erfordert ein Strava-Pro-Abonnement und ist derzeit
                  noch nicht implementiert.
                </div>
              </div>
            }
            isSyncing={syncingProvider === 'strava'}
            isDisconnecting={disconnectingId === stravaSrc?.id}
            isTogglePending={isTogglePending}
            isDeletePending={isDeleteSamplesPending}
            onConnect={() => onConnectOAuth('strava')}
            onSync={() => onSyncSource('strava', 'Strava')}
            onToggle={(enabled) => stravaSrc && onToggleSource(stravaSrc.id, enabled)}
            onViewData={onViewMetricsTab}
            onDisconnect={(deleteData) => stravaSrc && onDisconnectSource(stravaSrc.id, deleteData)}
            onDeleteSamples={() => stravaSrc && onDeleteSamples(stravaSrc.id)}
          />

          {/* Withings */}
          <OAuthSourceCard
            title="Withings"
            description="Blutdruckmessungen, Körperzusammensetzung und Pulswellengeschwindigkeit."
            icon={<Scale size={28} color="#0f6e56" />}
            src={withingsSrc}
            defaultReadyLabel="Bereit"
            isSyncing={syncingProvider === 'withings'}
            isDisconnecting={disconnectingId === withingsSrc?.id}
            isTogglePending={isTogglePending}
            isDeletePending={isDeleteSamplesPending}
            onConnect={() => onConnectOAuth('withings')}
            onSync={() => onSyncSource('withings', 'Withings')}
            onToggle={(enabled) => withingsSrc && onToggleSource(withingsSrc.id, enabled)}
            onViewData={onViewMetricsTab}
            onDisconnect={(deleteData) => withingsSrc && onDisconnectSource(withingsSrc.id, deleteData)}
            onDeleteSamples={() => withingsSrc && onDeleteSamples(withingsSrc.id)}
          />

          {/* Google Health & Fit */}
          <OAuthSourceCard
            title="Google Health"
            description="Automatische Synchronisation von Schritten, Schlaf, Ruhepuls und Aktivitäten über Google Health."
            icon={<Bot size={28} color="#0f6e56" />}
            src={googleSrc}
            defaultReadyLabel="Bereit"
            extraBottomAction={
              <Btn full variant="secondary" onClick={onOpenGoogleCodelab}>
                Codelab-Modus (manueller Code)
              </Btn>
            }
            isSyncing={syncingProvider === 'google-fit'}
            isDisconnecting={disconnectingId === googleSrc?.id}
            isTogglePending={isTogglePending}
            isDeletePending={isDeleteSamplesPending}
            onConnect={() => onConnectOAuth('google-fit')}
            onSync={() => onSyncSource('google-fit', 'Google Health')}
            onToggle={(enabled) => googleSrc && onToggleSource(googleSrc.id, enabled)}
            onViewData={onViewMetricsTab}
            onDisconnect={(deleteData) => googleSrc && onDisconnectSource(googleSrc.id, deleteData)}
            onDeleteSamples={() => googleSrc && onDeleteSamples(googleSrc.id)}
          />

          {/* Manuell & Labor (FHIR) */}
          <FhirCard
            src={fhirSrc}
            isUploading={isFhirUploadPending}
            isDeletingSamples={isDeleteSamplesPending}
            isTogglePending={isTogglePending}
            onOpenManualLabModal={onOpenManualLabModal}
            onUploadClick={onFhirUploadClick}
            onNavigateDashboard={onNavigateDashboard}
            onToggle={(enabled) => fhirSrc && onToggleSource(fhirSrc.id, enabled)}
            onDeleteSamples={() => fhirSrc && onDeleteSamples(fhirSrc.id)}
          />
        </div>
      )}

      {/* Lebensstil & Aktivität */}
      <LifestyleCard
        lifestyleMeta={lifestyleMeta}
        lifestyleVals={lifestyleVals}
        lifestyleError={lifestyleError}
        isSaving={isLifestyleSaving}
        onValueChange={onLifestyleChange}
        onSave={onSaveLifestyle}
      />
    </>
  );
}
