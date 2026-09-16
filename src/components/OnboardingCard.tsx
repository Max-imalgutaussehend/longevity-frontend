import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles,
  Watch,
  Sliders,
  Dices,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Check,
  Zap,
} from 'lucide-react';
import { apiClient } from '../api/client.js';
import { Card, Btn, Chip } from './ui.js';
import { ConsentModal } from './ConsentModal.js';
import type { ScoreResult } from '../api/types.js';

interface SourceItem {
  id: string;
  kind: string;
  adapter: string;
  enabled: boolean;
  sampleCount?: number;
  lastSyncAt?: string | null;
}

interface ConsentStatus {
  hasConsented: boolean;
}

export function OnboardingCard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('longevity_onboarding_collapsed') === 'true';
  });
  const [showConsentModal, setShowConsentModal] = useState(false);

  const { data: sources = [] } = useQuery<SourceItem[]>({
    queryKey: ['sources'],
    queryFn: () => apiClient<SourceItem[]>('/sources'),
  });

  const { data: score } = useQuery<ScoreResult>({
    queryKey: ['score', 'current'],
    queryFn: () => apiClient<ScoreResult>('/score/current'),
  });

  const { data: consentData } = useQuery<ConsentStatus>({
    queryKey: ['account', 'consent'],
    queryFn: () => apiClient<ConsentStatus>('/account/consent'),
  });

  const generateMockMutation = useMutation({
    mutationFn: async () => {
      return apiClient<{ ok: boolean; sampleCount?: number }>('/sources/mock/generate', { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      queryClient.invalidateQueries({ queryKey: ['score'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
  });

  const hasSource = sources.some((s) => s.enabled && ((s.sampleCount ?? 0) > 0 || !!s.lastSyncAt));
  const hasCoverage = (score?.coverage ?? 0) > 0;
  const isComplete = hasSource && hasCoverage;

  function toggleCollapse() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('longevity_onboarding_collapsed', String(next));
  }

  function handleTriggerMock() {
    if (consentData?.hasConsented) {
      generateMockMutation.mutate();
    } else {
      setShowConsentModal(true);
    }
  }

  function handleStartTour() {
    window.dispatchEvent(new CustomEvent('open-tutorial'));
  }

  // If already complete and user collapsed it, show nothing or minimal badge
  if (isComplete && collapsed) {
    return null;
  }

  return (
    <>
      <Card
        data-testid="onboarding-card"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,249,245,0.85) 100%)',
          border: '1.5px solid rgba(29, 158, 117, 0.25)',
          boxShadow: '0 8px 32px -8px rgba(15, 110, 86, 0.12)',
          padding: collapsed ? '16px 24px' : '28px 32px',
          transition: 'all 0.25s ease',
        }}
      >
        {/* Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'rgba(29, 158, 117, 0.12)',
                border: '1px solid rgba(29, 158, 117, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0f6e56',
                flexShrink: 0,
              }}
            >
              <Sparkles size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <Chip color="teal">Geführtes Onboarding</Chip>
                {hasSource && <Chip color="green">1 von 2 Schritten</Chip>}
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#22221f', margin: 0 }}>
                {isComplete ? 'Onboarding erfolgreich abgeschlossen!' : 'Starte deine Longevity-Reise'}
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              data-testid="onboarding-toggle-collapse"
              onClick={toggleCollapse}
              aria-label={collapsed ? 'Onboarding ausklappen' : 'Onboarding einklappen'}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#55544f',
                padding: '6px 10px',
                borderRadius: 8,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {collapsed ? (
                <>
                  <span>Ausklappen</span>
                  <ChevronDown size={16} />
                </>
              ) : (
                <>
                  <span>Minimieren</span>
                  <ChevronUp size={16} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Collapsed summary */}
        {collapsed && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#55544f', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>Klicke auf Ausklappen, um deine Datenquellen zu verbinden oder die Tour zu starten.</span>
            <button
              type="button"
              onClick={() => navigate('/daten')}
              style={{
                background: 'none',
                border: 'none',
                color: '#0f6e56',
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
                fontSize: 12,
              }}
            >
              Zu den Daten →
            </button>
          </div>
        )}

        {/* Expanded Guide Steps */}
        {!collapsed && (
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ margin: 0, fontSize: 13, color: '#55544f', lineHeight: 1.5 }}>
              LONGEVITY berechnet deinen biologischen Vitalitätsscore aus echten Messwerten. Wähle deinen bevorzugten Einstieg:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
              {/* Step 1: Connect Source */}
              <div
                style={{
                  background: hasSource ? 'rgba(29, 158, 117, 0.06)' : 'rgba(255, 255, 255, 0.85)',
                  border: hasSource ? '1.5px solid rgba(29, 158, 117, 0.35)' : '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: 16,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 14,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Watch size={20} color="#0f6e56" />
                      <strong style={{ fontSize: 14, color: '#22221f' }}>1. Datenquelle verbinden</strong>
                    </div>
                    {hasSource ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#0f6e56', fontSize: 12, fontWeight: 500 }}>
                        <CheckCircle2 size={16} /> Verbunden
                      </span>
                    ) : (
                      <Chip color="amber">Empfohlen</Chip>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: '#55544f', margin: 0, lineHeight: 1.45 }}>
                    Verbinde Apple Health, Google Fit, Oura Ring oder importiere deine Messwerte für deine persönliche Score-Kurve.
                  </p>
                </div>

                <div>
                  <Btn
                    full
                    small
                    testId="onboarding-connect-source"
                    variant={hasSource ? 'secondary' : 'primary'}
                    onClick={() => navigate('/daten')}
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    {hasSource ? (
                      <>
                        <Check size={14} /> Weitere Quelle verknüpfen
                      </>
                    ) : (
                      <>
                        Datenquelle verbinden <ArrowRight size={14} />
                      </>
                    )}
                  </Btn>
                </div>
              </div>

              {/* Step 2: Lifestyle Questionnaire */}
              <div
                style={{
                  background: hasCoverage ? 'rgba(29, 158, 117, 0.06)' : 'rgba(255, 255, 255, 0.85)',
                  border: hasCoverage ? '1.5px solid rgba(29, 158, 117, 0.35)' : '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: 16,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 14,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Sliders size={20} color="#0f6e56" />
                      <strong style={{ fontSize: 14, color: '#22221f' }}>2. Lebensstil eintragen</strong>
                    </div>
                    {hasCoverage ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#0f6e56', fontSize: 12, fontWeight: 500 }}>
                        <CheckCircle2 size={16} /> Erfasst
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: '#888780' }}>Dauert 2 Min.</span>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: '#55544f', margin: 0, lineHeight: 1.45 }}>
                    Trage Schlafdauer, Bewegung und Rauchstatus ein, um deinen Score sofort ohne Wearable zu verfeinern.
                  </p>
                </div>

                <div>
                  <Btn
                    full
                    small
                    testId="onboarding-lifestyle"
                    variant="secondary"
                    onClick={() => navigate('/daten')}
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    Lebensstil ausfüllen <ArrowRight size={14} />
                  </Btn>
                </div>
              </div>

              {/* Step 3: Try with Mock Data or Tour */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.85)',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: 16,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 14,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Dices size={20} color="#0f6e56" />
                      <strong style={{ fontSize: 14, color: '#22221f' }}>3. Erkunden mit Testdaten</strong>
                    </div>
                    <span style={{ fontSize: 11, color: '#888780' }}>Optional</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#55544f', margin: 0, lineHeight: 1.45 }}>
                    Möchtest du das Dashboard vorab ausprobieren? Lade realistische 90-Tage-Testdaten oder starte die interaktive Tour.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <Btn
                    small
                    full
                    testId="onboarding-load-mock"
                    variant="secondary"
                    onClick={handleTriggerMock}
                    disabled={generateMockMutation.isPending}
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                  >
                    {generateMockMutation.isPending ? (
                      'Wird geladen...'
                    ) : (
                      <>
                        <Zap size={13} /> Testdaten laden
                      </>
                    )}
                  </Btn>
                  <Btn
                    small
                    testId="onboarding-start-tour"
                    variant="ghost"
                    onClick={handleStartTour}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    Tour starten
                  </Btn>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      <ConsentModal
        isOpen={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        sourceLabel="90 Tage Testdaten (Mock)"
        onConsented={() => generateMockMutation.mutate()}
      />
    </>
  );
}
