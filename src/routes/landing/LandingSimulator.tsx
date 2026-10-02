import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Btn } from '../../components/ui.js';
import { APP_ROUTES } from '../../lib/routes.js';
import { calculateSimulatedScore } from './landingUtils.js';

export function LandingSimulator() {
  const [restingHr, setRestingHr] = useState(62);
  const [sleepHours, setSleepHours] = useState(7.2);
  const [vo2max, setVo2max] = useState(44);
  const [zone2Min, setZone2Min] = useState(120);

  const simResult = useMemo(
    () => calculateSimulatedScore(restingHr, sleepHours, vo2max, zone2Min),
    [restingHr, sleepHours, vo2max, zone2Min],
  );

  return (
    <section id="simulator" className="scroll-reveal" style={{ marginBottom: 110, scrollMarginTop: 110 }}>
      <div
        className="glass-deep"
        style={{
          borderRadius: 24,
          padding: 'clamp(20px, 4vw, 44px) clamp(16px, 4vw, 40px)',
          boxShadow: '0 16px 50px rgba(15, 40, 28, 0.08), 0 1px 0 rgba(255, 255, 255, 1) inset',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '3px 12px',
              borderRadius: 999,
              background: '#e1f5ee',
              color: '#0f6e56',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Interaktive Demo
          </span>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 500, color: '#22221f', margin: '10px 0 8px' }}>
            Erlebe die LONGEVITY-Hebel-Engine interaktiv
          </h2>
          <p style={{ fontSize: 15, color: '#55544f', maxWidth: 620, margin: '0 auto' }}>
            Bewege die Regler und beobachte, wie sich kleine Lebensstil-Anpassungen direkt auf deinen
            Score und dein biologisches Vitalitätsalter auswirken.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: 'clamp(24px, 4vw, 40px)',
            alignItems: 'center',
          }}
        >
          {/* Sliders Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Slider 1: Ruhepuls */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#22221f' }}>Ruhepuls</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f6e56' }}>{restingHr} bpm</span>
              </div>
              <input
                type="range"
                min="45"
                max="85"
                value={restingHr}
                aria-label="Ruhepuls"
                aria-valuemin={45}
                aria-valuemax={85}
                aria-valuenow={restingHr}
                aria-valuetext={`${restingHr} bpm`}
                onChange={(e) => setRestingHr(Number(e.target.value))}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888780', marginTop: 4, flexWrap: 'wrap', gap: 4 }}>
                <span>45 (Athlet)</span>
                <span>65 (Schnitt)</span>
                <span>85 bpm</span>
              </div>
            </div>

            {/* Slider 2: Schlafdauer */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#22221f' }}>Schlafdauer</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f6e56' }}>{sleepHours.toFixed(1)} h / Nacht</span>
              </div>
              <input
                type="range"
                min="5.0"
                max="9.5"
                step="0.1"
                value={sleepHours}
                aria-label="Schlafdauer"
                aria-valuemin={5.0}
                aria-valuemax={9.5}
                aria-valuenow={sleepHours}
                aria-valuetext={`${sleepHours.toFixed(1)} h / Nacht`}
                onChange={(e) => setSleepHours(Number(e.target.value))}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888780', marginTop: 4, flexWrap: 'wrap', gap: 4 }}>
                <span>5,0 h (Mangel)</span>
                <span>7,5–8,0 h (Optimum)</span>
                <span>9,5 h</span>
              </div>
            </div>

            {/* Slider 3: VO2max */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#22221f' }}>Kardiovaskuläre Fitness (VO₂max)</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f6e56' }}>{vo2max} ml/kg/min</span>
              </div>
              <input
                type="range"
                min="26"
                max="58"
                value={vo2max}
                aria-label="Kardiovaskuläre Fitness (VO₂max)"
                aria-valuemin={26}
                aria-valuemax={58}
                aria-valuenow={vo2max}
                aria-valuetext={`${vo2max} ml/kg/min`}
                onChange={(e) => setVo2max(Number(e.target.value))}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888780', marginTop: 4, flexWrap: 'wrap', gap: 4 }}>
                <span>26 (Niedrig)</span>
                <span>42 (Gut)</span>
                <span>58 (Spitze)</span>
              </div>
            </div>

            {/* Slider 4: Zone 2 Training */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#22221f' }}>Zone-2 Ausdauerminuten / Woche</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0f6e56' }}>{zone2Min} Min</span>
              </div>
              <input
                type="range"
                min="0"
                max="300"
                step="10"
                value={zone2Min}
                aria-label="Zone-2 Ausdauerminuten / Woche"
                aria-valuemin={0}
                aria-valuemax={300}
                aria-valuenow={zone2Min}
                aria-valuetext={`${zone2Min} Min`}
                onChange={(e) => setZone2Min(Number(e.target.value))}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888780', marginTop: 4, flexWrap: 'wrap', gap: 4 }}>
                <span>0 Min</span>
                <span>150 Min (WHO)</span>
                <span>300 Min</span>
              </div>
            </div>
          </div>

          {/* Result Score Card */}
          <div
            className="glass card-interactive"
            style={{
              borderRadius: 20,
              padding: 'clamp(24px, 3.5vw, 36px) clamp(16px, 3.5vw, 32px)',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.95)',
              background: 'rgba(255, 255, 255, 0.78)',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 500, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Beispielhafter Score
            </div>

            <div
              style={{
                fontSize: 68,
                fontWeight: 500,
                color: '#0f6e56',
                lineHeight: 1,
                letterSpacing: '-0.02em',
                marginBottom: 10,
              }}
            >
              {simResult.score}
            </div>

            <div style={{ marginBottom: 24 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '4px 14px',
                  borderRadius: 999,
                  background: '#e1f5ee',
                  color: simResult.bandColor,
                  border: '1px solid rgba(29, 158, 117, 0.25)',
                }}
              >
                {simResult.band}
              </span>
            </div>

            <div
              style={{
                background: 'rgba(240, 244, 241, 0.8)',
                borderRadius: 14,
                padding: '16px 20px',
                marginBottom: 24,
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: '#55544f' }}>Chronologisches Alter:</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{simResult.chronoAge} Jahre</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: '#55544f' }}>Biologisches Vitalitätsalter:</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0f6e56' }}>{simResult.vitalityAge} Jahre</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#22221f' }}>Gewonnene Vitalitätsjahre:</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: simResult.yearsGained >= 0 ? '#0f6e56' : '#a32d2d' }}>
                  {simResult.yearsGained >= 0 ? `+${simResult.yearsGained} J.` : `${simResult.yearsGained} J.`}
                </span>
              </div>
            </div>

            <Link to={APP_ROUTES.register} style={{ textDecoration: 'none' }}>
              <Btn full style={{ padding: '12px 20px', fontSize: 14 }}>
                Deine echten Werte ermitteln →
              </Btn>
            </Link>

            <p style={{ fontSize: 11, color: '#a3a29c', marginTop: 14, lineHeight: 1.5 }}>
              Vereinfachte Beispielrechnung zur Veranschaulichung — keine echte Score-Berechnung.
              Dein tatsächlicher Score basiert auf 4 wissenschaftlichen Domänen und echten Messdaten.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
