import { useState, useRef, useMemo, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Rocket, Gem, ShieldCheck, Target, ChevronDown, Info } from 'lucide-react';
import { apiClient } from '../api/client.js';
import { Card, PageTitle, Chip, SectionLabel, Skeleton, Btn } from '../components/ui.js';
import type { ScoreResult } from '../api/types.js';

export interface Lever { metric: string; currentValue: number | null; targetValue: number; delta: number; horizonWeeks: number; }
export interface SimResult { base: ScoreResult; simulated: ScoreResult; perMetric: { metric: string; delta: number }[]; }

import { getMetricLabel, getMetricUnit, formatMetricValue, formatMetricUnit } from '../lib/formatters.js';
import { getMetricEducation, METRIC_BADGE_LABELS, type MetricBadge } from '../lib/metricEducation.js';

// Score-to-BioAge conversion used by the score engine (src/score/index.ts):
// bioAge = clamp(chronoAge - (score - 50) / 3.33, chronoAge - 15, chronoAge + 15)
// i.e. 3.33 score points ≈ 1 year of bio-age, clamped to ±15 years from chronoAge.
const SCORE_POINTS_PER_BIOAGE_YEAR = 3.33;
const BIOAGE_CLAMP_YEARS = 15;

/**
 * Estimates how much a lever's score delta would reduce bio-age, applying the
 * same clamp the score engine uses — a lever's raw point delta alone can
 * promise more reduction than the engine will ever actually apply once a
 * user is already near the ±15-year clamp boundary.
 */
export function estimateBioAgeReduction(currentScore: number, chronoAge: number, scoreDelta: number): number {
  const currentBioAge = clampBioAge(chronoAge - (currentScore - 50) / SCORE_POINTS_PER_BIOAGE_YEAR, chronoAge);
  const projectedBioAge = clampBioAge(chronoAge - (currentScore + scoreDelta - 50) / SCORE_POINTS_PER_BIOAGE_YEAR, chronoAge);
  return Math.max(0, currentBioAge - projectedBioAge);
}

function clampBioAge(bioAge: number, chronoAge: number): number {
  return Math.min(chronoAge + BIOAGE_CLAMP_YEARS, Math.max(chronoAge - BIOAGE_CLAMP_YEARS, bioAge));
}

const BADGE_ICON: Record<MetricBadge, typeof Rocket> = {
  'quick-win': Rocket,
  'high-impact': Gem,
  kasse: ShieldCheck,
};

const BADGE_CHIP_COLOR: Record<MetricBadge, 'amber' | 'teal' | 'green'> = {
  'quick-win': 'amber',
  'high-impact': 'teal',
  kasse: 'green',
};

const FOCUS_STORAGE_PREFIX = 'longevity_lever_focus_';

export function focusStorageKey(userId: string): string {
  return `${FOCUS_STORAGE_PREFIX}${userId}`;
}

export function readFocusMetric(userId: string | undefined): string | null {
  if (!userId) return null;
  try {
    return localStorage.getItem(focusStorageKey(userId));
  } catch {
    return null;
  }
}

export function writeFocusMetric(userId: string | undefined, metric: string | null) {
  if (!userId) return;
  try {
    if (metric) localStorage.setItem(focusStorageKey(userId), metric);
    else localStorage.removeItem(focusStorageKey(userId));
  } catch {
    // localStorage unavailable (private mode / disabled) — focus simply won't persist
  }
}

export const METRIC_RANGE: Record<string, [number, number, number]> = {
  vo2max: [25, 65, 0.5], resting_hr: [40, 100, 1], sleep_duration: [4, 10, 0.1],
  zone2_minutes: [0, 300, 5], hrv_rmssd: [15, 120, 1], steps: [1000, 20000, 500],
  strength_sessions: [0, 14, 0.5],
};

export const METRIC_COHORT_MEAN: Record<string, number> = {
  vo2max: 42,
  resting_hr: 65,
  sleep_duration: 7.5,
  zone2_minutes: 90,
  hrv_rmssd: 50,
  steps: 7500,
  strength_sessions: 1,
};

export function getScoreBand(scoreVal: number): string {
  const low = Math.min(90, Math.floor(scoreVal / 10) * 10);
  const high = low === 90 ? 100 : low + 9;
  return `${low} – ${high}`;
}

export function extractActualMetricValues(
  score: ScoreResult | undefined | null,
  levers: Lever[] | undefined | null
): Record<string, number | null> {
  const result: Record<string, number | null> = {};

  if (score?.domains) {
    for (const d of score.domains) {
      if (Array.isArray(d.metrics)) {
        for (const m of d.metrics) {
          if (m.value !== null && m.value !== undefined) {
            result[m.metric] = m.value;
          }
        }
      }
    }
  }

  if (levers) {
    for (const l of levers) {
      if (result[l.metric] === undefined && l.currentValue !== null && l.currentValue !== undefined) {
        result[l.metric] = l.currentValue;
      }
    }
  }

  return result;
}

export function Component() {
  const { data: levers, isLoading: leversLoading } = useQuery<Lever[]>({
    queryKey: ['score', 'levers'],
    queryFn: () => apiClient<Lever[]>('/score/levers'),
  });
  const { data: score } = useQuery<ScoreResult>({
    queryKey: ['score', 'current'],
    queryFn: () => apiClient<ScoreResult>('/score/current'),
  });
  const { data: me } = useQuery<{ id: string }>({
    queryKey: ['me'],
    queryFn: () => apiClient('/me'),
  });

  const actualValues = useMemo(() => extractActualMetricValues(score, levers), [score, levers]);

  const [vals, setVals] = useState<Record<string, number>>({});
  const [simResult, setSimResult] = useState<SimResult | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [expandedLever, setExpandedLever] = useState<string | null>(null);
  const [openSliderTip, setOpenSliderTip] = useState<string | null>(null);
  const [focusMetric, setFocusMetric] = useState<string | null>(null);

  useEffect(() => {
    if (me?.id) setFocusMetric(readFocusMetric(me.id));
  }, [me?.id]);

  function toggleFocus(metric: string) {
    const next = focusMetric === metric ? null : metric;
    setFocusMetric(next);
    writeFocusMetric(me?.id, next);
  }

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

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function reset() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    simulateMut.reset();
    setVals({});
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
      <div className="responsive-grid-3">
        {leversLoading ? [1, 2, 3].map((i) => <Card key={i}><Skeleton height={140} /></Card>) :
          levers?.slice(0, 3).map((lever, i) => {
            const edu = getMetricEducation(lever.metric);
            const isExpanded = expandedLever === lever.metric;
            const isFocus = focusMetric === lever.metric;
            const BadgeIcon = edu ? BADGE_ICON[edu.badge] : null;
            const bioAgeReduction = score ? estimateBioAgeReduction(score.score, score.chronoAge, lever.delta) : 0;

            return (
              <Card key={lever.metric} style={{ borderTop: `3px solid ${i === 0 ? '#1d9e75' : 'rgba(0,0,0,0.08)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ fontSize: 10, color: '#a3a29c', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Hebel {i + 1}</div>
                  {edu && BadgeIcon && (
                    <Chip color={BADGE_CHIP_COLOR[edu.badge]}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <BadgeIcon size={11} />
                        {METRIC_BADGE_LABELS[edu.badge]}
                      </span>
                    </Chip>
                  )}
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#22221f', marginBottom: 20 }}>{getMetricLabel(lever.metric)}</div>
                <div style={{ paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                  <span style={{ fontSize: 26, fontWeight: 500, color: '#0f6e56', letterSpacing: '-0.01em' }}>+{lever.delta.toFixed(1)}</span>
                  <span style={{ fontSize: 12, color: '#888780', marginLeft: 6 }}>Punkte · {lever.horizonWeeks} Wochen</span>
                  <div style={{ fontSize: 12, color: '#a3a29c', marginTop: 4 }}>
                    {lever.currentValue !== null ? formatMetricValue(lever.metric, lever.currentValue) : '?'} → {formatMetricValue(lever.metric, lever.targetValue)} {formatMetricUnit(lever.metric, getMetricUnit(lever.metric))}
                  </div>
                  {bioAgeReduction > 0 && (
                    <div style={{ fontSize: 12, color: '#0f6e56', marginTop: 8, fontWeight: 500 }}>
                      Potenzielle Reduktion des Vitalitätsalters: −{bioAgeReduction.toFixed(1)} Jahre
                    </div>
                  )}
                </div>

                {edu && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                    <button
                      type="button"
                      onClick={() => setExpandedLever(isExpanded ? null : lever.metric)}
                      data-testid={`lever-action-toggle-${lever.metric}`}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                        fontSize: 12, fontWeight: 500, color: '#0f6e56', fontFamily: 'inherit',
                      }}
                    >
                      Was muss ich tun?
                      <ChevronDown size={14} style={{ transform: isExpanded ? 'rotate(180deg)' : undefined, transition: 'transform 0.15s' }} />
                    </button>
                    {isExpanded && (
                      <p style={{ fontSize: 12, color: '#55544f', lineHeight: 1.6, marginTop: 10, marginBottom: 0 }}>
                        {edu.sampleHabit}
                      </p>
                    )}
                  </div>
                )}

                <div style={{ marginTop: 16 }}>
                  <Btn
                    small
                    full
                    variant={isFocus ? 'primary' : 'secondary'}
                    onClick={() => toggleFocus(lever.metric)}
                    testId={`lever-focus-${lever.metric}`}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <Target size={13} />
                      {isFocus ? 'Wochen-Fokus aktiv' : 'Als Fokus setzen'}
                    </span>
                  </Btn>
                </div>
              </Card>
            );
          })}
      </div>

      {/* Simulator */}
      <div className="responsive-grid-sim">
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <SectionLabel>Simulator</SectionLabel>
            <button onClick={reset} style={{ fontSize: 12, color: '#888780', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              Zurücksetzen
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {Object.entries(METRIC_RANGE).map(([metric, [min, max, step]]) => {
              const actual = actualValues[metric];
              const hasActual = actual !== null && actual !== undefined;
              const baseVal = hasActual ? actual : (METRIC_COHORT_MEAN[metric] ?? min);
              const v = vals[metric] ?? baseVal;
              const changed = vals[metric] !== undefined && vals[metric] !== baseVal;
              const markerPct = Math.max(0, Math.min(100, ((baseVal - min) / (max - min)) * 100));

              const edu = getMetricEducation(metric);
              const isTipOpen = openSliderTip === metric;

              return (
                <div key={metric}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 13, color: '#22221f', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      {getMetricLabel(metric)}
                      {edu && (
                        <button
                          type="button"
                          onClick={() => setOpenSliderTip(isTipOpen ? null : metric)}
                          aria-label={`Alltagstipp zu ${getMetricLabel(metric)}`}
                          aria-expanded={isTipOpen}
                          data-testid={`slider-tip-toggle-${metric}`}
                          style={{ display: 'inline-flex', color: '#a3a29c', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                        >
                          <Info size={11} />
                        </button>
                      )}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: changed ? '#0f6e56' : '#22221f' }}>
                      {formatMetricValue(metric, v)} <span style={{ color: '#888780', fontWeight: 400 }}>{formatMetricUnit(metric, getMetricUnit(metric))}</span>
                    </span>
                  </div>
                  {edu && isTipOpen && (
                    <div style={{ fontSize: 12, color: '#55544f', background: 'rgba(15,110,86,0.06)', border: '1px solid rgba(15,110,86,0.15)', borderRadius: 8, padding: '8px 12px', marginBottom: 10, lineHeight: 1.5 }}>
                      {edu.sampleHabit}
                    </div>
                  )}
                  <div style={{ position: 'relative' }}>
                    <input
                      type="range" min={min} max={max} step={step} value={v}
                      onChange={(e) => handleSlider(metric, Number(e.target.value))}
                      aria-label={getMetricLabel(metric)}
                    />
                    <div
                      data-testid={`marker-${metric}`}
                      title={hasActual ? `Ist-Wert: ${formatMetricValue(metric, actual)}` : `Kohortenmittelwert: ${formatMetricValue(metric, METRIC_COHORT_MEAN[metric])}`}
                      style={{
                        position: 'absolute', top: -3,
                        left: `${markerPct}%`,
                        width: hasActual ? 2 : 0,
                        height: 10,
                        background: hasActual ? 'rgba(168,168,156,0.8)' : undefined,
                        borderLeft: hasActual ? undefined : '2px dashed rgba(168,168,156,0.6)',
                        borderRadius: 1, pointerEvents: 'none', transform: 'translateX(-50%)',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: '#a3a29c' }}>
                      {hasActual ? `Ist: ${formatMetricValue(metric, actual)}` : `Ø Kohorte: ${formatMetricValue(metric, METRIC_COHORT_MEAN[metric])} (kein Ist-Wert)`}
                    </span>
                    <span style={{ fontSize: 11, color: '#a3a29c' }}>{formatMetricValue(metric, max)}</span>
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
            {(displayScore !== undefined || displayBioAge !== undefined) && (
              <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {displayBioAge !== undefined && displayBioAge !== null && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: '#888780' }}>Vitalitätsalter</span>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{Math.round(displayBioAge)} Jahre</span>
                  </div>
                )}
                {displayScore !== undefined && displayScore !== null && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, color: '#888780' }}>Score-Band</span>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>
                      {getScoreBand(displayScore)}
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
