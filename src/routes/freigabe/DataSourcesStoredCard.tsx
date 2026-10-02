import { ShieldCheck } from 'lucide-react';
import { Card, SectionLabel, Chip, Skeleton, Btn } from '../../components/ui.js';
import { getSourceLabel } from '../../lib/formatters.js';
import type { Source } from '../../api/types.js';
import { VERIFIED_ADAPTERS } from './freigabeTypes.js';

interface DataSourcesStoredCardProps {
  sources: Source[] | undefined;
  isLoading: boolean;
  isExporting: boolean;
  isExportError: boolean;
  onExport: () => void;
  onRequestDeleteAccount: () => void;
}

export function DataSourcesStoredCard({
  sources,
  isLoading,
  isExporting,
  isExportError,
  onExport,
  onRequestDeleteAccount,
}: DataSourcesStoredCardProps) {
  return (
    <Card>
      <SectionLabel>Was gespeichert ist</SectionLabel>
      {isLoading ? (
        <Skeleton height={120} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {sources?.filter((s) => s.enabled || s.sampleCount > 0).map((s, i) => {
            const isMock = s.adapter === 'mock';
            const isUnverified = ['upload', 'manual', 'questionnaire'].includes(s.adapter);
            const isVerified = (VERIFIED_ADAPTERS as readonly string[]).includes(s.adapter) && s.enabled;

            return (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 0',
                  borderTop: i === 0 ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, color: '#22221f', fontWeight: 500 }}>
                    {getSourceLabel(s.kind)}
                  </span>
                  {isMock && <Chip color="amber">Mock · Für Kassenrabatte ausgeschlossen</Chip>}
                  {isUnverified && <Chip color="neutral">Manuell · Nicht kassenfähig</Chip>}
                  {isVerified && (
                    <Chip color="teal">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <ShieldCheck size={12} />
                        Kassen-verifiziert
                      </span>
                    </Chip>
                  )}
                  {!s.enabled && !isMock && <Chip color="neutral">Deaktiviert</Chip>}
                </div>
                <span style={{ fontSize: 12, color: '#888780' }}>
                  {s.sampleCount.toLocaleString('de-DE')} Werte ·{' '}
                  {s.lastSyncAt ? new Date(s.lastSyncAt).toLocaleDateString('de-DE') : 'Noch nie'}
                </span>
              </div>
            );
          })}
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
        <Btn variant="secondary" small onClick={onExport} testId="export-account-btn">
          {isExporting ? 'Exportiere…' : 'Alle Daten exportieren'}
        </Btn>
        <Btn variant="danger" small onClick={onRequestDeleteAccount}>
          Konto löschen
        </Btn>
      </div>
      {isExportError && (
        <div style={{ fontSize: 12, color: '#a32d2d', marginTop: 10 }}>
          Export fehlgeschlagen. Bitte erneut versuchen.
        </div>
      )}
    </Card>
  );
}
