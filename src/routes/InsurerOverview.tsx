import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client.js';
import { Card, StatTile, PageTitle, Skeleton } from '../components/ui.js';

interface InsurerOverviewResponse {
  organizationName: string | null;
  activeMemberCount: number;
  averageScore: number | null;
  averageCoverage: number | null;
  membersWithScoreCount: number;
}

export function Component() {
  const { data, isLoading } = useQuery<InsurerOverviewResponse>({
    queryKey: ['insurer-overview'],
    queryFn: () => apiClient('/insurer/overview'),
  });

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

      <Card style={{ marginTop: 24, padding: 20 }}>
        <p style={{ fontSize: 12, color: '#a3a29c', margin: 0, lineHeight: 1.6 }}>
          Diese Übersicht zeigt ausschließlich aggregierte Kennzahlen über alle Mitglieder Ihrer Organisation. Individuelle Gesundheitsdaten einzelner Versicherter sind hier grundsätzlich nicht einsehbar.
        </p>
      </Card>
    </div>
  );
}
