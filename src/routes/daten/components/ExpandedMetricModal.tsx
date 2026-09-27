import { X } from 'lucide-react';
import { Modal, Btn } from '../../../components/ui.js';
import type { MetricSummary } from '../../../api/types.js';
import { SOURCE_BADGES } from '../datenTypes.js';
import { renderMetricIcon, renderSourceIcon, formatMetricVal } from '../datenUtils.js';

interface ExpandedMetricModalProps {
  metric: MetricSummary | null;
  selectedSource: string;
  onClose: () => void;
}

export function ExpandedMetricModal({
  metric,
  selectedSource,
  onClose,
}: ExpandedMetricModalProps) {
  if (!metric) return null;

  const filteredHistory =
    selectedSource === 'all'
      ? metric.history
      : metric.history.filter((h) => h.sourceKind === selectedSource);

  return (
    <Modal onClose={onClose}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', color: '#0f6e56' }}>
            {renderMetricIcon(metric.metric, 24)}
          </span>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#22221f' }}>{metric.label} – Gesamthistorie</div>
            <div style={{ fontSize: 12, color: '#a3a29c' }}>{metric.domainLabel}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Schließen"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a3a29c', display: 'flex', alignItems: 'center', padding: 4 }}
        >
          <X size={20} />
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          padding: '12px 16px',
          borderRadius: 8,
          background: 'rgba(29,158,117,0.06)',
          border: '1px solid rgba(29,158,117,0.15)',
          marginBottom: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: '#55544f' }}>Aktueller Wert</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#0f6e56' }}>
            {formatMetricVal(metric.metric, metric.latestValue)} {metric.unit}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: '#55544f' }}>Datenpunkte</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#22221f' }}>
            {selectedSource === 'all'
              ? `${metric.count} Einträge`
              : `${metric.history.filter((h) => h.sourceKind === selectedSource).length} Einträge (${
                  SOURCE_BADGES[selectedSource]?.label ?? selectedSource
                })`}
          </div>
        </div>
      </div>

      <div style={{ maxHeight: 380, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.08)', color: '#a3a29c', fontSize: 11, textTransform: 'uppercase' }}>
              <th style={{ padding: '8px 10px' }}>Datum</th>
              <th style={{ padding: '8px 10px' }}>Wert</th>
              <th style={{ padding: '8px 10px' }}>Quelle</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.map((h, i) => {
              const b = SOURCE_BADGES[h.sourceKind] ?? { label: h.sourceKind };
              return (
                <tr
                  key={h.id ?? i}
                  style={{
                    borderBottom: '1px solid rgba(0,0,0,0.04)',
                    background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.015)',
                  }}
                >
                  <td style={{ padding: '8px 10px', color: '#55544f', whiteSpace: 'nowrap' }}>
                    {new Date(h.measuredAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '8px 10px', fontWeight: 600, color: '#0f6e56' }}>
                    {formatMetricVal(metric.metric, h.value)}{' '}
                    <span style={{ fontWeight: 400, color: '#55544f', fontSize: 11 }}>{metric.unit}</span>
                  </td>
                  <td style={{ padding: '8px 10px', fontSize: 12, color: '#55544f' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      {renderSourceIcon(h.sourceKind, 12)} {b.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 20, textAlign: 'right' }}>
        <Btn onClick={onClose}>Schließen</Btn>
      </div>
    </Modal>
  );
}
