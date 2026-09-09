import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client.js';
import type { ScoreResult } from '../api/generated.js';

export function Component() {
  const { data: score, isLoading, error } = useQuery<ScoreResult>({
    queryKey: ['score', 'current'],
    queryFn: () => apiClient<ScoreResult>('/score/current'),
  });

  if (isLoading) return <div style={{ color: 'var(--neutral-400)' }}>Lade Score…</div>;
  if (error) return <div>Score konnte nicht geladen werden. <button onClick={() => window.location.reload()}>Erneut versuchen</button></div>;
  if (!score) return <div>Kein Score vorhanden. Bitte eine Datenquelle verbinden.</div>;

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 500, margin: '0 0 24px' }}>Dashboard</h1>
      <div style={{
        background: 'var(--neutral-0)', border: '1px solid var(--neutral-200)',
        borderRadius: 10, padding: 24, marginBottom: 24,
      }}>
        <div style={{ fontSize: 12, color: 'var(--neutral-500)', marginBottom: 4 }}>Longevity Score</div>
        <div style={{ fontSize: 56, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--accent-600)', lineHeight: 1 }}>
          {score.score.toFixed(1)}
        </div>
        <div style={{ fontSize: 12, color: 'var(--neutral-500)', marginTop: 8 }}>
          Vitalitätsalter {score.bioAge.toFixed(1)} · Band {score.band.low}–{score.band.high} · Abdeckung {Math.round(score.coverage * 100)} %
        </div>
      </div>
    </div>
  );
}
