import { useState, useRef, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  getMetricCohortMean,
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
  getMetricCohortMean,
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
  const { data: me } = useQuery<{ id: string; chronoAge?: number; sex?: string }>({
    queryKey: ['me'],
    queryFn: () => apiClient('/me'),
  });

  const actualValues = useMemo(() => extractActualMetricValues(score, levers), [score, levers]);

  const [vals, setVals] = useState<Record<string, number>>({});
  const [simResult, setSimResult] = useState<SimResult | null>(null);
  const [isError, setIsError] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const latestRequestIdRef = useRef<number>(0);
  const [focusMetric, setFocusMetric] = useState<string | null>(null);

  useEffect(() => {
    if (me?.id) setFocusMetric(readFocusMetric(me.id));
  }, [me?.id]);

  function toggleFocus(metric: string) {
    const next = focusMetric === metric ? null : metric;
    setFocusMetric(next);
    writeFocusMetric(me?.id, next);
  }

  function executeSimulation(overrides: Record<string, number>) {
    if (Object.keys(overrides).length === 0) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      setIsError(false);
      setSimResult(null);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const currentRequestId = ++latestRequestIdRef.current;

    apiClient<SimResult>('/score/simulate', {
      method: 'POST',
      body: JSON.stringify({ overrides }),
      signal: controller.signal,
    })
      .then((data) => {
        if (currentRequestId === latestRequestIdRef.current) {
          setSimResult(data);
          setIsError(false);
        }
      })
      .catch((err) => {
        if (err?.name === 'AbortError' || controller.signal.aborted) {
          return;
        }
        if (currentRequestId === latestRequestIdRef.current) {
          setIsError(true);
        }
      });
  }

  function handleSlider(metric: string, value: number) {
    const actual = actualValues[metric];
    const hasActual = actual !== null && actual !== undefined;
    const cohortMean = getMetricCohortMean(metric, score?.chronoAge ?? me?.chronoAge, me?.sex);
    const baseVal = hasActual ? actual : (cohortMean ?? 0);

    const next = { ...vals };
    if (value === baseVal) {
      delete next[metric];
    } else {
      next[metric] = value;
    }

    setVals(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      executeSimulation(next);
    }, 200);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  function reset() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsError(false);
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
        chronoAge={score?.chronoAge ?? me?.chronoAge}
        sex={me?.sex}
        isError={isError}
        onSliderChange={handleSlider}
        onReset={reset}
        onRetry={() => executeSimulation(vals)}
      />
    </div>
  );
}

export { Component as Hebel };
export default Component;
