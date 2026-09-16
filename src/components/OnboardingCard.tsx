import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles,
  Watch,
  Sliders,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react';
import { apiClient } from '../api/client.js';
import { Card, Btn, Chip } from './ui.js';
import { ConsentModal } from './ConsentModal.js';
import type { ScoreResult, User } from '../api/types.js';

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

  const { data: user } = useQuery<User>({
    queryKey: ['me'],
    queryFn: () => apiClient<User>('/me'),
  });

  const [tutorialCompleted, setTutorialCompleted] = useState<boolean>(() => {
    return localStorage.getItem('longevity_tutorial_completed') === 'true';
  });

  useEffect(() => {
    const checkTutorial = () => {
      const userKey = user?.id ? `longevity_tutorial_completed_${user.id}` : null;
      const isDone =
        (userKey ? localStorage.getItem(userKey) === 'true' : false) ||
        localStorage.getItem('longevity_tutorial_completed') === 'true';
      setTutorialCompleted(isDone);
    };
    checkTutorial();
    window.addEventListener('tutorial-completed', checkTutorial);
    return () => window.removeEventListener('tutorial-completed', checkTutorial);
  }, [user?.id]);

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
  const completedSteps = (tutorialCompleted ? 1 : 0) + (hasSource ? 1 : 0) + (hasCoverage ? 1 : 0);
  const isComplete = tutorialCompleted && hasSource && hasCoverage;

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

  // If already complete and user collapsed it, show nothing
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
                <Chip color={completedSteps === 3 ? 'green' : 'teal'}>{completedSteps} von 3 Schritten</Chip>
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#22221f', margin: 0 }}>
                {completedSteps === 3 ? 'Onboarding erfolgreich abgeschlossen! 🎉' : 'Starte deine Longevity-Reise'}
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
            <span>Klicke auf Ausklappen, um deine Onboarding-Schritte fortzusetzen oder die Tour zu starten.</span>
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
              LONGEVITY berechnet deinen biologischen Vitalitätsscore aus echten Messwerten. Schließe die folgenden 3 Schritte für dein persönliches Cockpit ab:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
              {/* Step 1: Interactive Tutorial */}
              <div
                style={{
                  background: tutorialCompleted ? 'rgba(29, 158, 117, 0.06)' : 'rgba(255, 255, 255, 0.85)',
                  border: tutorialCompleted ? '1.5px solid rgba(29, 158, 117, 0.35)' : '1.5px solid rgba(29, 158, 117, 0.3)',
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
                      <Sparkles size={20} color="#0f6e56" />
                      <strong style={{ fontSize: 14, color: '#22221f' }}>1. Interaktive Einführung</strong>
                    </div>
                    {tutorialCompleted ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#0f6e56', fontSize: 12, fontWeight: 500 }}>
                        <CheckCircle2 size={16} /> Abgeschlossen
                      </span>
                    ) : (
                      <Chip color="teal">Schritt 1</Chip>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: '#55544f', margin: 0, lineHeight: 1.45 }}>
                    {tutorialCompleted
                      ? 'Du hast die 4 Vitalitätsdomänen, den Hebel-Simulator und die datenschutzkonforme Freigabe kennengelernt.'
                      : '2-minütige interaktive Tour durch Score-Berechnung, Wearables, Simulator und Datenschutz.'}
                  </p>
                </div>

                <div>
                  <Btn
                    full
                    small
                    testId="onboarding-start-tour"
                    variant={tutorialCompleted ? 'ghost' : 'primary'}
                    onClick={handleStartTour}
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    {tutorialCompleted ? (
                      'Tutorial wiederholen ↺'
                    ) : (
                      <>
                        Tutorial starten <Sparkles size={14} />
                      </>
                    )}
                  </Btn>
                </div>
              </div>

              {/* Step 2: Connect Source or Mock Data */}
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
                      <strong style={{ fontSize: 14, color: '#22221f' }}>2. Datenquelle verbinden</strong>
                    </div>
                    {hasSource ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#0f6e56', fontSize: 12, fontWeight: 500 }}>
                        <CheckCircle2 size={16} /> Verbunden
                      </span>
                    ) : (
                      <Chip color={tutorialCompleted ? 'amber' : 'neutral'}>
                        {tutorialCompleted ? 'Empfohlen' : 'Schritt 2'}
                      </Chip>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: '#55544f', margin: 0, lineHeight: 1.45 }}>
                    {hasSource
                      ? 'Deine Gesundheitsdaten fließen ein. Du kannst jederzeit weitere Quellen oder Wearables ergänzen.'
                      : 'Verbinde Apple Health, Google Fit, Oura oder teste das Cockpit sofort mit 90 Tagen Beispieldaten.'}
                  </p>
                </div>

                <div>
                  {hasSource ? (
                    <Btn
                      full
                      small
                      testId="onboarding-connect-source"
                      variant="secondary"
                      onClick={() => navigate('/daten')}
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    >
                      Quellen verwalten <ArrowRight size={14} />
                    </Btn>
                  ) : (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Btn
                        full
                        small
                        testId="onboarding-connect-source"
                        variant="primary"
                        onClick={() => navigate('/daten')}
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                      >
                        Tracker verbinden <ArrowRight size={13} />
                      </Btn>
                      <Btn
                        small
                        testId="onboarding-load-mock"
                        variant="secondary"
                        onClick={handleTriggerMock}
                        disabled={generateMockMutation.isPending}
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4, whiteSpace: 'nowrap' }}
                      >
                        {generateMockMutation.isPending ? (
                          'Lade...'
                        ) : (
                          <>
                            <Zap size={13} /> Testdaten
                          </>
                        )}
                      </Btn>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: Vitality Score & Levers */}
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
                      <strong style={{ fontSize: 14, color: '#22221f' }}>3. Vitalitäts-Score & Hebel</strong>
                    </div>
                    {hasCoverage ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#0f6e56', fontSize: 12, fontWeight: 500 }}>
                        <CheckCircle2 size={16} /> Berechnet
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: '#888780' }}>Schritt 3</span>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: '#55544f', margin: 0, lineHeight: 1.45 }}>
                    {hasCoverage
                      ? 'Dein Vitalitäts-Score ist aktiv berechnet. Entdecke deine wirksamsten Hebel im Simulator.'
                      : 'Sobald Daten synchronisiert sind, ermittelt die Longevity-Engine dein Vitalitätsalter und Prioritäts-Hebel.'}
                  </p>
                </div>

                <div>
                  <Btn
                    full
                    small
                    testId="onboarding-lifestyle"
                    variant={hasCoverage ? 'primary' : 'secondary'}
                    onClick={() => navigate(hasSource ? '/hebel' : '/daten')}
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    {hasCoverage
                      ? <>Hebel-Simulator öffnen <ArrowRight size={14} /></>
                      : (hasSource ? 'Hebel-Simulator öffnen →' : 'Lebensstil eintragen →')}
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
