import { useState, useCallback, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../api/client.js';
import { Card, PageTitle, Chip, SectionLabel, Skeleton } from '../components/ui.js';
import type { ScoreResult } from '../api/types.js';

interface Lever { metric: string; currentValue: number | null; targetValue: number; delta: number; horizonWeeks: number; }
interface SimResult { base: ScoreResult; simulated: ScoreResult; perMetric: { metric: string; delta: number }[]; }

const METRIC_LABELS: Record<string, string> = {
  vo2max: 'VO₂max', resting_hr: 'Ruhepuls', sleep_duration: 'Schlafdauer',
  zone2_minutes: 'Zone-2-Minuten', hrv_rmssd: 'HRV (RMSSD)', steps: 'Schritte',
  strength_sessions: 'Krafteinheiten',
};
const METRIC_UNITS: Record<string, string> = {
  vo2max: 'ml/kg/min', resting_hr: 'bpm', sleep_duration: 'h',
  zone2_minutes: 'min/Wo.', hrv_rmssd: 'ms', steps: '/Tag', strength_sessions: '/Woche',
};
const METRIC_RANGE: Record<string, [number, number, number]> = {
  vo2max: [25, 65, 0.5], resting_hr: [40, 100, 1], sleep_duration: [4, 10, 0.1],
  zone2_minutes: [0, 300, 5], hrv_rmssd: [15, 120, 1], steps: [1000, 20000, 500],
  strength_sessions: [0, 4, 0.5],
};

export function Component() {
  const { data: levers, isLoading: leversLoading } = useQuery<Lever[]>({
    queryKey: ['score', 'levers'],
    queryFn: () => apiClient<Lever[]>('/score/levers'),
  });
  const { data: score } = useQuery<ScoreResult>({
    queryKey: ['score', 'current'],
    queryFn: () => apiClient<ScoreResult>('/score/current'),
  });

  const defaultVals = useCallback(() => {
    const base: Record<string, number> = {};
    for (const [m, [min]] of Object.entries(METRIC_RANGE)) {
      const lever = levers?.find((l) => l.metric === m);
      base[m] = lever?.currentValue ?? min;
    }
    return base;
  }, [levers]);

  const [vals, setVals] = useState<Record<string, number>>({});
  const [simResult, setSimResult] = useState<SimResult | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const simulateMut = useMutation({
    mutationFn: (overrides: Record<string, number>) =>
      apiClient<SimResult>('/score/simulate', { method: 'POST', body: JSON.stringify({ overrides }) }),
    onSuccess: (data) => setSimResult(data),
  });

  function handleSlider(metric: string, value: number) {
    const next = { ...vals, [metric]: value };
    setVals(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      simulateMut.mutate(next);
    }, 120);
  }

  function reset() {
    const base = defaultVals();
    setVals(base);
    setSimResult(null);
  }

  const displayScore = simResult?.simulated.score ?? score?.score;
  const delta = simResult ? simResult.simulated.score - simResult.base.score : 0;
  const displayBioAge = simResult?.simulated.bioAge ?? score?.bioAge;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <PageTitle
        title="Hebel & Simulator"
        sub="Die drei größten Hebel — berechnet aus einer realistisch erreichbaren Verbesserung (+0,5σ)."
      />

      {/* Lever cards */}
      <div className="responsive-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {leversLoading ? [1, 2, 3].map((i) => <Card key={i}><Skeleton height={140} /></Card>) :
          levers?.slice(0, 3).map((lever, i) => (
            <Card key={lever.metric} style={{ borderTop: `3px solid ${i === 0 ? '#1d9e75' : 'rgba(0,0,0,0.08)'}` }}>
              <div style={{ fontSize: 10, color: '#a3a29c', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Hebel {i + 1}</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#22221f', marginBottom: 20 }}>{METRIC_LABELS[lever.metric] ?? lever.metric}</div>
              <div style={{ paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: 26, fontWeight: 500, color: '#0f6e56', letterSpacing: '-0.01em' }}>+{lever.delta.toFixed(1)}</span>
                <span style={{ fontSize: 12, color: '#888780', marginLeft: 6 }}>Punkte · {lever.horizonWeeks} Wochen</span>
                <div style={{ fontSize: 12, color: '#a3a29c', marginTop: 4 }}>
                  {lever.currentValue?.toFixed(1) ?? '?'} → {lever.targetValue.toFixed(1)} {METRIC_UNITS[lever.metric] ?? ''}
                </div>
              </div>
            </Card>
          ))}
      </div>

      {/* Simulator */}
      <div className="responsive-grid-sim" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <SectionLabel>Simulator</SectionLabel>
            <button onClick={reset} style={{ fontSize: 12, color: '#888780', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              Zurücksetzen
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {Object.entries(METRIC_RANGE).map(([metric, [min, max, step]]) => {
              const lever = levers?.find((l) => l.metric === metric);
              const currentVal = lever?.currentValue ?? min;
              const v = vals[metric] ?? currentVal;
              const changed = v !== currentVal;

              return (
                <div key={metric}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 13, color: '#22221f' }}>{METRIC_LABELS[metric] ?? metric}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: changed ? '#0f6e56' : '#22221f' }}>
                      {v} <span style={{ color: '#888780', fontWeight: 400 }}>{METRIC_UNITS[metric] ?? ''}</span>
                    </span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="range" min={min} max={max} step={step} value={v}
                      onChange={(e) => handleSlider(metric, Number(e.target.value))}
                      aria-label={METRIC_LABELS[metric] ?? metric}
                    />
                    <div style={{
                      position: 'absolute', top: -3,
                      left: `${((currentVal - min) / (max - min)) * 100}%`,
                      width: 2, height: 10, background: 'rgba(168,168,156,0.6)',
                      borderRadius: 1, pointerEvents: 'none', transform: 'translateX(-50%)',
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: '#a3a29c' }}>Ist: {currentVal}</span>
                    <span style={{ fontSize: 11, color: '#a3a29c' }}>{max}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Live result */}
        <div style={{ position: 'sticky', top: 90 }}>
          <Card className="glass-deep">
            <SectionLabel>Simuliertes Ergebnis</SectionLabel>
            <div style={{ textAlign: 'center', padding: '20px 0 24px' }}>
              <div data-testid="sim-score" style={{ fontSize: 64, fontWeight: 500, color: '#0f6e56', lineHeight: 1, letterSpacing: '-0.03em' }}>
                {displayScore?.toFixed(1) ?? '—'}
              </div>
              {simResult && (
                <div style={{ marginTop: 14 }}>
                  <Chip color={delta >= 0 ? 'teal' : 'red'}>
                    {delta >= 0 ? '+' : ''}{delta.toFixed(1)} Punkte
                  </Chip>
                </div>
              )}
            </div>
            {(displayScore || displayBioAge) && (
              <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {displayBioAge && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: '#888780' }}>Vitalitätsalter</span>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{Math.round(displayBioAge)} Jahre</span>
                  </div>
                )}
                {displayScore && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: '#888780' }}>Score-Band</span>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>
                      {Math.floor(displayScore / 10) * 10} – {Math.floor(displayScore / 10) * 10 + 9}
                    </span>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
