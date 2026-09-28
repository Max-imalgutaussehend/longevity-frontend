import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, Copy } from 'lucide-react';
import { apiClient } from '../api/client.js';
import { Card, Btn, StatTile, PageTitle, Skeleton } from '../components/ui.js';

interface InsurerOverviewResponse {
  organizationName: string | null;
  joinCode: string | null;
  activeMemberCount: number;
  averageScore: number | null;
  averageCoverage: number | null;
  membersWithScoreCount: number;
}

export function Component() {
  const [copied, setCopied] = useState(false);
  const { data, isLoading } = useQuery<InsurerOverviewResponse>({
    queryKey: ['insurer-overview'],
    queryFn: () => apiClient('/insurer/overview'),
  });

  const copyJoinCode = async () => {
    if (!data?.joinCode) return;
    await navigator.clipboard?.writeText(data.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div>
        <PageTitle title="Übersicht" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 24 }}>
          <Skeleton height={120} />
          <Skeleton height={120} />
          <Skeleton height={120} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageTitle title="Übersicht" sub={data?.organizationName ?? undefined} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginTop: 24 }}>
        <StatTile
          label="Aktive Mitglieder"
          value={<span style={{ fontSize: 36, fontWeight: 500 }}>{data?.activeMemberCount ?? 0}</span>}
        />
        <StatTile
          label="Ø Vitalitätsscore"
          value={<span style={{ fontSize: 36, fontWeight: 500 }}>{data?.averageScore ?? '–'}</span>}
          sub={data?.membersWithScoreCount ? `Basierend auf ${data.membersWithScoreCount} Mitglied(ern) mit Score` : 'Noch keine Scores vorhanden'}
        />
        <StatTile
          label="Ø Datenabdeckung"
          value={<span style={{ fontSize: 36, fontWeight: 500 }}>{data?.averageCoverage != null ? `${Math.round(data.averageCoverage * 100)}%` : '–'}</span>}
        />
      </div>

      {data?.joinCode && (
        <Card style={{ marginTop: 24, padding: 20 }}>
          <div style={{ fontSize: 12, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Beitrittscode für Ihre Mitglieder
          </div>
          <p style={{ fontSize: 12, color: '#55544f', margin: '0 0 14px', lineHeight: 1.6 }}>
            Teilen Sie diesen Code mit Ihren Versicherten, damit sie ihr LONGEVITY-Konto direkt mit Ihrer Organisation verknüpfen können (Profil → Krankenkasse verknüpfen).
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <code
              data-testid="insurer-join-code"
              style={{
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: '0.08em',
                padding: '10px 16px',
                borderRadius: 10,
                background: 'rgba(29,158,117,0.08)',
                border: '1px solid rgba(29,158,117,0.25)',
                color: '#0f6e56',
              }}
            >
              {data.joinCode}
            </code>
            <Btn small variant="secondary" onClick={copyJoinCode} testId="copy-join-code-btn">
              {copied ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Check size={14} /> Kopiert</span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Copy size={14} /> Kopieren</span>
              )}
            </Btn>
          </div>
        </Card>
      )}

      <Card style={{ marginTop: 24, padding: 20 }}>
        <p style={{ fontSize: 12, color: '#a3a29c', margin: 0, lineHeight: 1.6 }}>
          Diese Übersicht zeigt ausschließlich aggregierte Kennzahlen über alle Mitglieder Ihrer Organisation. Individuelle Gesundheitsdaten einzelner Versicherter sind hier grundsätzlich nicht einsehbar.
        </p>
      </Card>
    </div>
  );
}
