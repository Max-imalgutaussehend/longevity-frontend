import { useState, useRef, useMemo, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../api/client.js';
import { PageTitle } from '../components/ui.js';
import type { ScoreResult } from '../api/types.js';
import {
  type Lever,
  type SimResult,
  estimateBioAgeReduction,
  focusStorageKey,
  readFocusMetric,
  writeFocusMetric,
  METRIC_RANGE,
  METRIC_COHORT_MEAN,
  getScoreBand,
  extractActualMetricValues,
} from './hebel/hebelUtils.js';
import { LeverCardsSection } from './hebel/LeverCardsSection.js';
import { SimulatorSection } from './hebel/SimulatorSection.js';

// Re-export domain logic and constants for test and cross-module consumers
export {
  estimateBioAgeReduction,
  focusStorageKey,
  readFocusMetric,
  writeFocusMetric,
  METRIC_RANGE,
  METRIC_COHORT_MEAN,
  getScoreBand,
  extractActualMetricValues,
};
export type { Lever, SimResult };

/**
 * Hebel & Simulator page orchestrator.
 * Decomposed into LeverCardsSection and SimulatorSection under `./hebel/`.
 */
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <PageTitle
        title="Hebel & Simulator"
        sub="Die drei größten Hebel — berechnet aus einer realistisch erreichbaren Verbesserung (+0,5σ)."
      />

      <LeverCardsSection
        levers={levers}
        isLoading={leversLoading}
        score={score}
        focusMetric={focusMetric}
        onToggleFocus={toggleFocus}
      />

      <SimulatorSection
        actualValues={actualValues}
        vals={vals}
        simResult={simResult}
        baseScore={score?.score}
        baseBioAge={score?.bioAge}
        isError={simulateMut.isError}
        onSliderChange={handleSlider}
        onReset={reset}
        onRetry={() => simulateMut.mutate(vals)}
      />
    </div>
  );
}

export { Component as Hebel };
export default Component;
