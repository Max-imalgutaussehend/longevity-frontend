import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client.js';
import { Card, PageTitle, PercentileBar, Skeleton } from '../components/ui.js';
import type { ScoreResult } from '../api/types.js';

const DOMAIN_LABELS: Record<string, string> = {
  cardiometabolic: 'Kardiometabolik',
  recovery: 'Regeneration',
  activity: 'Aktivität',
  risk: 'Risiko',
};

const METRIC_LABELS: Record<string, string> = {
  vo2max: 'VO₂max', resting_hr: 'Ruhepuls', systolic_bp: 'Systol. Blutdruck',
  ldl: 'LDL-Cholesterin', hdl: 'HDL-Cholesterin', hba1c: 'HbA1c', waist: 'Taillenumfang',
  sleep_duration: 'Schlafdauer', sleep_consistency: 'Schlafkonsistenz', hrv_rmssd: 'HRV (RMSSD)',
  zone2_minutes: 'Zone-2-Minuten', steps: 'Schritte', strength_sessions: 'Krafteinheiten',
  smoking: 'Rauchen', alcohol_units: 'Alkohol', hscrp: 'hsCRP',
};

export function Component() {
  const navigate = useNavigate();
  const { data: score, isLoading } = useQuery<ScoreResult>({
    queryKey: ['score', 'current'],
    queryFn: () => apiClient<ScoreResult>('/score/current'),
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <PageTitle
        title="Score-Aufschlüsselung"
        sub={score ? `Fehlende Werte ziehen den Score zur Kohortenmitte (50), nicht nach unten. Abdeckung: ${Math.round(score.coverage * 100)} %.` : ''}
      />

      {isLoading ? (
        [1, 2, 3, 4].map((i) => <Card key={i}><Skeleton height={200} /></Card>)
      ) : !score ? (
        <Card>
          <p style={{ color: '#888780', fontSize: 14 }}>Kein Score vorhanden.</p>
        </Card>
      ) : (
        [...score.domains].sort((a, b) => b.weight - a.weight).map((domain) => (
          <Card key={domain.domain}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 500, color: '#22221f' }}>{DOMAIN_LABELS[domain.domain] ?? domain.domain}</div>
                <div style={{ fontSize: 12, color: '#888780', marginTop: 2 }}>Gewicht {Math.round(domain.weight * 100)} %</div>
              </div>
              <span style={{ fontSize: 28, fontWeight: 500, color: domain.score < 50 ? '#854f0b' : '#0f6e56', letterSpacing: '-0.01em' }}>
                {domain.score.toFixed(0)}
              </span>
            </div>

            <div>
              {domain.metrics.map((m, i) => (
                <div
                  key={m.metric}
                  className="responsive-metric-row"
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 140px 100px 64px',
                    alignItems: 'center', gap: 20, padding: '14px 0',
                    borderTop: i === 0 ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(0,0,0,0.04)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, color: m.available ? '#22221f' : '#a3a29c' }}>
                      {METRIC_LABELS[m.metric] ?? m.metric}
                      {!m.available && <span style={{ marginLeft: 8, fontSize: 11, color: '#a3a29c' }}>kein Wert</span>}
                    </div>
                    {m.available && m.value !== null && (
                      <div style={{ fontSize: 12, color: '#888780', marginTop: 2 }}>
                        {m.value} {m.unit}
                        {m.ageDays !== null && (
                          <span style={{ marginLeft: 6, color: m.ageDays > 180 ? '#854f0b' : '#a3a29c' }}>
                            · {m.ageDays}d alt
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <PercentileBar p={m.percentile} />

                  <div style={{ fontSize: 12, color: '#888780' }}>
                    {m.available
                      ? m.ageDays !== null
                        ? `Frische ${Math.max(0, Math.round((1 - m.ageDays / 365) * 100))} %`
                        : 'Aktuell'
                      : (
                        <button
                          onClick={() => navigate('/daten')}
                          style={{ fontSize: 12, color: '#0f6e56', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}
                        >
                          + Eintragen
                        </button>
                      )}
                  </div>

                  <div style={{ fontSize: 13, fontWeight: 500, textAlign: 'right', color: !m.available ? '#a3a29c' : m.contribution > 0 ? '#0f6e56' : '#a32d2d' }}>
                    {m.available ? (m.contribution > 0 ? '+' : '') + m.contribution.toFixed(1) : '—'}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
