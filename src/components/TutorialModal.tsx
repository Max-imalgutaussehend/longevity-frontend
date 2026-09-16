import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ConsentModal } from './ConsentModal.js';
import {
  Activity,
  Sparkles,
  Briefcase,
  X,
  Heart,
  Moon,
  Zap,
  Shield,
  Bot,
  Apple,
  FlaskConical,
  Dices,
  Check,
  Footprints,
  Lock,
  ShieldCheck,
  Gift,
  Building2,
  Dumbbell,
  Watch,
  BarChart3,
  Sliders,
  Radio,
  ArrowLeft,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';
import { apiClient } from '../api/client.js';
import { Btn, Chip } from './ui.js';
import brandIcon from '../assets/brand-icon.png';

export interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: number;
}

type Archetype = 'athletic' | 'balanced' | 'starter';

interface ArchetypeProfile {
  id: Archetype;
  label: string;
  icon: React.ReactNode;
  desc: string;
  targetScore: number;
  domains: { cardio: number; regen: number; activity: number; risk: number };
}

const ARCHETYPES: ArchetypeProfile[] = [
  {
    id: 'athletic',
    label: 'Sportlich & Aktiv',
    icon: <Activity size={24} color="#0f6e56" />,
    desc: '10.000 Schritte, 2x Zone-2 & 8h Schlaf',
    targetScore: 84,
    domains: { cardio: 88, regen: 82, activity: 92, risk: 85 },
  },
  {
    id: 'balanced',
    label: 'Ausgeglichen',
    icon: <Sparkles size={24} color="#0f6e56" />,
    desc: '7.500 Schritte, moderate Bewegung, 7h Schlaf',
    targetScore: 71,
    domains: { cardio: 72, regen: 70, activity: 74, risk: 75 },
  },
  {
    id: 'starter',
    label: 'Startphase / Büro',
    icon: <Briefcase size={24} color="#0f6e56" />,
    desc: 'Viel Sitzen, unregelmäßiger Schlaf, Neubeginn',
    targetScore: 54,
    domains: { cardio: 55, regen: 50, activity: 48, risk: 62 },
  },
];

// Confetti Particle Component
function ConfettiCanvas() {
  const particles = useMemo(() => {
    const colors = ['#1d9e75', '#0f6e56', '#5dcaa5', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'];
    return Array.from({ length: 42 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      size: 6 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 1.5,
      duration: 2.2 + Math.random() * 1.8,
      rotate: Math.random() * 360,
    }));
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 10 }}>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size * (Math.random() > 0.5 ? 1 : 1.6),
            backgroundColor: p.color,
            borderRadius: p.size > 10 ? '50%' : 2,
            transform: `rotate(${p.rotate}deg)`,
            opacity: 0.9,
            animation: `confettiFall ${p.duration}s cubic-bezier(0.25, 1, 0.5, 1) ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}

export function TutorialModal({ isOpen, onClose, initialStep = 1 }: TutorialModalProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(initialStep);
  const [dontShowAgain, setDontShowAgain] = useState(true);

  // ── Step 1 State: Interactive Archetypes & Dynamic Count-Up ────────
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype>('athletic');
  const [userAge, setUserAge] = useState<number>(30);
  const [displayScore, setDisplayScore] = useState<number>(84);

  // Smooth score count-up animation when archetype or age changes
  const activeProfile = ARCHETYPES.find((a) => a.id === selectedArchetype) ?? ARCHETYPES[0];
  const targetScore = activeProfile.targetScore;

  useEffect(() => {
    let current = displayScore;
    const stepDiff = targetScore - current;
    if (stepDiff === 0) return;

    const interval = setInterval(() => {
      current += stepDiff > 0 ? 1 : -1;
      setDisplayScore(current);
      if (current === targetScore) clearInterval(interval);
    }, 18);

    return () => clearInterval(interval);
  }, [targetScore, displayScore]);

  const bioAgeDelta = Number(((displayScore - 50) / 10).toFixed(1));
  const calculatedBioAge = Number((userAge - bioAgeDelta).toFixed(1));

  // ── Step 2 State: Mock Data Ingest ────────────────────────────────
  const [mockSuccess, setMockSuccess] = useState(false);
  const [activeSourceHighlight, setActiveSourceHighlight] = useState<string | null>(null);
  const [showConsentModal, setShowConsentModal] = useState(false);

  interface ConsentStatus {
    hasConsented: boolean;
  }

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
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      queryClient.invalidateQueries({ queryKey: ['score'] });
      queryClient.invalidateQueries({ queryKey: ['samples'] });
      setMockSuccess(true);
    },
  });

  function handleTriggerMock() {
    if (consentData?.hasConsented) {
      generateMockMutation.mutate();
    } else {
      setShowConsentModal(true);
    }
  }

  // ── Step 3 State: Interactive Simulator ───────────────────────────
  const [stepsHabit, setStepsHabit] = useState(8500);
  const [zone2Habit, setZone2Habit] = useState(90);
  const [sleepHabit, setSleepHabit] = useState(7.5);

  const stepContribution = Math.min(15, Math.max(0, ((stepsHabit - 5000) / 7000) * 12));
  const zone2Contribution = Math.min(18, Math.max(0, (zone2Habit / 150) * 15));
  const sleepDelta = Math.abs(sleepHabit - 7.5);
  const sleepContribution = Math.max(0, 10 - sleepDelta * 6);
  const simulatedScore = Math.round(52 + stepContribution + zone2Contribution + sleepContribution);
  const simulatedAgeDelta = Number(((simulatedScore - 50) / 10).toFixed(1));
  const simulatedBioAge = Number((userAge - simulatedAgeDelta).toFixed(1));

  // ── Step 4 State: Cryptographic Token Simulator ───────────────────
  const [isSigningToken, setIsSigningToken] = useState(false);
  const [hasSignedToken, setHasSignedToken] = useState(false);

  const handleSimulateSign = () => {
    setIsSigningToken(true);
    setTimeout(() => {
      setIsSigningToken(false);
      setHasSignedToken(true);
    }, 700);
  };

  const handleClose = useCallback(() => {
    if (dontShowAgain) {
      localStorage.setItem('longevity_tutorial_completed', 'true');
    }
    onClose();
  }, [dontShowAgain, onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowRight') setStep((s) => Math.min(5, s + 1));
      if (e.key === 'ArrowLeft') setStep((s) => Math.max(1, s - 1));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  // SVG Gauge calculations
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <>
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes stepSlideIn {
          from { opacity: 0; transform: translateX(18px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(520px) rotate(720deg); opacity: 0; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 15px rgba(29,158,117,0.25); }
          50% { box-shadow: 0 0 35px rgba(29,158,117,0.55); }
        }
        @keyframes shimmerBtn {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .anim-shimmer {
          background: linear-gradient(90deg, #1d9e75 0%, #34d399 50%, #0f6e56 100%);
          background-size: 200% 100%;
          animation: shimmerBtn 3s infinite linear;
        }
        .archetype-btn {
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .archetype-btn:hover {
          transform: translateY(-2px);
        }
        .card-interactive {
          transition: all 0.2s ease;
        }
        .card-interactive:hover {
          border-color: #0f6e56 !important;
          transform: translateY(-2px);
        }
      `}</style>

      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(12, 20, 16, 0.52)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          animation: 'fadeInScale 0.25s ease-out',
        }}
        onClick={handleClose}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 720,
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(28px)',
            borderRadius: 28,
            boxShadow: '0 30px 80px -15px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.9) inset',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '94vh',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Confetti overlay in Step 5 */}
          {step === 5 && <ConfettiCanvas />}

          {/* Top Header Bar */}
          <div style={{
            padding: '18px 28px 14px',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255,255,255,0.8)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: 'rgba(29,158,117,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 3,
              }}>
                <img src={brandIcon} alt="Logo" style={{ width: 22, height: 22, objectFit: 'contain' }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0f6e56', letterSpacing: '0.01em' }}>
                  LONGEVITY GUIDE
                </div>
                <div style={{ fontSize: 11, color: '#888780' }}>Interaktive Entdeckungsreise</div>
              </div>
            </div>

            {/* Stepper Dots & Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setStep(s)}
                  title={`Schritt ${s}`}
                  style={{
                    height: 7,
                    width: step === s ? 28 : 7,
                    borderRadius: 99,
                    background: step === s ? '#0f6e56' : 'rgba(0,0,0,0.14)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    padding: 0,
                  }}
                />
              ))}
            </div>

            <button
              onClick={handleClose}
              title="Schließen (Esc)"
              style={{
                background: 'rgba(0,0,0,0.05)',
                border: 'none',
                borderRadius: 99,
                width: 30,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#55544f',
                transition: 'background 0.15s',
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Content Area */}
          <div style={{
            padding: '24px 32px 28px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            animation: 'stepSlideIn 0.22s ease-out',
          }}>
            
            {/* ════════ STEP 1: Interactive Archetypes & Dynamic Score ════════ */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ textAlign: 'center' }}>
                  <Chip color="teal">Schritt 1 von 5 · Interaktiver Einstieg</Chip>
                  <h2 style={{ fontSize: 22, fontWeight: 600, color: '#22221f', margin: '10px 0 4px', letterSpacing: '-0.02em' }}>
                    Dein Pass kennt dein Alter. Dein Körper deine Vitalität.
                  </h2>
                  <p style={{ fontSize: 13, color: '#55544f', maxWidth: 540, margin: '0 auto', lineHeight: 1.45 }}>
                    Wähle unten dein typisches Lebensstil-Profil und dein Alter, um live zu sehen,
                    wie die 4 wissenschaftlichen Säulen deinen <strong>Score</strong> und dein <strong>Vitalitätsalter</strong> formen.
                  </p>
                </div>

                {/* Interactive Archetype Cards */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8, textAlign: 'center' }}>
                    Klicke auf ein Profil zum Ausprobieren:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {ARCHETYPES.map((arch) => {
                      const isSelected = selectedArchetype === arch.id;
                      return (
                        <button
                          key={arch.id}
                          type="button"
                          className="archetype-btn"
                          onClick={() => setSelectedArchetype(arch.id)}
                          style={{
                            padding: '12px 10px',
                            borderRadius: 16,
                            border: isSelected ? '2px solid #0f6e56' : '1px solid rgba(0,0,0,0.08)',
                            background: isSelected ? 'rgba(15,110,86,0.08)' : 'rgba(255,255,255,0.75)',
                            cursor: 'pointer',
                            textAlign: 'center',
                            boxShadow: isSelected ? '0 4px 16px rgba(15,110,86,0.18)' : 'none',
                          }}
                        >
                          <div style={{ marginBottom: 4, display: 'flex', justifyContent: 'center' }}>{arch.icon}</div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: isSelected ? '#0f6e56' : '#22221f' }}>
                            {arch.label}
                          </div>
                          <div style={{ fontSize: 10, color: '#55544f', marginTop: 3, lineHeight: 1.3 }}>
                            {arch.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Animated Visual Showcase */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(240,248,244,0.85) 0%, rgba(230,244,238,0.65) 100%)',
                  border: '1px solid rgba(29,158,117,0.22)',
                  borderRadius: 20,
                  padding: '18px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 20,
                  boxShadow: '0 8px 24px rgba(29,158,117,0.12)',
                }}>
                  {/* Left: Circular SVG Gauge with animated stroke */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ position: 'relative', width: 108, height: 108 }}>
                      <svg width="108" height="108" style={{ transform: 'rotate(-90deg)' }}>
                        {/* Background track */}
                        <circle
                          cx="54"
                          cy="54"
                          r={radius}
                          stroke="rgba(0,0,0,0.06)"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        {/* Animated progress ring */}
                        <circle
                          cx="54"
                          cy="54"
                          r={radius}
                          stroke="#1d9e75"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
                        />
                      </svg>
                      {/* Inner counter */}
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <span style={{ fontSize: 28, fontWeight: 700, color: '#0f6e56', lineHeight: 1 }}>
                          {displayScore}
                        </span>
                        <span style={{ fontSize: 9, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>
                          Score
                        </span>
                      </div>
                    </div>

                    <div>
                      <Chip color={displayScore >= 75 ? 'teal' : displayScore >= 60 ? 'amber' : 'neutral'}>
                        {`Band ${Math.floor(displayScore / 10) * 10}–${Math.floor(displayScore / 10) * 10 + 9}`}
                      </Chip>
                      <div style={{ fontSize: 13, color: '#55544f', marginTop: 6 }}>
                        Pass-Alter: <strong>{userAge} Jahre</strong>
                      </div>
                      <div style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: bioAgeDelta > 0 ? '#0f6e56' : '#22221f',
                        marginTop: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}>
                        {calculatedBioAge} Jahre
                        <span style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 99,
                          background: bioAgeDelta > 0 ? 'rgba(29,158,117,0.15)' : 'rgba(168,168,156,0.18)',
                          color: bioAgeDelta > 0 ? '#0f6e56' : '#55544f',
                        }}>
                          {bioAgeDelta > 0 ? `-${bioAgeDelta} J. jünger!` : `+${Math.abs(bioAgeDelta)} J.`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: 4 Animated Domain Bars */}
                  <div style={{ flex: 1, maxWidth: 220, display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#55544f', marginBottom: 2 }}>
                      4 Säulen der Langlebigkeit:
                    </div>
                    {[
                      { label: 'Kardiometabolik', icon: <Heart size={12} color="#0f6e56" />, val: activeProfile.domains.cardio },
                      { label: 'Regeneration', icon: <Moon size={12} color="#0f6e56" />, val: activeProfile.domains.regen },
                      { label: 'Aktivität', icon: <Zap size={12} color="#0f6e56" />, val: activeProfile.domains.activity },
                      { label: 'Risiko-Faktoren', icon: <Shield size={12} color="#0f6e56" />, val: activeProfile.domains.risk },
                    ].map((d) => (
                      <div key={d.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, color: '#55544f', marginBottom: 2 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{d.icon} {d.label}</span>
                          <strong style={{ color: '#0f6e56' }}>{d.val}%</strong>
                        </div>
                        <div style={{ height: 4, borderRadius: 99, background: 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            borderRadius: 99,
                            background: 'linear-gradient(90deg, #1d9e75, #0f6e56)',
                            width: `${d.val}%`,
                            transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Age selector pills */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 12 }}>
                  <span style={{ color: '#888780' }}>Pass-Alter ändern:</span>
                  {[24, 30, 42, 55].map((age) => (
                    <button
                      key={age}
                      type="button"
                      onClick={() => setUserAge(age)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 99,
                        border: userAge === age ? '1px solid #0f6e56' : '1px solid rgba(0,0,0,0.1)',
                        background: userAge === age ? '#0f6e56' : 'transparent',
                        color: userAge === age ? '#fff' : '#55544f',
                        fontSize: 11,
                        fontWeight: userAge === age ? 600 : 400,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {age} Jahre
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ════════ STEP 2: Sources & One-Click Test Data ════════ */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ textAlign: 'center' }}>
                  <Chip color="teal">Schritt 2 von 5 · Datenquellen verbinden</Chip>
                  <h2 style={{ fontSize: 22, fontWeight: 600, color: '#22221f', margin: '10px 0 4px', letterSpacing: '-0.02em' }}>
                    So kommen deine Daten in das System
                  </h2>
                  <p style={{ fontSize: 13, color: '#55544f', maxWidth: 520, margin: '0 auto', lineHeight: 1.45 }}>
                    Klicke auf eine Datenquelle, um Details zu sehen. Du kannst auch direkt hier mit
                    einem Klick <strong>90 Tage synthetische Testdaten</strong> laden.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {/* Google Health Tile */}
                  <div
                    className="card-interactive"
                    onClick={() => setActiveSourceHighlight('google')}
                    style={{
                      padding: 14,
                      borderRadius: 16,
                      border: activeSourceHighlight === 'google' ? '2px solid #0f6e56' : '1px solid rgba(0,0,0,0.08)',
                      background: 'rgba(255,255,255,0.75)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', color: '#0f6e56' }}><Bot size={22} /></span>
                      <strong style={{ fontSize: 13, color: '#22221f' }}>Google Health & Fit</strong>
                    </div>
                    <p style={{ fontSize: 11, color: '#55544f', margin: 0, lineHeight: 1.4 }}>
                      Health Connect Cloud: Synchronisiert bis zu 365 Tage Historie (Schritte, Ruhepuls, Schlaf & Zone 2).
                    </p>
                  </div>

                  {/* Apple Health Tile */}
                  <div
                    className="card-interactive"
                    onClick={() => setActiveSourceHighlight('apple')}
                    style={{
                      padding: 14,
                      borderRadius: 16,
                      border: activeSourceHighlight === 'apple' ? '2px solid #0f6e56' : '1px solid rgba(0,0,0,0.08)',
                      background: 'rgba(255,255,255,0.75)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', color: '#0f6e56' }}><Apple size={22} /></span>
                      <strong style={{ fontSize: 13, color: '#22221f' }}>Apple Health</strong>
                    </div>
                    <p style={{ fontSize: 11, color: '#55544f', margin: 0, lineHeight: 1.4 }}>
                      Importiere deine <code>export.xml</code>-Datei oder nutze den Health Auto Export Webhook für automatischen Push.
                    </p>
                  </div>

                  {/* Labor & Lifestyle Tile */}
                  <div
                    className="card-interactive"
                    onClick={() => setActiveSourceHighlight('manual')}
                    style={{
                      padding: 14,
                      borderRadius: 16,
                      border: activeSourceHighlight === 'manual' ? '2px solid #0f6e56' : '1px solid rgba(0,0,0,0.08)',
                      background: 'rgba(255,255,255,0.75)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', color: '#0f6e56' }}><FlaskConical size={22} /></span>
                      <strong style={{ fontSize: 13, color: '#22221f' }}>Laborwerte & Lifestyle</strong>
                    </div>
                    <p style={{ fontSize: 11, color: '#55544f', margin: 0, lineHeight: 1.4 }}>
                      Ergänze Cholesterin (LDL/HDL), Blutzucker (HbA1c) und deinen Lifestyle-Fragebogen mit wenigen Klicks.
                    </p>
                  </div>

                  {/* Mock Data Generator with interactive trigger */}
                  <div style={{
                    padding: 14,
                    borderRadius: 16,
                    border: '1px solid rgba(29,158,117,0.3)',
                    background: 'rgba(29,158,117,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', color: '#0f6e56' }}><Dices size={22} /></span>
                        <strong style={{ fontSize: 13, color: '#0f6e56' }}>90 Tage Sofort-Testdaten</strong>
                      </div>
                      <p style={{ fontSize: 11, color: '#55544f', margin: 0, lineHeight: 1.4 }}>
                        Ideal zum Testen: Erzeugt sofort realistische Messreihen für deinen Account.
                      </p>
                    </div>

                    <Btn
                      small
                      variant={mockSuccess ? 'ghost' : 'secondary'}
                      disabled={generateMockMutation.isPending || mockSuccess}
                      onClick={handleTriggerMock}
                      style={{ marginTop: 4 }}
                    >
                      {generateMockMutation.isPending ? (
                        'Wird generiert...'
                      ) : mockSuccess ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Check size={14} /> 90 Tage Daten aktiv!
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Zap size={14} /> Testdaten jetzt laden
                        </span>
                      )}
                    </Btn>
                  </div>
                </div>

                <div style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: 'rgba(0,0,0,0.02)',
                  fontSize: 12,
                  color: '#55544f',
                  textAlign: 'center',
                }}>
                  Alle Quellen lassen sich jederzeit im Menü unter <strong>Daten</strong> verbinden, synchronisieren oder trennen.
                </div>
              </div>
            )}

            {/* ════════ STEP 3: Interactive Real-Time Simulator ════════ */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <Chip color="teal">Schritt 3 von 5 · Live Hebel-Simulator</Chip>
                  <h2 style={{ fontSize: 22, fontWeight: 600, color: '#22221f', margin: '10px 0 4px', letterSpacing: '-0.02em' }}>
                    Bewege die Regler und verjünge deinen Score
                  </h2>
                  <p style={{ fontSize: 13, color: '#55544f', maxWidth: 520, margin: '0 auto', lineHeight: 1.45 }}>
                    Hier erlebst du die Kernmagie von LONGEVITY: Die Score-Engine berechnet für jede
                    Veränderung deiner Gewohnheiten in Echtzeit den exakten Impact.
                  </p>
                </div>

                {/* Animated Score Result Box */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(15,110,86,0.1) 0%, rgba(29,158,117,0.15) 100%)',
                  border: '1px solid rgba(29,158,117,0.3)',
                  borderRadius: 18,
                  padding: '16px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 8px 24px rgba(29,158,117,0.14)',
                }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#55544f', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Simulierter Score</div>
                    <div style={{ fontSize: 30, fontWeight: 700, color: '#0f6e56' }}>
                      {simulatedScore} <span style={{ fontSize: 15, fontWeight: 400, color: '#55544f' }}>/ 100</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: '#55544f', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Vitalitätsalter</div>
                    <div style={{ fontSize: 26, fontWeight: 700, color: '#0f6e56' }}>
                      {simulatedBioAge} Jahre{' '}
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#1d9e75' }}>
                        ({simulatedAgeDelta > 0 ? `-${simulatedAgeDelta}` : `+${Math.abs(simulatedAgeDelta)}`} J.)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sliders Container */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Schritte */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 500, color: '#22221f' }}>
                        <Footprints size={15} color="#0f6e56" /> Tägliche Schritte
                      </span>
                      <strong style={{ color: '#0f6e56' }}>{stepsHabit.toLocaleString('de-DE')} Schritte</strong>
                    </div>
                    <input
                      type="range"
                      min={4000}
                      max={14000}
                      step={500}
                      value={stepsHabit}
                      onChange={(e) => setStepsHabit(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#0f6e56', cursor: 'pointer' }}
                    />
                  </div>

                  {/* Zone 2 */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 500, color: '#22221f' }}>
                        <Heart size={15} color="#0f6e56" /> Zone-2 Cardio (Ausdauer)
                      </span>
                      <strong style={{ color: '#0f6e56' }}>{zone2Habit} Min. / Woche</strong>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={210}
                      step={15}
                      value={zone2Habit}
                      onChange={(e) => setZone2Habit(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#0f6e56', cursor: 'pointer' }}
                    />
                  </div>

                  {/* Schlaf */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 500, color: '#22221f' }}>
                        <Moon size={15} color="#0f6e56" /> Schlafdauer
                      </span>
                      <strong style={{ color: '#0f6e56' }}>{sleepHabit} Stunden</strong>
                    </div>
                    <input
                      type="range"
                      min={5.5}
                      max={9.0}
                      step={0.5}
                      value={sleepHabit}
                      onChange={(e) => setSleepHabit(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#0f6e56', cursor: 'pointer' }}
                    />
                  </div>
                </div>

                {simulatedScore >= 80 && (
                  <div style={{
                    padding: '8px 14px',
                    borderRadius: 12,
                    background: 'rgba(29,158,117,0.12)',
                    border: '1px solid rgba(29,158,117,0.3)',
                    fontSize: 12,
                    color: '#0f6e56',
                    textAlign: 'center',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}>
                    <Sparkles size={15} color="#0f6e56" /> Fantastisch! Ab Score 80 erreichst du die höchste Stufe für Partner-Rabatte.
                  </div>
                )}
              </div>
            )}

            {/* ════════ STEP 4: Privacy & Benefits Simulator ════════ */}
            {step === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <Chip color="teal">Schritt 4 von 5 · Privatsphäre & Vorteile</Chip>
                  <h2 style={{ fontSize: 22, fontWeight: 600, color: '#22221f', margin: '10px 0 4px', letterSpacing: '-0.02em' }}>
                    Gesundheit belohnen ohne Datenpreisgabe
                  </h2>
                  <p style={{ fontSize: 13, color: '#55544f', maxWidth: 520, margin: '0 auto', lineHeight: 1.45 }}>
                    Partner belohnen deinen Lebensstil. Mit unserer <strong>Zero-Knowledge Signatur</strong>
                    überträgst du ausschließlich das Score-Band — keine Rohdaten.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {/* Left: Interactive Privacy Token Box */}
                  <div style={{
                    padding: 16,
                    borderRadius: 18,
                    border: '1px solid rgba(29,158,117,0.3)',
                    background: 'rgba(29,158,117,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', color: '#0f6e56' }}><Lock size={20} /></span>
                      <strong style={{ fontSize: 13, color: '#0f6e56' }}>Kryptografischer Nachweis</strong>
                    </div>

                    <div style={{
                      background: '#fff',
                      borderRadius: 12,
                      padding: '12px 14px',
                      border: '1px dashed rgba(29,158,117,0.4)',
                      fontSize: 12,
                      color: '#22221f',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}>
                      <div>Freigabe: <strong>Band 70–79</strong></div>
                      <div style={{ fontSize: 11, color: '#888780' }}>
                        Signatur: {hasSignedToken ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Check size={13} color="#0f6e56" /> Ed25519 (Gültig)
                          </span>
                        ) : (
                          'Nicht signiert'
                        )}
                      </div>
                      <div style={{ fontSize: 10, color: '#a3a29c', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                        {hasSignedToken
                          ? 'hash: 9f82c...e4b1 (Verifizierbar)'
                          : 'Klicke unten, um Signatur zu testen'}
                      </div>
                    </div>

                    <Btn
                      small
                      variant={hasSignedToken ? 'ghost' : 'secondary'}
                      disabled={isSigningToken}
                      onClick={handleSimulateSign}
                    >
                      {isSigningToken ? (
                        'Signiere...'
                      ) : hasSignedToken ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Check size={14} /> Signatur erfolgreich!
                        </span>
                      ) : (
                        'Signatur jetzt testen'
                      )}
                    </Btn>

                    <div style={{ fontSize: 11, color: '#55544f', lineHeight: 1.35, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ShieldCheck size={16} color="#0f6e56" style={{ flexShrink: 0 }} />
                      <span><strong>Zero Raw-Data:</strong> Dein Puls, deine Schritte oder Schlafdauer verlassen niemals dein Gerät!</span>
                    </div>
                  </div>

                  {/* Right: Partner Benefits Box */}
                  <div style={{
                    padding: 16,
                    borderRadius: 18,
                    border: '1px solid rgba(0,0,0,0.08)',
                    background: 'rgba(255,255,255,0.75)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', color: '#0f6e56' }}><Gift size={20} /></span>
                      <strong style={{ fontSize: 13, color: '#22221f' }}>Freischaltbare Vorteile</strong>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                      <div style={{ padding: '8px 10px', borderRadius: 10, background: 'rgba(29,158,117,0.08)', color: '#0f6e56' }}>
                        <Building2 size={15} style={{ verticalAlign: 'middle', marginRight: 6, color: '#0f6e56' }} />
                        <strong>Bis zu 15% Rabatt</strong> auf private Krankenversicherungen
                      </div>
                      <div style={{ padding: '8px 10px', borderRadius: 10, background: 'rgba(29,158,117,0.08)', color: '#0f6e56' }}>
                        <Dumbbell size={15} style={{ verticalAlign: 'middle', marginRight: 6, color: '#0f6e56' }} />
                        <strong>40 € monatlich</strong> Zuschuss für Fitness & Wellness
                      </div>
                      <div style={{ padding: '8px 10px', borderRadius: 10, background: 'rgba(29,158,117,0.08)', color: '#0f6e56' }}>
                        <Watch size={15} style={{ verticalAlign: 'middle', marginRight: 6, color: '#0f6e56' }} />
                        <strong>Wearable-Boni</strong> auf Oura, Garmin & Whoop
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ════════ STEP 5: Grand Finale & Cockpit Tour ════════ */}
            {step === 5 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <Chip color="green">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      Schritt 5 von 5 · Bereit zum Start <Sparkles size={12} />
                    </span>
                  </Chip>
                  <h2 style={{ fontSize: 22, fontWeight: 600, color: '#22221f', margin: '10px 0 4px', letterSpacing: '-0.02em' }}>
                    Dein persönliches Cockpit ist startklar!
                  </h2>
                  <p style={{ fontSize: 13, color: '#55544f', maxWidth: 500, margin: '0 auto', lineHeight: 1.45 }}>
                    Klicke auf einen Bereich, um direkt dorthin zu navigieren:
                  </p>
                </div>

                {/* 4 Interactive App Tour Tiles */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button
                    type="button"
                    className="card-interactive"
                    onClick={() => { handleClose(); navigate('/dashboard'); }}
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      border: '1px solid rgba(0,0,0,0.08)',
                      background: 'rgba(255,255,255,0.85)',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', color: '#0f6e56' }}><BarChart3 size={20} /></div>
                    <strong style={{ fontSize: 12, color: '#22221f', display: 'block' }}>Dashboard & Score</strong>
                    <span style={{ fontSize: 11, color: '#55544f', lineHeight: 1.3 }}>
                      90-Tage Trendlinie & 4 Domänen im Überblick.
                    </span>
                  </button>

                  <button
                    type="button"
                    className="card-interactive"
                    onClick={() => { handleClose(); navigate('/hebel'); }}
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      border: '1px solid rgba(0,0,0,0.08)',
                      background: 'rgba(255,255,255,0.85)',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', color: '#0f6e56' }}><Sliders size={20} /></div>
                    <strong style={{ fontSize: 12, color: '#22221f', display: 'block' }}>Hebel-Simulator</strong>
                    <span style={{ fontSize: 11, color: '#55544f', lineHeight: 1.3 }}>
                      Finde deine wirkungsvollsten Gewohnheiten.
                    </span>
                  </button>

                  <button
                    type="button"
                    className="card-interactive"
                    onClick={() => { handleClose(); navigate('/daten'); }}
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      border: '1px solid rgba(0,0,0,0.08)',
                      background: 'rgba(255,255,255,0.85)',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', color: '#0f6e56' }}><Radio size={20} /></div>
                    <strong style={{ fontSize: 12, color: '#22221f', display: 'block' }}>Daten & Wearables</strong>
                    <span style={{ fontSize: 11, color: '#55544f', lineHeight: 1.3 }}>
                      Google Health, Apple Health & Laborwerte.
                    </span>
                  </button>

                  <button
                    type="button"
                    className="card-interactive"
                    onClick={() => { handleClose(); navigate('/freigabe'); }}
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      border: '1px solid rgba(0,0,0,0.08)',
                      background: 'rgba(255,255,255,0.85)',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', color: '#0f6e56' }}><Shield size={20} /></div>
                    <strong style={{ fontSize: 12, color: '#22221f', display: 'block' }}>Freigabe & Vorteile</strong>
                    <span style={{ fontSize: 11, color: '#55544f', lineHeight: 1.3 }}>
                      Verifizierbare Links erstellen & Partner-Boni.
                    </span>
                  </button>
                </div>

                {/* Dont show again checkbox */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}>
                  <input
                    type="checkbox"
                    id="dontShowAgain"
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    style={{ accentColor: '#0f6e56', cursor: 'pointer' }}
                  />
                  <label htmlFor="dontShowAgain" style={{ fontSize: 12, color: '#55544f', cursor: 'pointer' }}>
                    Dieses Tutorial beim Start nicht mehr automatisch anzeigen (jederzeit im Profil abrufbar)
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Controls */}
          <div style={{
            padding: '16px 28px',
            background: 'rgba(247, 247, 245, 0.85)',
            borderTop: '1px solid rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              {step > 1 ? (
                <Btn variant="ghost" small onClick={() => setStep((s) => s - 1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <ArrowLeft size={14} /> Zurück
                </Btn>
              ) : (
                <span style={{ fontSize: 12, color: '#888780', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Lightbulb size={13} color="#f59e0b" /> Tipp: Navigation auch mit Pfeiltasten
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              {step < 5 ? (
                <Btn onClick={() => setStep((s) => s + 1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  Weiter <ArrowRight size={14} />
                </Btn>
              ) : (
                <Btn onClick={handleClose} className="anim-shimmer" style={{ color: '#fff', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  Jetzt Dashboard entdecken <Sparkles size={14} />
                </Btn>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConsentModal
        isOpen={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        sourceLabel="90 Tage Testdaten (Mock)"
        onConsented={() => generateMockMutation.mutate()}
      />
    </>
  );
}
