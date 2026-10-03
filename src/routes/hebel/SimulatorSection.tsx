import { useState } from 'react';
import { Info } from 'lucide-react';
import { Card, SectionLabel, Chip } from '../../components/ui.js';
import { getMetricLabel, getMetricUnit, formatMetricValue, formatMetricUnit } from '../../lib/formatters.js';
import { getMetricEducation } from '../../lib/metricEducation.js';
import { METRIC_RANGE, getMetricCohortMean, getScoreBand, type SimResult } from './hebelUtils.js';

interface SimulatorSectionProps {
  actualValues: Record<string, number | null>;
  vals: Record<string, number>;
  simResult: SimResult | null;
  baseScore: number | undefined;
  baseBioAge: number | undefined;
  chronoAge?: number | null;
  sex?: 'm' | 'f' | string | null;
  isError: boolean;
  onSliderChange: (metric: string, value: number) => void;
  onReset: () => void;
  onRetry: () => void;
}

export function SimulatorSection({
  actualValues,
  vals,
  simResult,
  baseScore,
  baseBioAge,
  chronoAge,
  sex,
  isError,
  onSliderChange,
  onReset,
  onRetry,
}: SimulatorSectionProps) {
  const [openSliderTip, setOpenSliderTip] = useState<string | null>(null);

  const displayScore = simResult?.simulated.score ?? baseScore;
  const delta = simResult ? simResult.simulated.score - simResult.base.score : 0;
  const displayBioAge = simResult?.simulated.bioAge ?? baseBioAge;

  return (
    <div className="responsive-grid-sim">
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <SectionLabel>Simulator</SectionLabel>
          <button
            onClick={onReset}
            style={{
              fontSize: 12,
              color: '#888780',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Zurücksetzen
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {Object.entries(METRIC_RANGE).map(([metric, [min, max, step]]) => {
            const actual = actualValues[metric];
            const hasActual = actual !== null && actual !== undefined;
            const cohortMean = getMetricCohortMean(metric, chronoAge, sex);
            const baseVal = hasActual ? actual : (cohortMean ?? min);
            const v = vals[metric] ?? baseVal;
            const changed = vals[metric] !== undefined && vals[metric] !== baseVal;
            const markerPct = Math.max(0, Math.min(100, ((baseVal - min) / (max - min)) * 100));

            const edu = getMetricEducation(metric);
            const isTipOpen = openSliderTip === metric;

            const metricDelta = simResult?.perMetric.find((p) => p.metric === metric)?.delta;
            const isImprovement =
              metric === 'resting_hr'
                ? v < baseVal
                : metric === 'sleep_duration'
                ? Math.abs(v - 7.5) < Math.abs(baseVal - 7.5)
                : v > baseVal;

            const isWorsening =
              metric === 'resting_hr'
                ? v > baseVal
                : metric === 'sleep_duration'
                ? Math.abs(v - 7.5) > Math.abs(baseVal - 7.5)
                : v < baseVal;

            const valueColor = changed
              ? metricDelta !== undefined
                ? metricDelta > 0
                  ? '#0f6e56'
                  : metricDelta < 0
                  ? '#c2410c'
                  : '#55544f'
                : isImprovement
                ? '#0f6e56'
                : isWorsening
                ? '#c2410c'
                : '#55544f'
              : '#22221f';

            return (
              <div key={metric}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: '#22221f', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    {getMetricLabel(metric)}
                    {metric === 'resting_hr' && (
                      <span style={{ fontSize: 11, color: '#888780', fontWeight: 400 }}>
                        (niedriger = besser)
                      </span>
                    )}
                    {metric === 'sleep_duration' && (
                      <span style={{ fontSize: 11, color: '#888780', fontWeight: 400 }}>
                        (Optimum ~7,5 h)
                      </span>
                    )}
                    {edu && (
                      <button
                        type="button"
                        onClick={() => setOpenSliderTip(isTipOpen ? null : metric)}
                        aria-label={`Alltagstipp zu ${getMetricLabel(metric)}`}
                        aria-expanded={isTipOpen}
                        data-testid={`slider-tip-toggle-${metric}`}
                        style={{
                          display: 'inline-flex',
                          color: '#a3a29c',
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                        }}
                      >
                        <Info size={11} />
                      </button>
                    )}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: valueColor, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span>
                      {formatMetricValue(metric, v)}{' '}
                      <span style={{ color: '#888780', fontWeight: 400 }}>
                        {formatMetricUnit(metric, getMetricUnit(metric))}
                      </span>
                    </span>
                    {changed && metricDelta !== undefined && metricDelta !== 0 && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          color: metricDelta > 0 ? '#0f6e56' : '#c2410c',
                        }}
                      >
                        ({metricDelta > 0 ? '+' : ''}{metricDelta.toFixed(1)})
                      </span>
                    )}
                  </span>
                </div>
                {edu && isTipOpen && (
                  <div style={{
                    fontSize: 12,
                    color: '#55544f',
                    background: 'rgba(15,110,86,0.06)',
                    border: '1px solid rgba(15,110,86,0.15)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    marginBottom: 10,
                    lineHeight: 1.5,
                  }}>
                    {edu.sampleHabit}
                  </div>
                )}
                <div style={{ position: 'relative' }}>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={v}
                    onChange={(e) => onSliderChange(metric, Number(e.target.value))}
                    aria-label={getMetricLabel(metric)}
                    aria-valuemin={min}
                    aria-valuemax={max}
                    aria-valuenow={v}
                    aria-valuetext={`${formatMetricValue(metric, v)} ${formatMetricUnit(metric, getMetricUnit(metric))}`.trim()}
                  />
                  <div
                    data-testid={`marker-${metric}`}
                    title={hasActual ? `Ist-Wert: ${formatMetricValue(metric, actual)}` : `Kohortenmittelwert: ${formatMetricValue(metric, cohortMean)}`}
                    style={{
                      position: 'absolute',
                      top: -3,
                      left: `${markerPct}%`,
                      width: hasActual ? 2 : 0,
                      height: 10,
                      background: hasActual ? 'rgba(168,168,156,0.8)' : undefined,
                      borderLeft: hasActual ? undefined : '2px dashed rgba(168,168,156,0.6)',
                      borderRadius: 1,
                      pointerEvents: 'none',
                      transform: 'translateX(-50%)',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: '#a3a29c' }}>{formatMetricValue(metric, min)}</span>
                  <span style={{ fontSize: 11, color: '#a3a29c' }}>
                    {hasActual
                      ? `Ist: ${formatMetricValue(metric, actual)}`
                      : `Ø Kohorte: ${formatMetricValue(metric, cohortMean)} (kein Ist-Wert)`}
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
          {isError && (
            <div
              data-testid="simulate-error-indicator"
              role="alert"
              style={{
                margin: '0 0 16px',
                padding: '10px 14px',
                borderRadius: 12,
                background: 'rgba(163, 45, 45, 0.08)',
                border: '1px solid rgba(163, 45, 45, 0.22)',
                color: '#a32d2d',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
              }}
            >
              <span>Simulation nicht synchronisiert</span>
              <button
                type="button"
                data-testid="simulate-retry-btn"
                onClick={onRetry}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(163, 45, 45, 0.35)',
                  borderRadius: 6,
                  padding: '3px 8px',
                  color: '#a32d2d',
                  fontSize: 11,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Erneut versuchen
              </button>
            </div>
          )}
          <div style={{ textAlign: 'center', padding: '20px 0 24px' }}>
            <div
              data-testid="sim-score"
              style={{ fontSize: 64, fontWeight: 500, color: '#0f6e56', lineHeight: 1, letterSpacing: '-0.03em' }}
            >
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
  );
}
