import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../api/client.js';
import { Check } from 'lucide-react';
import { Card, PageTitle, Btn, StatTile, SectionLabel, Skeleton } from '../components/ui.js';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface WeeklyReport {
  weekStart: string; scoreStart: number; scoreEnd: number; delta: number;
  bestMetric: string; worstMetric: string; streakDays: number;
}

interface HistoryPoint { date: string; score: number; coverage: number; }

const METRIC_LABELS: Record<string, string> = {
  vo2max: 'VO₂max', resting_hr: 'Ruhepuls', systolic_bp: 'Blutdruck',
  ldl: 'LDL', hdl: 'HDL', hba1c: 'HbA1c', waist: 'Taillenumfang',
  sleep_duration: 'Schlafdauer', sleep_consistency: 'Schlafkonsistenz', hrv_rmssd: 'HRV',
  zone2_minutes: 'Zone-2-Minuten', steps: 'Schritte', strength_sessions: 'Krafteinheiten',
  smoking: 'Rauchen', alcohol_units: 'Alkohol', hscrp: 'hsCRP',
};

export function Component() {
  const { data: report, isLoading } = useQuery<WeeklyReport>({
    queryKey: ['report', 'weekly'],
    queryFn: () => apiClient<WeeklyReport>('/report/weekly'),
  });
  const { data: history } = useQuery<HistoryPoint[]>({
    queryKey: ['score', 'history'],
    queryFn: () => apiClient<HistoryPoint[]>('/score/history?days=90'),
  });

  const sendMut = useMutation({
    mutationFn: () => apiClient('/report/send', { method: 'POST' }),
  });

  const weekData = history?.slice(-7) ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <PageTitle
        title="Wochenbericht"
        sub={report ? `${new Date(report.weekStart).toLocaleDateString('de-DE')} – ${new Date(Date.now() - 86400000).toLocaleDateString('de-DE')}` : ''}
      />

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} height={100} />)}
        </div>
      ) : report ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <StatTile
              label="Score Wochenanfang"
              value={<span style={{ fontSize: 38, fontWeight: 500, letterSpacing: '-0.02em', color: '#22221f' }}>{report.scoreStart.toFixed(1)}</span>}
            />
            <StatTile
              label="Score Wochenende"
              value={<span style={{ fontSize: 38, fontWeight: 500, letterSpacing: '-0.02em', color: '#22221f' }}>{report.scoreEnd.toFixed(1)}</span>}
            />
            <StatTile
              label="Veränderung"
              value={<span style={{ fontSize: 38, fontWeight: 500, letterSpacing: '-0.02em', color: report.delta >= 0 ? '#0f6e56' : '#a32d2d' }}>{report.delta >= 0 ? '+' : ''}{report.delta.toFixed(1)}</span>}
              unit="Punkte"
            />
            <StatTile
              label="Daten-Streak"
              value={<span style={{ fontSize: 38, fontWeight: 500, letterSpacing: '-0.02em', color: '#22221f' }}>{report.streakDays}</span>}
              unit="Tage"
              sub={report.streakDays === 0 ? 'Kein aktiver Streak' : undefined}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Card>
              <SectionLabel>Beste Metrik</SectionLabel>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', background: 'rgba(29,158,117,0.07)', borderRadius: 12, border: '1px solid rgba(29,158,117,0.15)' }}>
                <span style={{ fontSize: 22, opacity: 0.7 }}>↑</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#0f6e56' }}>
                    {METRIC_LABELS[report.bestMetric] ?? report.bestMetric}
                  </div>
                </div>
              </div>
            </Card>
            <Card>
              <SectionLabel>Schwächste Metrik</SectionLabel>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', background: 'rgba(133,79,11,0.06)', borderRadius: 12, border: '1px solid rgba(133,79,11,0.15)' }}>
                <span style={{ fontSize: 22, opacity: 0.7 }}>↓</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#854f0b' }}>
                    {METRIC_LABELS[report.worstMetric] ?? report.worstMetric}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </>
      ) : (
        <Card><p style={{ color: '#888780', fontSize: 14 }}>Noch keine Wochendaten vorhanden.</p></Card>
      )}

      {weekData.length > 0 && (
        <Card style={{ padding: '28px 32px 16px' }}>
          <SectionLabel>Score-Verlauf der Woche</SectionLabel>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={weekData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#a3a29c' }} tickLine={false} axisLine={false} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#a3a29c' }} tickLine={false} axisLine={false} />
              <Line type="monotone" dataKey="score" stroke="#1d9e75" strokeWidth={2.5} dot={{ r: 4, fill: '#1d9e75', strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Btn onClick={() => sendMut.mutate()}>
          {sendMut.isPending ? 'Wird gesendet…' : sendMut.isSuccess ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              E-Mail gesendet <Check size={16} />
            </span>
          ) : 'Als E-Mail senden'}
        </Btn>
      </div>
    </div>
  );
}
