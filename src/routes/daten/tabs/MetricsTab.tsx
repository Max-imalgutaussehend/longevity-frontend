import { useState } from 'react';
import { BarChart3, ShieldCheck } from 'lucide-react';
import { Card, Btn, Chip, Skeleton, GlassSelect, SectionLabel } from '../../../components/ui.js';
import type { Source, SamplesSummaryResponse, MetricSummary } from '../../../api/types.js';
import { SOURCE_BADGES } from '../datenTypes.js';
import { renderMetricIcon, renderSourceIcon, formatMetricVal, timeAgo, formatDate } from '../datenUtils.js';

export interface MetricsTabProps {
  summaryData?: SamplesSummaryResponse;
  isLoadingSummary: boolean;
  sources: Source[];
  selectedDomain: string;
  selectedSource: string;
  onSelectDomain: (domain: string) => void;
  onSelectSource: (source: string) => void;
  onExpandMetric: (metric: MetricSummary) => void;
  onNavigateSourcesTab: () => void;
}

export function MetricsTab({
  summaryData,
  isLoadingSummary,
  sources,
  selectedDomain,
  selectedSource,
  onSelectDomain,
  onSelectSource,
  onExpandMetric,
  onNavigateSourcesTab,
}: MetricsTabProps) {
  const [recentLimit, setRecentLimit] = useState(50);

  const filteredMetrics = (summaryData?.metrics ?? []).filter((m) => {
    if (selectedDomain !== 'all' && m.domain !== selectedDomain) return false;
    if (selectedSource !== 'all' && m.sourceKind !== selectedSource) return false;
    return true;
  });

  const filteredRecentSamples = (summaryData?.recentSamples ?? []).filter((s) => {
    if (selectedSource !== 'all' && s.sourceKind !== selectedSource) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <Card style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: 12, color: '#a3a29c', marginBottom: 4 }}>Gesamte Messpunkte</div>
          <div style={{ fontSize: 32, fontWeight: 500, color: '#0f6e56', letterSpacing: '-0.02em' }}>
            {summaryData?.totalCount ?? 0}
          </div>
          <div style={{ fontSize: 11, color: '#55544f', marginTop: 4 }}>Synchronisierte Datenpunkte</div>
        </Card>

        <Card style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: 12, color: '#a3a29c', marginBottom: 4 }}>Aktive Vitalparameter</div>
          <div style={{ fontSize: 32, fontWeight: 500, color: '#22221f', letterSpacing: '-0.02em' }}>
            {summaryData?.metrics.length ?? 0}
          </div>
          <div style={{ fontSize: 11, color: '#55544f', marginTop: 4 }}>Gemessene Metriken</div>
        </Card>

        <Card style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: 12, color: '#a3a29c', marginBottom: 4 }}>Kassen-verifizierte Quellen</div>
          <div style={{ fontSize: 32, fontWeight: 500, color: '#0f6e56', letterSpacing: '-0.02em' }}>
            {sources.filter((s) => s.enabled && ['withings', 'oura', 'strava', 'google-fit', 'google-health', 'fhir'].includes(s.adapter)).length}
          </div>
          <div style={{ fontSize: 11, color: '#55544f', marginTop: 4 }}>GKV / PKV zugelassen</div>
        </Card>

        {summaryData?.dateRange && (
          <Card style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: 12, color: '#a3a29c', marginBottom: 4 }}>Erfasster Zeitraum</div>
            <div style={{ fontSize: 16, fontWeight: 500, color: '#0f6e56', letterSpacing: '-0.01em', marginTop: 8 }}>
              {new Date(summaryData.dateRange.min).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })} –{' '}
              {new Date(summaryData.dateRange.max).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })}
            </div>
            <div style={{ fontSize: 11, color: '#55544f', marginTop: 4 }}>
              {Math.max(
                1,
                Math.round(
                  (new Date(summaryData.dateRange.max).getTime() - new Date(summaryData.dateRange.min).getTime()) /
                    (1000 * 60 * 60 * 24),
                ),
              )}{' '}
              Tage Historie
            </div>
          </Card>
        )}
      </div>

      {/* Kassen-Score coverage bar */}
      {summaryData && summaryData.metrics.length > 0 && (() => {
        const verifiedAdapters = ['oura', 'withings', 'strava', 'google_fit', 'google_health', 'fhir'];
        const verifiedCount = summaryData.metrics.filter((m) => verifiedAdapters.includes(m.sourceKind)).length;
        const total = summaryData.metrics.length;
        const pct = Math.round((verifiedCount / total) * 100);
        return (
          <div style={{
            padding: '12px 18px',
            borderRadius: 14,
            background: pct >= 50 ? 'rgba(29,158,117,0.06)' : 'rgba(238,108,43,0.06)',
            border: `1px solid ${pct >= 50 ? 'rgba(29,158,117,0.2)' : 'rgba(238,108,43,0.25)'}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#22221f' }}>
                <ShieldCheck size={14} color="#0f6e56" />
                Kassen-Abdeckung: {verifiedCount} von {total} Metriken kassenfähig ({pct} %)
              </div>
              <span style={{ fontSize: 11, color: '#55544f' }}>
                {pct < 50 ? 'Verbinde mehr verifizierte Quellen für ein stärkeres Kassen-Band.' : 'Gute Abdeckung für GKV / PKV.'}
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 99, background: 'rgba(0,0,0,0.05)' }}>
              <div style={{ height: '100%', borderRadius: 99, background: pct >= 50 ? '#1d9e75' : '#e57532', width: `${pct}%`, transition: 'width 0.6s ease' }} />
            </div>
          </div>
        );
      })()}

      {/* Filter Bar */}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'Alle Bereiche' },
            { id: 'activity', label: 'Aktivität' },
            { id: 'recovery', label: 'Regeneration' },
            { id: 'cardiometabolic', label: 'Kardiometabolik' },
            { id: 'risk', label: 'Risiko' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectDomain(cat.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                border: selectedDomain === cat.id ? '1px solid rgba(29,158,117,0.4)' : '1px solid rgba(0,0,0,0.08)',
                background: selectedDomain === cat.id ? 'rgba(29,158,117,0.12)' : 'rgba(255,255,255,0.6)',
                color: selectedDomain === cat.id ? '#0f6e56' : '#55544f',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#55544f' }}>Quelle:</span>
          <GlassSelect
            options={[
              { value: 'all', label: 'Alle Quellen' },
              { value: 'google_fit', label: 'Google Health' },
              { value: 'apple_health', label: 'Apple Health' },
              { value: 'lab', label: 'Labor' },
              { value: 'manual', label: 'Manuell' },
            ]}
            value={selectedSource}
            onChange={onSelectSource}
          />
        </div>
      </div>

      {/* Metrics Cards Grid */}
      {isLoadingSummary ? (
        <div className="responsive-grid-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <Skeleton height={140} />
            </Card>
          ))}
        </div>
      ) : !filteredMetrics || filteredMetrics.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
          <BarChart3 size={40} color="#888780" style={{ margin: '0 auto 12px', display: 'block' }} />
          <div style={{ fontSize: 16, fontWeight: 500, color: '#22221f', marginBottom: 8 }}>
            Keine Messwerte für diese Auswahl vorhanden
          </div>
          <p style={{ fontSize: 13, color: '#55544f', maxWidth: 460, margin: '0 auto 20px', lineHeight: 1.5 }}>
            Verbinde eine Datenquelle (z. B. Google Health oder Apple Health) im Reiter &quot;Quellen &amp; Wearables&quot;, um
            deine Vitaldaten automatisch zu importieren.
          </p>
          <Btn onClick={onNavigateSourcesTab}>Zu den Datenquellen</Btn>
        </Card>
      ) : (
        <div className="responsive-grid-2">
          {filteredMetrics.map((m) => {
            const badge = SOURCE_BADGES[m.sourceKind] ?? { label: m.sourceKind };
            return (
              <Card
                key={m.metric}
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 20 }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center' }}>{renderMetricIcon(m.metric, 24)}</span>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 500, color: '#22221f' }}>{m.label}</div>
                        <div style={{ fontSize: 11, color: '#a3a29c' }}>{m.domainLabel}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <Chip color="teal">
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          {renderSourceIcon(m.sourceKind, 13)}
                          <span>{badge.label}</span>
                        </span>
                      </Chip>
                      {['oura', 'withings', 'strava', 'google_fit', 'google_health', 'fhir'].includes(m.sourceKind) ? (
                        <span style={{ fontSize: 10, color: '#0f6e56', fontWeight: 500, letterSpacing: '0.01em', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                          <ShieldCheck size={11} color="#0f6e56" />
                          Kassen-verifiziert
                        </span>
                      ) : (
                        <span style={{ fontSize: 10, color: '#888780' }}>
                          Nicht kassenfähig
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '14px 0 6px' }}>
                    <span
                      style={{ fontSize: 36, fontWeight: 500, color: '#0f6e56', letterSpacing: '-0.02em', lineHeight: 1 }}
                    >
                      {formatMetricVal(m.metric, m.latestValue)}
                    </span>
                    <span style={{ fontSize: 14, color: '#55544f' }}>{m.unit}</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: 12,
                      color: '#55544f',
                      marginTop: 10,
                    }}
                  >
                    <span>
                      Letzter Wert: <strong>{timeAgo(m.latestMeasuredAt)}</strong> ({formatDate(m.latestMeasuredAt)})
                    </span>
                    <span style={{ color: '#a3a29c' }}>
                      {m.count} {m.count === 1 ? 'Eintrag' : 'Einträge'}
                    </span>
                  </div>
                </div>

                {/* Recent History Mini Points */}
                {m.history && m.history.length > 1 && (
                  <div style={{ paddingTop: 14, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 8,
                        flexWrap: 'wrap',
                        gap: 6,
                      }}
                    >
                      <div style={{ fontSize: 11, color: '#a3a29c' }}>Letzte Tage:</div>
                      <button
                        type="button"
                        onClick={() => onExpandMetric(m)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#0f6e56',
                          fontSize: 11,
                          fontWeight: 500,
                          cursor: 'pointer',
                          padding: 0,
                          textDecoration: 'underline',
                        }}
                      >
                        Gesamten Verlauf ({m.count} Einträge) ansehen →
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {m.history.slice(0, 7).map((h, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: 'rgba(0,0,0,0.03)',
                            border: '1px solid rgba(0,0,0,0.06)',
                            fontSize: 11,
                            color: '#22221f',
                          }}
                        >
                          {new Date(h.measuredAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}:{' '}
                          <strong>{formatMetricVal(m.metric, h.value)}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Activity Log / Table */}
      {summaryData?.recentSamples && summaryData.recentSamples.length > 0 && (
        <Card>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <SectionLabel>Messwert-Protokoll</SectionLabel>
              <div style={{ fontSize: 12, color: '#55544f', marginTop: 2 }}>
                Chronologische Liste der synchronisierten Einzelmessungen
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: '#a3a29c' }}>
                {Math.min(filteredRecentSamples.length, recentLimit)} von {filteredRecentSamples.length} Messungen
              </span>
              <div style={{ display: 'flex', gap: 4 }}>
                {[50, 100, 200].map((lim) => (
                  <button
                    key={lim}
                    type="button"
                    onClick={() => setRecentLimit(lim)}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: recentLimit === lim ? 600 : 400,
                      border: recentLimit === lim ? '1px solid rgba(29,158,117,0.4)' : '1px solid rgba(0,0,0,0.08)',
                      background: recentLimit === lim ? 'rgba(29,158,117,0.1)' : 'transparent',
                      color: recentLimit === lim ? '#0f6e56' : '#55544f',
                      cursor: 'pointer',
                    }}
                  >
                    {lim}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid rgba(0,0,0,0.08)',
                    color: '#a3a29c',
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  <th style={{ padding: '10px 12px' }}>Zeitpunkt</th>
                  <th style={{ padding: '10px 12px' }}>Parameter</th>
                  <th style={{ padding: '10px 12px' }}>Messwert</th>
                  <th style={{ padding: '10px 12px' }}>Quelle</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecentSamples.slice(0, recentLimit).map((s, idx) => {
                  const badge = SOURCE_BADGES[s.sourceKind] ?? { label: s.sourceKind };
                  return (
                    <tr
                      key={s.id ?? idx}
                      style={{
                        borderBottom: '1px solid rgba(0,0,0,0.04)',
                        background: idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.015)',
                      }}
                    >
                      <td style={{ padding: '10px 12px', color: '#55544f', whiteSpace: 'nowrap' }}>
                        {formatDate(s.measuredAt)}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#22221f', fontWeight: 500 }}>
                        <span style={{ marginRight: 6, display: 'inline-flex', verticalAlign: 'middle' }}>
                          {renderMetricIcon(s.metric, 16)}
                        </span>{' '}
                        {s.label}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#0f6e56', fontWeight: 600 }}>
                        {formatMetricVal(s.metric, s.value)}{' '}
                        <span style={{ fontWeight: 400, color: '#55544f', fontSize: 12 }}>{s.unit}</span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            fontSize: 12,
                            padding: '3px 8px',
                            borderRadius: 999,
                            background: 'rgba(29,158,117,0.08)',
                            color: '#0f6e56',
                            border: '1px solid rgba(29,158,117,0.18)',
                          }}
                        >
                          {renderSourceIcon(s.sourceKind, 13)} {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
