import { useState } from 'react';
import { Footprints, Heart, Moon, Sparkles } from 'lucide-react';
import { Chip } from '../ui.js';

interface TutorialStepScoreProps {
  userAge?: number;
}

export function TutorialStepScore({ userAge = 30 }: TutorialStepScoreProps) {
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

  return (
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
            aria-label="Tägliche Schritte"
            aria-valuemin={4000}
            aria-valuemax={14000}
            aria-valuenow={stepsHabit}
            aria-valuetext={`${stepsHabit.toLocaleString('de-DE')} Schritte`}
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
            aria-label="Zone-2 Cardio (Ausdauer)"
            aria-valuemin={0}
            aria-valuemax={210}
            aria-valuenow={zone2Habit}
            aria-valuetext={`${zone2Habit} Min. / Woche`}
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
            aria-label="Schlafdauer"
            aria-valuemin={5.5}
            aria-valuemax={9.0}
            aria-valuenow={sleepHabit}
            aria-valuetext={`${sleepHabit} Stunden`}
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
  );
}
