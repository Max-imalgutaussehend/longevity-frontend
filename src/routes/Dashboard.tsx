import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { apiClient } from '../api/client.js';
import { Card, Skeleton } from '../components/ui.js';
import { OnboardingCard } from '../components/OnboardingCard.js';
import type { ScoreResult } from '../api/types.js';

interface HistoryPoint { date: string; score: number; coverage: number; }
interface Lever { metric: string; currentValue: number | null; targetValue: number; delta: number; horizonWeeks: number; }

const DOMAIN_LABELS: Record<string, string> = {
  cardiometabolic: 'Kardiometabolik',
  recovery: 'Regeneration',
  activity: 'Aktivität',
  risk: 'Risiko',
};

export function Component() {
  const navigate = useNavigate();
  const { data: score, isLoading: scoreLoading } = useQuery<ScoreResult>({
    queryKey: ['score', 'current'],
    queryFn: () => apiClient<ScoreResult>('/score/current'),
  });
  const { data: history, isLoading: histLoading } = useQuery<HistoryPoint[]>({
    queryKey: ['score', 'history'],
    queryFn: () => apiClient<HistoryPoint[]>('/score/history?days=90'),
  });
  const { data: levers } = useQuery<Lever[]>({
    queryKey: ['score', 'levers'],
    queryFn: () => apiClient<Lever[]>('/score/levers'),
  });

  const topLever = levers?.[0];
  const loading = scoreLoading || histLoading;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Guided Onboarding ── */}
      <OnboardingCard />

      {/* ── Score Hero ── */}
      <Card className="score-hero-card">
        {loading ? (
          <div className="responsive-score-hero">
            <Skeleton width={160} height={72} />
            <div />
            <Skeleton width={80} height={60} />
            <Skeleton width={80} height={40} />
            <Skeleton width={80} height={60} />
          </div>
        ) : !score ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 48, fontWeight: 500, color: '#0f6e56', lineHeight: 1 }}>50.0</div>
            <p style={{ fontSize: 14, color: '#888780', margin: '16px 0' }}>Ohne Daten gilt der Kohortenmittelwert.</p>
            <button onClick={() => navigate('/daten')} style={{ fontSize: 13, color: '#0f6e56', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              Datenquelle verbinden →
            </button>
          </div>
        ) : (
          <>
            <div className="responsive-score-hero">
              <div>
                <div style={{ fontSize: 12, color: '#a3a29c', marginBottom: 8 }}>Vitalitätsscore</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
                  <span data-testid="score-value" className="score-hero-value" style={{ fontSize: 72, fontWeight: 500, color: '#0f6e56', lineHeight: 1, letterSpacing: '-0.03em' }}>
                    {score.score.toFixed(1)}
                  </span>
                </div>
              </div>
              <div />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#a3a29c', marginBottom: 6 }}>Vitalitätsalter</div>
                <div data-testid="bio-age" style={{ fontSize: 36, fontWeight: 500, color: '#22221f', letterSpacing: '-0.02em', lineHeight: 1 }}>{Math.round(score.bioAge)}</div>
                <div style={{ fontSize: 11, color: '#a3a29c', marginTop: 4 }}>chron. {Math.round(score.chronoAge)}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#a3a29c', marginBottom: 10 }}>Score-Band</div>
                <span style={{ padding: '5px 16px', borderRadius: 999, background: 'rgba(29,158,117,0.10)', color: '#0f6e56', fontSize: 16, fontWeight: 500, border: '1px solid rgba(29,158,117,0.18)' }}>
                  {score.band.low}–{score.band.high}
                </span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#a3a29c', marginBottom: 6 }}>Abdeckung</div>
                <div style={{ fontSize: 36, fontWeight: 500, color: '#22221f', letterSpacing: '-0.02em', lineHeight: 1 }}>{Math.round(score.coverage * 100)} %</div>
              </div>
            </div>
            <div style={{ marginTop: 28, height: 3, borderRadius: 99, background: 'rgba(0,0,0,0.05)' }}>
              <div style={{ height: '100%', borderRadius: 99, background: '#1d9e75', width: `${score.score}%`, transition: 'width 0.8s ease' }} />
            </div>
          </>
        )}
      </Card>

      {/* ── Trend Chart ── */}
      <Card data-testid="trend-chart" style={{ padding: '28px 36px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 13, color: '#55544f' }}>Verlauf · 90 Tage</span>
          <span style={{ fontSize: 12, color: '#a3a29c' }}>
            {history && history.length > 0 ? `${history[0].date} – ${history[history.length - 1].date}` : ''}
          </span>
        </div>
        {histLoading ? (
          <Skeleton height={150} />
        ) : !history || history.length < 7 ? (
          <div style={{ height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a3a29c', fontSize: 13 }}>
            Noch nicht genug Daten für einen Verlauf.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={history} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#a3a29c' }} tickLine={false} axisLine={false} interval={14} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#a3a29c' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: 'rgba(255,255,255,0.90)', backdropFilter: 'blur(16px)', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 10, fontSize: 12, padding: '8px 14px' }}
                formatter={(v: number, _: string, props: { payload?: { coverage?: number } }) => [
                  `${v.toFixed(1)}  ·  Abdeckung ${((props?.payload?.coverage ?? 0) * 100).toFixed(0)} %`, 'Score',
                ]}
              />
              <Line type="monotone" dataKey="score" stroke="#1d9e75" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#1d9e75', strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* ── Domains + Sidebar ── */}
      <div className="responsive-grid-sidebar">
        <Card>
          <div style={{ fontSize: 13, color: '#55544f', marginBottom: 20 }}>Domänen</div>
          {scoreLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} height={32} />)}
            </div>
          ) : score ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[...score.domains].sort((a, b) => b.weight - a.weight).map((d) => (
                <div key={d.domain}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                    <span style={{ fontSize: 13, color: '#22221f' }}>
                      {DOMAIN_LABELS[d.domain] ?? d.domain}
                      <span style={{ fontSize: 11, color: '#a3a29c', marginLeft: 6 }}>{Math.round(d.weight * 100)} %</span>
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: d.score < 50 ? '#854f0b' : '#22221f' }}>
                      {d.score.toFixed(0)}
                    </span>
                  </div>
                  <div style={{ height: 4, borderRadius: 99, background: 'rgba(0,0,0,0.05)' }}>
                    <div style={{ height: '100%', borderRadius: 99, background: d.score < 50 ? '#c17826' : '#1d9e75', width: `${d.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Top Lever */}
          <Card style={{ flex: 1, padding: '24px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: '#a3a29c' }}>Stärkster Hebel</span>
              <button onClick={() => navigate('/hebel')} style={{ fontSize: 12, color: '#0f6e56', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                Alle →
              </button>
            </div>
            {topLever ? (
              <>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#22221f', margin: '10px 0 6px' }}>{topLever.metric}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginTop: 16 }}>
                  <span style={{ fontSize: 26, fontWeight: 500, color: '#0f6e56' }}>+{topLever.delta.toFixed(1)}</span>
                  <span style={{ fontSize: 12, color: '#a3a29c' }}>Punkte · {topLever.horizonWeeks} Wo.</span>
                </div>
              </>
            ) : (
              <div style={{ fontSize: 13, color: '#a3a29c', marginTop: 12 }}>Mehr Daten für Hebel-Vorschläge nötig.</div>
            )}
          </Card>

          {/* Band progress */}
          {score && (
            <Card style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: 12, color: '#a3a29c', marginBottom: 8 }}>Band {score.band.low}–{score.band.high}</div>
              <div style={{ height: 4, borderRadius: 99, background: 'rgba(0,0,0,0.05)', marginBottom: 6 }}>
                <div style={{ height: '100%', borderRadius: 99, background: '#1d9e75', width: `${((score.score - score.band.low) / 10) * 100}%` }} />
              </div>
              <div style={{ fontSize: 12, color: '#55544f' }}>
                Noch <strong style={{ color: '#0f6e56' }}>{(score.band.high + 1 - score.score).toFixed(1)} Pkt.</strong> bis Band {score.band.high + 1}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
