import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client.js';
import { Btn, Chip } from './ui.js';
import brandIcon from '../assets/brand-icon.png';

export interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: number;
}

export function TutorialModal({ isOpen, onClose, initialStep = 1 }: TutorialModalProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(initialStep);
  const [dontShowAgain, setDontShowAgain] = useState(true);

  // Step 1 interactive demo state
  const [demoState, setDemoState] = useState<'with_data' | 'baseline'>('with_data');

  // Step 2 quick mock generation
  const [mockSuccess, setMockSuccess] = useState(false);

  // Step 3 interactive simulator state
  const [stepsHabit, setStepsHabit] = useState(8500);
  const [zone2Habit, setZone2Habit] = useState(90);
  const [sleepHabit, setSleepHabit] = useState(7.5);

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

  const handleClose = useCallback(() => {
    if (dontShowAgain) {
      localStorage.setItem('longevity_tutorial_completed', 'true');
    }
    onClose();
  }, [dontShowAgain, onClose]);

  // Handle keyboard shortcuts (Esc to close, Left/Right for steps)
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

  // Simulator calculation for Step 3
  const stepContribution = Math.min(15, Math.max(0, ((stepsHabit - 5000) / 7000) * 12));
  const zone2Contribution = Math.min(18, Math.max(0, (zone2Habit / 150) * 15));
  const sleepDelta = Math.abs(sleepHabit - 7.5);
  const sleepContribution = Math.max(0, 10 - sleepDelta * 6);
  const simulatedScore = Math.round(52 + stepContribution + zone2Contribution + sleepContribution);
  const simulatedAgeDelta = Number(((simulatedScore - 50) / 10).toFixed(1));
  const chronoAgeDemo = 30.0;
  const simulatedBioAge = Number((chronoAgeDemo - simulatedAgeDelta).toFixed(1));

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 20, 0.45)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 680,
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(20px)',
          borderRadius: 24,
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.8) inset',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header with Progress Indicator & Close Button */}
        <div style={{
          padding: '20px 28px 16px',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={brandIcon} alt="Logo" style={{ width: 28, height: 28, objectFit: 'contain' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#0f6e56', letterSpacing: '0.02em' }}>
              LONGEVITY GUIDE
            </span>
          </div>

          {/* Stepper Dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => setStep(s)}
                title={`Schritt ${s}`}
                style={{
                  height: 6,
                  width: step === s ? 24 : 6,
                  borderRadius: 99,
                  background: step === s ? '#0f6e56' : 'rgba(0,0,0,0.12)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  padding: 0,
                }}
              />
            ))}
          </div>

          <button
            onClick={handleClose}
            title="Schließen (Esc)"
            style={{
              background: 'rgba(0,0,0,0.04)',
              border: 'none',
              borderRadius: 99,
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#55544f',
              fontSize: 14,
              transition: 'background 0.15s',
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body with dynamic steps */}
        <div style={{ padding: '28px 32px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          {/* ── STEP 1: Vision & Score ─────────────────────────── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <Chip color="teal">Schritt 1 von 5 · Die Idee</Chip>
                <h2 style={{ fontSize: 23, fontWeight: 600, color: '#22221f', margin: '12px 0 6px', letterSpacing: '-0.02em' }}>
                  Dein Pass kennt dein Alter. Dein Körper deine Vitalität.
                </h2>
                <p style={{ fontSize: 14, color: '#55544f', maxWidth: 520, margin: '0 auto', lineHeight: 1.5 }}>
                  LONGEVITY verdichtet deine Gesundheitsdaten aus 4 wissenschaftlichen Säulen zu einem einzigen,
                  mathematisch transparenten <strong>Score von 0 bis 100</strong> und ermittelt dein <strong>biologisches Vitalitätsalter</strong>.
                </p>
              </div>

              {/* Interactive Dial Comparison */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(240,248,244,0.7) 0%, rgba(230,244,238,0.5) 100%)',
                border: '1px solid rgba(29,158,117,0.2)',
                borderRadius: 18,
                padding: '24px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                marginTop: 8,
              }}>
                {/* Score Orb Visual */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 104,
                    height: 104,
                    borderRadius: '50%',
                    background: demoState === 'with_data'
                      ? 'conic-gradient(#1d9e75 0deg 280deg, rgba(29,158,117,0.15) 280deg 360deg)'
                      : 'conic-gradient(#888780 0deg 180deg, rgba(0,0,0,0.08) 180deg 360deg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 10px',
                    boxShadow: '0 8px 24px rgba(29,158,117,0.18)',
                    transition: 'all 0.4s ease',
                  }}>
                    <div style={{
                      width: 82,
                      height: 82,
                      borderRadius: '50%',
                      background: '#fff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: 26, fontWeight: 700, color: demoState === 'with_data' ? '#0f6e56' : '#55544f' }}>
                        {demoState === 'with_data' ? '78' : '50'}
                      </span>
                      <span style={{ fontSize: 10, color: '#888780', textTransform: 'uppercase' }}>Score</span>
                    </div>
                  </div>
                  <Chip color={demoState === 'with_data' ? 'teal' : 'neutral'}>
                    {demoState === 'with_data' ? 'Band 70–79' : 'Band 50–59 (Basis)'}
                  </Chip>
                </div>

                {/* Biological age breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 13, color: '#55544f' }}>Chronologisches Alter: <strong>30 Jahre</strong></div>
                  <div style={{
                    fontSize: 22,
                    fontWeight: 600,
                    color: demoState === 'with_data' ? '#0f6e56' : '#22221f',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>
                    Vitalitätsalter: <span>{demoState === 'with_data' ? '26,8 Jahre' : '30,0 Jahre'}</span>
                    {demoState === 'with_data' && (
                      <span style={{ fontSize: 12, background: 'rgba(29,158,117,0.12)', color: '#0f6e56', padding: '2px 8px', borderRadius: 99 }}>
                        -3,2 Jahre!
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#888780' }}>
                    {demoState === 'with_data'
                      ? '✓ Gestützt auf Kardiometabolik, Schlaf, Aktivität & Labor'
                      : 'Ohne Daten: Neutrale Mitte (Shrinkage-Prinzip)'}
                  </div>
                </div>
              </div>

              {/* Interactive button toggle */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setDemoState('with_data')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 99,
                    border: demoState === 'with_data' ? '1px solid #0f6e56' : '1px solid rgba(0,0,0,0.1)',
                    background: demoState === 'with_data' ? 'rgba(15,110,86,0.1)' : 'transparent',
                    color: demoState === 'with_data' ? '#0f6e56' : '#55544f',
                    fontSize: 12,
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  ⚡ Mit echten Vitalwerten
                </button>
                <button
                  type="button"
                  onClick={() => setDemoState('baseline')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 99,
                    border: demoState === 'baseline' ? '1px solid #55544f' : '1px solid rgba(0,0,0,0.1)',
                    background: demoState === 'baseline' ? 'rgba(0,0,0,0.06)' : 'transparent',
                    color: demoState === 'baseline' ? '#22221f' : '#55544f',
                    fontSize: 12,
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  ⚪ Startwert ohne Messdaten
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Sources & Connect ──────────────────────── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <Chip color="teal">Schritt 2 von 5 · Daten verbinden</Chip>
                <h2 style={{ fontSize: 23, fontWeight: 600, color: '#22221f', margin: '12px 0 6px', letterSpacing: '-0.02em' }}>
                  So kommen deine Daten in das System
                </h2>
                <p style={{ fontSize: 14, color: '#55544f', maxWidth: 500, margin: '0 auto', lineHeight: 1.5 }}>
                  Wähle deinen bevorzugten Weg. Du kannst jederzeit im Tab <strong>Daten</strong> neue Quellen anbinden,
                  Dateien hochladen oder mit Testdaten experimentieren.
                </p>
              </div>

              {/* Source cards grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {/* Google Health */}
                <div style={{
                  padding: 16,
                  borderRadius: 16,
                  border: '1px solid rgba(0,0,0,0.08)',
                  background: 'rgba(255,255,255,0.7)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 22 }}>🤖</span>
                    <strong style={{ fontSize: 14, color: '#22221f' }}>Google Health</strong>
                  </div>
                  <p style={{ fontSize: 12, color: '#55544f', margin: 0, lineHeight: 1.4 }}>
                    Automatischer Sync von Schritten, Schlaf, Ruhepuls & Zone-2-Minuten aus Health Connect über bis zu 365 Tage.
                  </p>
                </div>

                {/* Apple Health */}
                <div style={{
                  padding: 16,
                  borderRadius: 16,
                  border: '1px solid rgba(0,0,0,0.08)',
                  background: 'rgba(255,255,255,0.7)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 22 }}>🍎</span>
                    <strong style={{ fontSize: 14, color: '#22221f' }}>Apple Health</strong>
                  </div>
                  <p style={{ fontSize: 12, color: '#55544f', margin: 0, lineHeight: 1.4 }}>
                    Lade deinen XML-Export aus der Health-App hoch oder sende Daten in Echtzeit über die Webhook-Schnittstelle.
                  </p>
                </div>

                {/* Labor & Lifestyle */}
                <div style={{
                  padding: 16,
                  borderRadius: 16,
                  border: '1px solid rgba(0,0,0,0.08)',
                  background: 'rgba(255,255,255,0.7)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 22 }}>🧪</span>
                    <strong style={{ fontSize: 14, color: '#22221f' }}>Labor & Lifestyle</strong>
                  </div>
                  <p style={{ fontSize: 12, color: '#55544f', margin: 0, lineHeight: 1.4 }}>
                    Trage Cholesterinwerte (LDL/HDL), HbA1c oder deinen Lifestyle-Fragebogen mit wenigen Klicks manuell ein.
                  </p>
                </div>

                {/* One-click mock generator card */}
                <div style={{
                  padding: 16,
                  borderRadius: 16,
                  border: '1px solid rgba(29,158,117,0.3)',
                  background: 'rgba(29,158,117,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 8,
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 22 }}>🎲</span>
                      <strong style={{ fontSize: 14, color: '#0f6e56' }}>90 Tage Testdaten</strong>
                    </div>
                    <p style={{ fontSize: 12, color: '#55544f', margin: '4px 0 0', lineHeight: 1.4 }}>
                      Ideal zum Sofort-Ausprobieren: Erzeugt realitätsnahe Messreihen für deinen Account.
                    </p>
                  </div>
                  <Btn
                    small
                    variant={mockSuccess ? 'ghost' : 'secondary'}
                    disabled={generateMockMutation.isPending || mockSuccess}
                    onClick={() => generateMockMutation.mutate()}
                  >
                    {generateMockMutation.isPending
                      ? 'Wird generiert...'
                      : mockSuccess
                      ? '✓ Testdaten aktiv!'
                      : 'Testdaten sofort laden'}
                  </Btn>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Simulator ──────────────────────────────── */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ textAlign: 'center' }}>
                <Chip color="teal">Schritt 3 von 5 · Interaktiver Simulator</Chip>
                <h2 style={{ fontSize: 23, fontWeight: 600, color: '#22221f', margin: '12px 0 6px', letterSpacing: '-0.02em' }}>
                  Verschiebe deinen Score mit konkreten Hebeln
                </h2>
                <p style={{ fontSize: 14, color: '#55544f', maxWidth: 520, margin: '0 auto', lineHeight: 1.5 }}>
                  Probiere es direkt aus: Verändere die Regler und beobachte, wie sich dein Vitalitätsalter
                  und dein Score live in Sekundenschnelle anpassen.
                </p>
              </div>

              {/* Real-time outcome banner */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(15,110,86,0.08) 0%, rgba(29,158,117,0.12) 100%)',
                border: '1px solid rgba(29,158,117,0.3)',
                borderRadius: 16,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontSize: 12, color: '#55544f', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Simulierter Score</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: '#0f6e56' }}>
                    {simulatedScore} <span style={{ fontSize: 14, fontWeight: 400, color: '#55544f' }}>/ 100</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: '#55544f', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Biologisches Alter</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#0f6e56' }}>
                    {simulatedBioAge} Jahre{' '}
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#1d9e75' }}>
                      ({simulatedAgeDelta > 0 ? `-${simulatedAgeDelta}` : `+${Math.abs(simulatedAgeDelta)}`} J.)
                    </span>
                  </div>
                </div>
              </div>

              {/* Sliders container */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Schritte Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ fontWeight: 500, color: '#22221f' }}>🚶‍♂️ Tägliche Schritte</span>
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

                {/* Zone 2 Training Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ fontWeight: 500, color: '#22221f' }}>🫀 Zone-2 Cardio (Ausdauer)</span>
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

                {/* Schlaf Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ fontWeight: 500, color: '#22221f' }}>😴 Nächtliche Schlafdauer</span>
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

              <div style={{ fontSize: 12, color: '#888780', textAlign: 'center', fontStyle: 'italic' }}>
                💡 Der Hebel-Simulator nutzt exakt dieselben mathematischen Formeln wie die Haupt-Score-Engine.
              </div>
            </div>
          )}

          {/* ── STEP 4: Privacy & Benefits ────────────────────── */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <Chip color="teal">Schritt 4 von 5 · Vorteile & Privatsphäre</Chip>
                <h2 style={{ fontSize: 23, fontWeight: 600, color: '#22221f', margin: '12px 0 6px', letterSpacing: '-0.02em' }}>
                  Gesundheit zahlt sich aus — ohne Datenpreisgabe
                </h2>
                <p style={{ fontSize: 14, color: '#55544f', maxWidth: 520, margin: '0 auto', lineHeight: 1.5 }}>
                  Versicherungen und Partner belohnen hohe Vitalitäts-Bänder.
                  Dank <strong>kryptografischer Nachweise</strong> musst du dafür niemals deine privaten Messwerte preisgeben.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {/* Privacy Badge Card */}
                <div style={{
                  padding: 16,
                  borderRadius: 16,
                  border: '1px solid rgba(29,158,117,0.3)',
                  background: 'rgba(29,158,117,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>🛡️</span>
                    <strong style={{ fontSize: 13, color: '#0f6e56' }}>Was Partner sehen</strong>
                  </div>
                  <div style={{
                    background: '#fff',
                    borderRadius: 10,
                    padding: '10px 12px',
                    border: '1px dashed rgba(29,158,117,0.4)',
                    fontSize: 12,
                    color: '#22221f',
                  }}>
                    <div>Score-Nachweis: <strong>Band 70–79</strong></div>
                    <div style={{ fontSize: 11, color: '#888780', marginTop: 2 }}>Signatur: Ed25519 (verifiziert ✓)</div>
                  </div>
                  <p style={{ fontSize: 11, color: '#55544f', margin: 0, lineHeight: 1.4 }}>
                    🚫 <strong>Keine Rohdaten:</strong> Weder Schlafzeiten noch Puls oder Blutzucker verlassen jemals deine Kontrolle.
                  </p>
                </div>

                {/* Real Partner Perks */}
                <div style={{
                  padding: 16,
                  borderRadius: 16,
                  border: '1px solid rgba(0,0,0,0.08)',
                  background: 'rgba(255,255,255,0.7)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>🎁</span>
                    <strong style={{ fontSize: 13, color: '#22221f' }}>Deine konkreten Vorteile</strong>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                    <div style={{ color: '#0f6e56' }}>✓ <strong>Bis zu 15% Rabatt</strong> auf Krankenversicherung</div>
                    <div style={{ color: '#0f6e56' }}>✓ <strong>40 € / Monat</strong> Sport- und Fitness-Zuschuss</div>
                    <div style={{ color: '#0f6e56' }}>✓ <strong>Exklusive Vergünstigungen</strong> auf Oura, Garmin & Whoop</div>
                  </div>
                </div>
              </div>

              <div style={{
                background: 'rgba(0,0,0,0.03)',
                borderRadius: 12,
                padding: '12px 16px',
                fontSize: 12,
                color: '#55544f',
                textAlign: 'center',
              }}>
                Alle Angebote findest du im Menü unter <strong>Vorteile</strong>. Unter <strong>Freigabe</strong> kannst du Nachweise per Link teilen oder jederzeit widerrufen.
              </div>
            </div>
          )}

          {/* ── STEP 5: Tour & Cockpit ─────────────────────────── */}
          {step === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <Chip color="teal">Schritt 5 von 5 · Dein Cockpit</Chip>
                <h2 style={{ fontSize: 23, fontWeight: 600, color: '#22221f', margin: '12px 0 6px', letterSpacing: '-0.02em' }}>
                  Dein Einstieg in ein längeres, gesünderes Leben
                </h2>
                <p style={{ fontSize: 14, color: '#55544f', maxWidth: 500, margin: '0 auto', lineHeight: 1.5 }}>
                  Hier ist dein schneller Überblick über die wichtigsten Bereiche der App:
                </p>
              </div>

              {/* 4 Interactive Navigation Highlights */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => { handleClose(); navigate('/dashboard'); }}
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    border: '1px solid rgba(0,0,0,0.08)',
                    background: 'rgba(255,255,255,0.75)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#0f6e56')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)')}
                >
                  <div style={{ fontSize: 18, marginBottom: 4 }}>📊</div>
                  <strong style={{ fontSize: 13, color: '#22221f', display: 'block' }}>Dashboard & Score</strong>
                  <span style={{ fontSize: 11, color: '#55544f', lineHeight: 1.3, display: 'block', marginTop: 2 }}>
                    90-Tage Trendlinie, Vitalitätsalter und 4 Domänen-Karten.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => { handleClose(); navigate('/hebel'); }}
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    border: '1px solid rgba(0,0,0,0.08)',
                    background: 'rgba(255,255,255,0.75)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#0f6e56')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)')}
                >
                  <div style={{ fontSize: 18, marginBottom: 4 }}>⚙️</div>
                  <strong style={{ fontSize: 13, color: '#22221f', display: 'block' }}>Hebel-Simulator</strong>
                  <span style={{ fontSize: 11, color: '#55544f', lineHeight: 1.3, display: 'block', marginTop: 2 }}>
                    Entdecke deine 3 stärksten Gewohnheiten mit größter Hebelwirkung.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => { handleClose(); navigate('/daten'); }}
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    border: '1px solid rgba(0,0,0,0.08)',
                    background: 'rgba(255,255,255,0.75)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#0f6e56')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)')}
                >
                  <div style={{ fontSize: 18, marginBottom: 4 }}>📡</div>
                  <strong style={{ fontSize: 13, color: '#22221f', display: 'block' }}>Datenquellen</strong>
                  <span style={{ fontSize: 11, color: '#55544f', lineHeight: 1.3, display: 'block', marginTop: 2 }}>
                    Google Health, Apple Health oder Laborwerte einspielen.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => { handleClose(); navigate('/freigabe'); }}
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    border: '1px solid rgba(0,0,0,0.08)',
                    background: 'rgba(255,255,255,0.75)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#0f6e56')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)')}
                >
                  <div style={{ fontSize: 18, marginBottom: 4 }}>🛡️</div>
                  <strong style={{ fontSize: 13, color: '#22221f', display: 'block' }}>Freigabe & Nachweise</strong>
                  <span style={{ fontSize: 11, color: '#55544f', lineHeight: 1.3, display: 'block', marginTop: 2 }}>
                    Score-Band sicher verifizieren lassen und Vorteile sichern.
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
          background: 'rgba(247, 247, 245, 0.8)',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            {step > 1 ? (
              <Btn variant="ghost" small onClick={() => setStep((s) => s - 1)}>
                ← Zurück
              </Btn>
            ) : (
              <span style={{ fontSize: 12, color: '#888780' }}>Tipp: Navigation auch mit Pfeiltasten</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {step < 5 ? (
              <Btn onClick={() => setStep((s) => s + 1)}>
                Weiter →
              </Btn>
            ) : (
              <Btn onClick={handleClose}>
                Jetzt Dashboard entdecken ✨
              </Btn>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
